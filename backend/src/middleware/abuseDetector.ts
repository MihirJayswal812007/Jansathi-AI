// ===== JanSathi AI — Abuse Detection (Logging Only) =====
// Lightweight in-memory tracking for suspicious patterns.
// Logs structured security events when thresholds are exceeded.
// Does NOT block requests — observation mode only.

import logger from "../utils/logger";

// ── Configuration ───────────────────────────────────────────
const CONFIG = {
    // Session creation: max N per IP per window
    sessionCreation: {
        maxPerWindow: 20,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
    // OTP failures: max N per identifier per window
    otpFailures: {
        maxPerWindow: 10,
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
    // Cleanup interval for expired entries
    cleanupIntervalMs: 5 * 60 * 1000, // 5 minutes
};

// ── In-memory counters ──────────────────────────────────────
interface Counter {
    count: number;
    windowStart: number;
    alerted: boolean; // prevent duplicate alerts per window
}

const sessionCreationCounters = new Map<string, Counter>();
const otpFailureCounters = new Map<string, Counter>();

// ── Core tracking functions ─────────────────────────────────

function incrementCounter(
    map: Map<string, Counter>,
    key: string,
    windowMs: number
): Counter {
    const now = Date.now();
    const existing = map.get(key);

    if (!existing || now - existing.windowStart > windowMs) {
        // New window
        const counter: Counter = { count: 1, windowStart: now, alerted: false };
        map.set(key, counter);
        return counter;
    }

    existing.count++;
    return existing;
}

/**
 * Track a session creation event for an IP address.
 * Logs a security event if excessive session creation is detected.
 */
export function trackSessionCreation(ip: string): void {
    const counter = incrementCounter(
        sessionCreationCounters,
        ip,
        CONFIG.sessionCreation.windowMs
    );

    if (counter.count > CONFIG.sessionCreation.maxPerWindow && !counter.alerted) {
        counter.alerted = true;
        logger.warn("security.abuse.excessive_sessions", {
            ip,
            count: counter.count,
            threshold: CONFIG.sessionCreation.maxPerWindow,
            windowMs: CONFIG.sessionCreation.windowMs,
            severity: "medium",
            action: "logged",
        });
    }
}

/**
 * Track an OTP verification failure for an identifier.
 * Logs a security event if repeated failures are detected.
 */
export function trackOTPFailure(identifier: string): void {
    // Mask identifier for logging
    const masked = identifier.length > 4
        ? identifier.slice(0, 2) + "***" + identifier.slice(-2)
        : "***";

    const counter = incrementCounter(
        otpFailureCounters,
        identifier,
        CONFIG.otpFailures.windowMs
    );

    if (counter.count > CONFIG.otpFailures.maxPerWindow && !counter.alerted) {
        counter.alerted = true;
        logger.warn("security.abuse.excessive_otp_failures", {
            identifier: masked,
            count: counter.count,
            threshold: CONFIG.otpFailures.maxPerWindow,
            windowMs: CONFIG.otpFailures.windowMs,
            severity: "high",
            action: "logged",
        });
    }
}

// ── Cleanup expired windows ─────────────────────────────────
function cleanup(): void {
    const now = Date.now();

    for (const [key, counter] of sessionCreationCounters.entries()) {
        if (now - counter.windowStart > CONFIG.sessionCreation.windowMs) {
            sessionCreationCounters.delete(key);
        }
    }

    for (const [key, counter] of otpFailureCounters.entries()) {
        if (now - counter.windowStart > CONFIG.otpFailures.windowMs) {
            otpFailureCounters.delete(key);
        }
    }
}

const cleanupTimer = setInterval(cleanup, CONFIG.cleanupIntervalMs);
if (cleanupTimer.unref) cleanupTimer.unref();

// ── Export config for testing ───────────────────────────────
export const ABUSE_CONFIG = CONFIG;

/**
 * Reset all counters — used in tests only.
 */
export function _resetCounters(): void {
    sessionCreationCounters.clear();
    otpFailureCounters.clear();
}
