// ===== JanSathi AI — Rate Limiter Store Factory =====
// Environment-driven store selection.
// Uses RedisStore when REDIS_URL is set, MemoryStore otherwise.

import logger from "../utils/logger";

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

// Async interface — both stores implement this
export interface IRateLimiterStore {
    get(key: string): Promise<RateLimitRecord | undefined>;
    set(key: string, record: RateLimitRecord): Promise<void>;
    delete(key: string): Promise<void>;
}

// ── In-memory fallback ──────────────────────────────────────
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
}

// ── Factory ─────────────────────────────────────────────────
export function createStore(): IRateLimiterStore {
    const redisUrl = process.env.REDIS_URL || "";

    if (redisUrl) {
        // Dynamic import to avoid loading ioredis in non-Redis envs
        const { RedisStore } = require("./RedisStore");
        logger.info("ratelimiter.store.redis", { url: redisUrl.replace(/\/\/.*@/, "//<redacted>@") });
        return new RedisStore(redisUrl);
    }

    logger.info("ratelimiter.store.memory", { note: "Set REDIS_URL for distributed rate limiting" });
    return new MemoryStore();
}
