// ===== JanSathi AI — Background Cleanup Jobs =====
// Runs periodically to clean up expired sessions and OTP records.
// Prevents infinite DB bloat from expired/used records.

import prisma from "../models/prisma";
import logger from "../utils/logger";

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const OTP_RETENTION_HOURS = 24; // keep verified/expired OTPs for 24h then delete

// ── Session Cleanup ─────────────────────────────────────────
async function cleanupExpiredSessions(): Promise<void> {
    try {
        const result = await prisma.session.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });

        if (result.count > 0) {
            logger.info("jobs.session_cleanup.ran", {
                deletedCount: result.count,
            });
        }
    } catch (error) {
        logger.error("jobs.session_cleanup.failed", {
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

// ── OTP Cleanup ─────────────────────────────────────────────
async function cleanupExpiredOTPs(): Promise<void> {
    try {
        const cutoff = new Date(Date.now() - OTP_RETENTION_HOURS * 60 * 60 * 1000);

        const result = await prisma.otpVerification.deleteMany({
            where: {
                OR: [
                    // Verified OTPs older than retention period
                    { verified: true, createdAt: { lt: cutoff } },
                    // Expired unverified OTPs older than retention period
                    { expiresAt: { lt: new Date() }, createdAt: { lt: cutoff } },
                ],
            },
        });

        if (result.count > 0) {
            logger.info("jobs.otp_cleanup.ran", {
                deletedCount: result.count,
            });
        }
    } catch (error) {
        logger.error("jobs.otp_cleanup.failed", {
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

// ── Combined Cleanup ────────────────────────────────────────
async function runCleanup(): Promise<void> {
    await cleanupExpiredSessions();
    await cleanupExpiredOTPs();
}

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/** Start background cleanup jobs. Call once on server boot. */
export function startSessionCleanup(): void {
    // Run immediately on startup to clear any backlog
    runCleanup();

    cleanupTimer = setInterval(runCleanup, CLEANUP_INTERVAL_MS);

    // Prevent the interval from keeping the process alive on graceful shutdown
    if (cleanupTimer.unref) cleanupTimer.unref();

    logger.info("jobs.cleanup.started", {
        intervalMs: CLEANUP_INTERVAL_MS,
        otpRetentionHours: OTP_RETENTION_HOURS,
    });
}

/** Stop the cleanup jobs (useful for graceful shutdown). */
export function stopSessionCleanup(): void {
    if (cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
        logger.info("jobs.cleanup.stopped", {});
    }
}
