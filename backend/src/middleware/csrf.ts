// ===== JanSathi AI — CSRF Protection Middleware =====
// Double-Submit Cookie pattern: generates a CSRF token, stores it in a
// cookie AND expects it in a header on state-changing requests.
// Works with SameSite=strict cookies for defense-in-depth.
// GET/HEAD/OPTIONS are exempt (safe methods).

import { Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";
import { APP } from "../config/env";
import logger from "../utils/logger";

const CSRF_COOKIE = "jansathi_csrf";
const CSRF_HEADER = "x-csrf-token";
const TOKEN_LENGTH = 32; // 256-bit

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// ── Paths exempt from CSRF (no cookie-based auth or pre-auth flows) ──
const EXEMPT_PATHS = new Set([
    "/api/health",
    "/api/weather",
    "/api/mandi",
    "/api/auth",  // Auth endpoints: session creation, OTP — no session yet
]);

/**
 * Controls whether CSRF validation is active.
 * Disabled in test environment; individual CSRF tests re-enable via _setCSRFEnabled.
 */
let csrfEnabled = process.env.NODE_ENV !== "test";

export function _setCSRFEnabled(enabled: boolean): void {
    csrfEnabled = enabled;
}

function isExempt(path: string): boolean {
    for (const prefix of EXEMPT_PATHS) {
        if (path.startsWith(prefix)) return true;
    }
    return false;
}

function generateToken(): string {
    return randomBytes(TOKEN_LENGTH).toString("hex");
}

/**
 * Sets a CSRF token cookie and expects it back in a header for
 * state-changing requests (POST, PATCH, PUT, DELETE).
 * Call this AFTER cookieParser().
 */
export function csrfProtection(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Disabled in test environment (individual CSRF tests re-enable)
    if (!csrfEnabled) return next();

    // Skip safe methods — just ensure token cookie exists
    if (SAFE_METHODS.has(req.method)) {
        ensureTokenCookie(req, res);
        return next();
    }

    // Skip exempt paths
    if (isExempt(req.path) || isExempt(req.baseUrl + req.path)) {
        return next();
    }

    // For state-changing methods: validate token
    const cookieToken = req.cookies?.[CSRF_COOKIE];
    const headerToken = req.headers[CSRF_HEADER] as string | undefined;

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        logger.warn("csrf.rejected", {
            path: req.path,
            method: req.method,
            hasCookie: !!cookieToken,
            hasHeader: !!headerToken,
            ip: req.ip,
        });
        res.status(403).json({
            error: "CSRF_FAILED",
            message: "CSRF token missing or invalid",
        });
        return;
    }

    // Valid — rotate token for next request
    setTokenCookie(res, generateToken());
    next();
}

/**
 * Ensures a CSRF token cookie exists. If not, creates one.
 * Called on safe methods to seed the token for subsequent state-changing calls.
 */
function ensureTokenCookie(req: Request, res: Response): void {
    if (!req.cookies?.[CSRF_COOKIE]) {
        setTokenCookie(res, generateToken());
    }
}

function setTokenCookie(res: Response, token: string): void {
    res.cookie(CSRF_COOKIE, token, {
        httpOnly: false, // JS must read this to send in header
        secure: APP.isProd,
        sameSite: APP.isProd ? "none" : "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 24h
    });
}

/**
 * Generate a fresh CSRF token and set it on a response.
 * Call after session creation to rotate the token.
 */
export function rotateCSRFToken(res: Response): void {
    setTokenCookie(res, generateToken());
}
