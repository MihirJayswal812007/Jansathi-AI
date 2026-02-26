// ===== JanSathi AI — Memory Pruner =====
// Scheduled cleanup of old conversation_memory entries.
// User-isolated: never deletes across user boundaries.
// Always preserves the most recent N messages per user.

import prisma from "../models/prisma";
import logger from "../utils/logger";

export interface MemoryPrunerConfig {
    maxItemsPerUser: number;      // e.g., 1000
    pruneDays: number;            // delete entries older than N days
    protectedRecentCount: number; // never delete the last N entries per user
}

export class MemoryPruner {
    constructor(private config: MemoryPrunerConfig) { }

    /**
     * Prune old conversation memory entries.
     * Strategy:
     *   1. Delete entries older than pruneDays (per user).
     *   2. If user still exceeds maxItemsPerUser, delete oldest entries.
     *   3. Never delete the last protectedRecentCount entries per user.
     *
     * Safe to run as a cron job or on-demand.
     */
    async prune(): Promise<{ deletedCount: number; usersAffected: number }> {
        let totalDeleted = 0;
        let usersAffected = 0;

        try {
            // Step 1: Age-based pruning (bulk, efficient)
            // Delete entries older than pruneDays, but protect recent ones
            if (this.config.pruneDays > 0) {
                const ageResult = await prisma.$executeRawUnsafe(
                    `DELETE FROM conversation_memory
                     WHERE created_at < NOW() - INTERVAL '${this.config.pruneDays} days'
                     AND id NOT IN (
                         SELECT id FROM (
                             SELECT id, user_id,
                                    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
                             FROM conversation_memory
                         ) ranked
                         WHERE rn <= $1
                     )`,
                    this.config.protectedRecentCount
                );

                totalDeleted += typeof ageResult === "number" ? ageResult : 0;
            }

            // Step 2: Per-user cap-based pruning
            // Find users who exceed maxItemsPerUser
            const overflowUsers = await prisma.$queryRawUnsafe<
                { user_id: string; cnt: bigint }[]
            >(
                `SELECT user_id, COUNT(*) as cnt
                 FROM conversation_memory
                 GROUP BY user_id
                 HAVING COUNT(*) > $1`,
                this.config.maxItemsPerUser
            );

            for (const { user_id: userId, cnt } of overflowUsers) {
                const count = Number(cnt);
                const toDelete = count - this.config.maxItemsPerUser;

                if (toDelete > 0) {
                    // Delete oldest entries beyond the cap, but protect recent ones
                    const result = await prisma.$executeRawUnsafe(
                        `DELETE FROM conversation_memory
                         WHERE id IN (
                             SELECT id FROM (
                                 SELECT id,
                                        ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
                                 FROM conversation_memory
                                 WHERE user_id = $1
                             ) ranked
                             WHERE rn <= $2
                         )
                         AND id NOT IN (
                             SELECT id FROM (
                                 SELECT id,
                                        ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
                                 FROM conversation_memory
                                 WHERE user_id = $1
                             ) recent
                             WHERE rn <= $3
                         )`,
                        userId,
                        toDelete,
                        this.config.protectedRecentCount
                    );

                    const deleted = typeof result === "number" ? result : 0;
                    totalDeleted += deleted;
                    if (deleted > 0) usersAffected++;
                }
            }

            logger.info("memory_pruner.completed", {
                deletedCount: totalDeleted,
                usersAffected,
                overflowUserCount: overflowUsers.length,
            });
        } catch (error) {
            logger.error("memory_pruner.failed", {
                error: error instanceof Error ? error.message : String(error),
            });
        }

        return { deletedCount: totalDeleted, usersAffected };
    }
}

// ── Singleton ───────────────────────────────────────────────
function intEnv(key: string, fallback: number): number {
    const raw = process.env[key];
    if (!raw) return fallback;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? fallback : parsed;
}

export const memoryPruner = new MemoryPruner({
    maxItemsPerUser: intEnv("MEMORY_MAX_ITEMS_PER_USER", 1000),
    pruneDays: intEnv("MEMORY_PRUNE_DAYS", 60),
    protectedRecentCount: intEnv("MEMORY_PROTECTED_RECENT", 20),
});
