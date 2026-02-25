// ===== JanSathi AI — Rate Limiter Middleware =====
// Per-route + per-IP rate limiting to prevent cross-route DoS attacks.
// Key format: "ip:routePrefix" ensures hammering /weather doesn't exhaust the
// /chat budget, and vice versa.
// Store is async — supports both MemoryStore and RedisStore.

import { Request, Response, NextFunction } from "express";
import { createStore, type IRateLimiterStore } from "../stores/storeFactory";
import logger from "../utils/logger";

// ── Rate limit configs per route family ───────────────────────
const CONFIGS: Record<string, { max: number; windowMs: number }> = {
    "/api/chat": { max: 10, windowMs: 60_000 },
    "/api/analytics": { max: 50, windowMs: 60_000 },
    "/api/auth": { max: 5, windowMs: 60_000 },
    "/api/admin": { max: 20, windowMs: 60_000 },
    default: { max: 30, windowMs: 60_000 },
};

// ── Singleton store (MemoryStore or RedisStore via env) ────────
const store: IRateLimiterStore = createStore();

// ── Helpers ───────────────────────────────────────────────────
function extractIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
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
    return async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
        const ip = extractIp(req);
        const routeKey = req.baseUrl || req.path;
        const config = overrideConfig ?? getRouteConfig(req);
        const storeKey = `${ip}:${routeKey}`;
        const now = Date.now();

        const record = await store.get(storeKey);

        if (!record || now > record.resetTime) {
            await store.set(storeKey, { count: 1, resetTime: now + config.windowMs });
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
        await store.set(storeKey, record);
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

/** Strict rate limiter for auth OTP endpoints — 5 req/min */
export const authRateLimiter = createRateLimiter(CONFIGS["/api/auth"]);

/** Strict rate limiter for admin — 5 req/min */
export const adminRateLimiter = createRateLimiter(CONFIGS["/api/admin"]);
