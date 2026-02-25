// ===== JanSathi AI — Rate Limiter Middleware =====
// Per-route + per-IP rate limiting to prevent cross-route DoS attacks.
// Key format: "ip:routePrefix" ensures hammering /weather doesn't exhaust the
// /chat budget, and vice versa.

import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

// ── Rate limit configs per route family ───────────────────────
const CONFIGS: Record<string, { max: number; windowMs: number }> = {
    "/api/chat": { max: 10, windowMs: 60_000 },
    "/api/analytics": { max: 50, windowMs: 60_000 },
    default: { max: 30, windowMs: 60_000 },
};

const RATE_LIMIT_WINDOW_MS = 60_000;

// ── IRateLimiterStore interface — swap with Redis later ────────
interface IRateLimiterStore {
    get(key: string): { count: number; resetTime: number } | undefined;
    set(key: string, record: { count: number; resetTime: number }): void;
    delete(key: string): void;
    entries(): IterableIterator<[string, { count: number; resetTime: number }]>;
}

class MemoryStore implements IRateLimiterStore {
    private map = new Map<string, { count: number; resetTime: number }>();
    get(key: string) { return this.map.get(key); }
    set(key: string, record: { count: number; resetTime: number }) { this.map.set(key, record); }
    delete(key: string) { this.map.delete(key); }
    entries() { return this.map.entries(); }
}

// ── Singleton store ────────────────────────────────────────────
// Replace `new MemoryStore()` with `new RedisStore(redisClient)` when scaling.
const store: IRateLimiterStore = new MemoryStore();

// Periodic cleanup of expired entries to prevent memory growth
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
        if (now > record.resetTime) store.delete(key);
    }
}, RATE_LIMIT_WINDOW_MS);

// ── Helpers ───────────────────────────────────────────────────
function extractIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        // Take only the first IP from a comma-separated list
        return forwarded.split(",")[0].trim();
    }
    return req.ip || "unknown";
}

function getRouteConfig(req: Request): { max: number; windowMs: number } {
    for (const [prefix, config] of Object.entries(CONFIGS)) {
        if (req.path.startsWith(prefix) || (req.baseUrl + req.path).startsWith(prefix)) {
            return config;
        }
    }
    return CONFIGS.default;
}

// ── Middleware factory ─────────────────────────────────────────
export function createRateLimiter(overrideConfig?: { max: number; windowMs: number }) {
    return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
        const ip = extractIp(req);
        const routeKey = req.baseUrl || req.path; // e.g. "/api/chat"
        const config = overrideConfig ?? getRouteConfig(req);
        const storeKey = `${ip}:${routeKey}`;
        const now = Date.now();

        const record = store.get(storeKey);

        if (!record || now > record.resetTime) {
            store.set(storeKey, { count: 1, resetTime: now + config.windowMs });
            return next();
        }

        if (record.count >= config.max) {
            const retryAfterMs = record.resetTime - now;
            logger.warn("middleware.rate_limit.exceeded", { ip, routeKey, count: record.count });
            return res.status(429).json({
                error: "RATE_LIMITED",
                message: "Too many requests, please wait",
                messageHi: "बहुत अधिक अनुरोध, कृपया प्रतीक्षा करें",
                retryAfterMs,
            });
        }

        record.count++;
        next();
    };
}

// ── Pre-configured instances ───────────────────────────────────
/** Standard rate limiter — 30 req/min */
export const rateLimitMiddleware = createRateLimiter(CONFIGS.default);

/** Strict rate limiter for LLM-backed chat — 10 req/min */
export const chatRateLimiter = createRateLimiter(CONFIGS["/api/chat"]);

/** Relaxed rate limiter for analytics — 50 req/min */
export const analyticsRateLimiter = createRateLimiter(CONFIGS["/api/analytics"]);
