// ===== JanSathi AI — Session Cleanup Background Job =====
// Runs every hour to delete expired sessions from PostgreSQL.
// Prevents infinite DB bloat from anonymous one-off visitors.

import prisma from "../models/prisma";
import logger from "../utils/logger";

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

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
                nextRunAt: new Date(Date.now() + CLEANUP_INTERVAL_MS).toISOString(),
            });
        }
    } catch (error) {
        logger.error("jobs.session_cleanup.failed", {
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/** Start background session cleanup job. Call once on server boot. */
export function startSessionCleanup(): void {
    // Run immediately on startup to clear any backlog from previous runs
    cleanupExpiredSessions();

    cleanupTimer = setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL_MS);

    // Prevent the interval from keeping the process alive on graceful shutdown
    if (cleanupTimer.unref) cleanupTimer.unref();

    logger.info("jobs.session_cleanup.started", {
        intervalMs: CLEANUP_INTERVAL_MS,
    });
}

/** Stop the cleanup job (useful for graceful shutdown). */
export function stopSessionCleanup(): void {
    if (cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
        logger.info("jobs.session_cleanup.stopped", {});
    }
}
