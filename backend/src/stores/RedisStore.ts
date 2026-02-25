// ===== JanSathi AI — Redis Rate Limiter Store =====
// Implements IRateLimiterStore using ioredis.
// Uses SET with EX (TTL auto-expiry) — no manual cleanup needed.
// Graceful degradation: Redis failures allow request through.

import Redis from "ioredis";
import logger from "../utils/logger";

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

export class RedisStore {
    private client: Redis;
    private prefix: string;

    constructor(redisUrl: string, prefix = "rl:") {
        this.prefix = prefix;
        this.client = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            lazyConnect: true,
            connectTimeout: 3000,
            retryStrategy(times) {
                if (times > 3) return null; // Stop retrying
                return Math.min(times * 200, 1000);
            },
        });

        this.client.on("error", (err) => {
            logger.error("redis.store.error", { error: err.message });
        });

        this.client.on("connect", () => {
            logger.info("redis.store.connected");
        });

        // Connect immediately
        this.client.connect().catch((err) => {
            logger.error("redis.store.connect_failed", { error: err.message });
        });
    }

    async get(key: string): Promise<RateLimitRecord | undefined> {
        try {
            const data = await this.client.get(this.prefix + key);
            if (!data) return undefined;
            return JSON.parse(data) as RateLimitRecord;
        } catch {
            // Graceful degradation — allow request through
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
            // Graceful degradation — silently fail
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.client.del(this.prefix + key);
        } catch {
            // Graceful degradation
        }
    }

    async disconnect(): Promise<void> {
        await this.client.quit();
    }
}
