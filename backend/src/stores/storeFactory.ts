// ===== JanSathi AI — Rate Limiter Store Factory =====
// Environment-driven store selection with auto-fallback.
//
// Config:
//   RATE_LIMITER=memory|redis   (default: auto — Redis if REDIS_URL set)
//   REDIS_URL=redis://localhost:6379
//   REDIS_PREFIX=jansathi        (key namespace, default: "jansathi")
//
// Fallback: If RATE_LIMITER=redis but Redis fails to connect,
// auto-degrades to MemoryStore with warning log.

import logger from "../utils/logger";

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

// Async interface — both MemoryStore and RedisStore implement this
export interface IRateLimiterStore {
    get(key: string): Promise<RateLimitRecord | undefined>;
    set(key: string, record: RateLimitRecord): Promise<void>;
    delete(key: string): Promise<void>;
}

// ── In-memory fallback (always available) ───────────────────
export class MemoryStore implements IRateLimiterStore {
    private map = new Map<string, RateLimitRecord>();
    private cleanupInterval: ReturnType<typeof setInterval>;

    constructor(cleanupMs = 60_000) {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, record] of this.map.entries()) {
                if (now > record.resetTime) this.map.delete(key);
            }
        }, cleanupMs);

        // Prevent cleanup timer from blocking Node exit
        if (this.cleanupInterval.unref) {
            this.cleanupInterval.unref();
        }
    }

    async get(key: string): Promise<RateLimitRecord | undefined> {
        return this.map.get(key);
    }

    async set(key: string, record: RateLimitRecord): Promise<void> {
        this.map.set(key, record);
    }

    async delete(key: string): Promise<void> {
        this.map.delete(key);
    }

    /** Exposed for testing — number of active entries */
    get size(): number {
        return this.map.size;
    }
}

// ── Factory ─────────────────────────────────────────────────
export function createStore(): IRateLimiterStore {
    const mode = (process.env.RATE_LIMITER || "auto").toLowerCase();
    const redisUrl = process.env.REDIS_URL || "";

    // Explicit "memory" — skip Redis entirely
    if (mode === "memory") {
        logger.info("ratelimiter.store.memory", { reason: "RATE_LIMITER=memory" });
        return new MemoryStore();
    }

    // "redis" or "auto" (with REDIS_URL present) — try Redis
    if (mode === "redis" || (mode === "auto" && redisUrl)) {
        if (!redisUrl) {
            logger.warn("ratelimiter.store.fallback", {
                reason: "RATE_LIMITER=redis but REDIS_URL not set — falling back to memory",
            });
            return new MemoryStore();
        }

        try {
            const { RedisStore } = require("./RedisStore");
            const store = new RedisStore(redisUrl);
            logger.info("ratelimiter.store.redis", {
                url: redisUrl.replace(/\/\/.*@/, "//<redacted>@"),
                prefix: process.env.REDIS_PREFIX || "jansathi",
            });
            return store;
        } catch (err) {
            logger.error("ratelimiter.store.redis_init_failed", {
                error: err instanceof Error ? err.message : String(err),
                fallback: "memory",
            });
            return new MemoryStore();
        }
    }

    // Default: memory
    logger.info("ratelimiter.store.memory", { note: "Set REDIS_URL + RATE_LIMITER=redis for distributed rate limiting" });
    return new MemoryStore();
}
