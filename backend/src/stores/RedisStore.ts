// ===== JanSathi AI — Redis Rate Limiter Store =====
// Implements IRateLimiterStore using ioredis with atomic Lua scripting.
// Fixed-window rate limiting with atomic INCR + conditional PEXPIRE.
// Graceful degradation: Redis failures return undefined (allow request through).

import Redis from "ioredis";
import logger from "../utils/logger";
import type { IRateLimiterStore } from "./storeFactory";

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

// ── Lua script: atomic increment with conditional expiry ────────
// Returns [count, resetTime_ms]
// If key doesn't exist → INCR to 1, PEXPIRE = windowMs, return [1, now+windowMs]
// If key exists → INCR, return [newCount, PTTL-based resetTime]
const LUA_INCREMENT = `
local key = KEYS[1]
local windowMs = tonumber(ARGV[1])
local now = tonumber(ARGV[2])

local count = redis.call('INCR', key)

if count == 1 then
    -- First request in window: set expiry
    redis.call('PEXPIRE', key, windowMs)
    return {count, now + windowMs}
else
    -- Subsequent request: derive resetTime from remaining TTL
    local pttl = redis.call('PTTL', key)
    if pttl < 0 then
        -- Key has no expiry (shouldn't happen) — set one
        redis.call('PEXPIRE', key, windowMs)
        pttl = windowMs
    end
    return {count, now + pttl}
end
`;

export class RedisStore implements IRateLimiterStore {
    private client: Redis;
    private prefix: string;
    private connected = false;

    constructor(redisUrl: string, prefix?: string) {
        this.prefix = prefix ?? process.env.REDIS_PREFIX ?? "jansathi";
        this.prefix = `${this.prefix}:rl:`;

        this.client = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            lazyConnect: true,
            connectTimeout: 3000,
            enableOfflineQueue: false, // fail fast when disconnected
            retryStrategy(times) {
                if (times > 5) return null; // stop retrying after 5 attempts
                return Math.min(times * 200, 2000);
            },
        });

        this.client.on("error", (err) => {
            this.connected = false;
            logger.error("redis.store.error", { error: err.message });
        });

        this.client.on("connect", () => {
            this.connected = true;
            logger.info("redis.store.connected");
        });

        this.client.on("close", () => {
            this.connected = false;
            logger.warn("redis.store.disconnected");
        });

        // Connect (non-blocking)
        this.client.connect().catch((err) => {
            this.connected = false;
            logger.error("redis.store.connect_failed", { error: err.message });
        });
    }

    /**
     * Atomic increment-and-get for rate limiting.
     * Uses Lua script → single round trip, no race condition.
     * Returns the record AFTER incrementing.
     */
    async increment(key: string, windowMs: number): Promise<RateLimitRecord> {
        try {
            const now = Date.now();
            const result = await this.client.eval(
                LUA_INCREMENT,
                1,                          // number of KEYS
                this.prefix + key,          // KEYS[1]
                String(windowMs),           // ARGV[1]
                String(now)                 // ARGV[2]
            ) as [number, number];

            return { count: result[0], resetTime: result[1] };
        } catch {
            // Graceful degradation — return undefined-ish sentinel
            // Caller should allow request through
            return { count: 0, resetTime: Date.now() + windowMs };
        }
    }

    async get(key: string): Promise<RateLimitRecord | undefined> {
        try {
            const data = await this.client.get(this.prefix + key);
            if (!data) return undefined;
            return JSON.parse(data) as RateLimitRecord;
        } catch {
            return undefined;
        }
    }

    async set(key: string, record: RateLimitRecord): Promise<void> {
        try {
            const ttlMs = record.resetTime - Date.now();
            const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
            await this.client.set(
                this.prefix + key,
                JSON.stringify(record),
                "EX",
                ttlSeconds
            );
        } catch {
            // Graceful degradation
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.client.del(this.prefix + key);
        } catch {
            // Graceful degradation
        }
    }

    /** Check if Redis is currently connected */
    isConnected(): boolean {
        return this.connected;
    }

    async disconnect(): Promise<void> {
        try {
            await this.client.quit();
        } catch {
            this.client.disconnect();
        }
        this.connected = false;
    }
}
