// ===== JanSathi AI — Daily Snapshot Aggregation Job =====
// Computes and upserts daily analytics snapshots.
// Runs on startup (backfills yesterday) then every 6 hours.
// Idempotent — safe to re-run via upsert.

import prisma from "../models/prisma";
import logger from "../utils/logger";

const SNAPSHOT_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

// ── Compute snapshot for a specific date ────────────────────
export async function computeSnapshot(targetDate: Date): Promise<void> {
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    try {
        const [
            totalUsers,
            activeUsersRaw,
            totalConversations,
            newConversations,
            moduleUsageRaw,
            avgResponseTime,
            satisfactionAgg,
            resolvedCount,
            topIntentsRaw,
            hiCount,
            enCount,
        ] = await Promise.all([
            prisma.user.count({ where: { createdAt: { lt: dayEnd } } }),
            prisma.analyticsEvent.findMany({
                where: { timestamp: { gte: dayStart, lt: dayEnd } },
                select: { userId: true, sessionId: true },
                distinct: ["userId"],
            }),
            prisma.conversation.count({ where: { startedAt: { lt: dayEnd } } }),
            prisma.conversation.count({
                where: { startedAt: { gte: dayStart, lt: dayEnd } },
            }),
            prisma.conversation.groupBy({
                by: ["mode"],
                where: { startedAt: { gte: dayStart, lt: dayEnd } },
                _count: { mode: true },
                orderBy: { _count: { mode: "desc" } },
            }),
            prisma.message.aggregate({
                where: {
                    timestamp: { gte: dayStart, lt: dayEnd },
                    responseTimeMs: { not: null },
                },
                _avg: { responseTimeMs: true },
            }),
            prisma.conversation.aggregate({
                where: {
                    startedAt: { gte: dayStart, lt: dayEnd },
                    satisfaction: { not: null },
                },
                _avg: { satisfaction: true },
            }),
            prisma.conversation.count({
                where: { startedAt: { gte: dayStart, lt: dayEnd }, resolved: true },
            }),
            prisma.analyticsEvent.groupBy({
                by: ["metadata"],
                where: {
                    type: "message_sent",
                    timestamp: { gte: dayStart, lt: dayEnd },
                },
                _count: true,
                orderBy: { _count: { metadata: "desc" } },
                take: 10,
            }),
            prisma.user.count({ where: { language: "hi", createdAt: { lt: dayEnd } } }),
            prisma.user.count({ where: { language: "en", createdAt: { lt: dayEnd } } }),
        ]);

        const moduleUsage: Record<string, number> = {};
        for (const m of moduleUsageRaw) {
            moduleUsage[m.mode] = m._count.mode;
        }

        const topIntents = topIntentsRaw.map((item: any) => {
            const meta = item.metadata as { intent?: string } | null;
            const count = typeof item._count === "number" ? item._count : 0;
            return { intent: meta?.intent || "unknown", count };
        });

        await prisma.dailySnapshot.upsert({
            where: { date: dayStart },
            create: {
                date: dayStart,
                totalUsers,
                activeUsers: activeUsersRaw.length,
                totalConversations,
                newConversations,
                avgResponseTimeMs: Math.round(avgResponseTime._avg.responseTimeMs || 0),
                satisfactionAvg: Math.round((satisfactionAgg._avg.satisfaction || 0) * 10) / 10,
                resolvedRate: newConversations > 0
                    ? Math.round((resolvedCount / newConversations) * 100)
                    : 0,
                moduleUsage,
                languageSplit: { hi: hiCount, en: enCount },
                topIntents,
            },
            update: {
                totalUsers,
                activeUsers: activeUsersRaw.length,
                totalConversations,
                newConversations,
                avgResponseTimeMs: Math.round(avgResponseTime._avg.responseTimeMs || 0),
                satisfactionAvg: Math.round((satisfactionAgg._avg.satisfaction || 0) * 10) / 10,
                resolvedRate: newConversations > 0
                    ? Math.round((resolvedCount / newConversations) * 100)
                    : 0,
                moduleUsage,
                languageSplit: { hi: hiCount, en: enCount },
                topIntents,
                computedAt: new Date(),
            },
        });

        logger.info("jobs.daily_snapshot.computed", {
            date: dayStart.toISOString().split("T")[0],
            activeUsers: activeUsersRaw.length,
            newConversations,
        });
    } catch (error) {
        logger.error("jobs.daily_snapshot.failed", {
            date: targetDate.toISOString().split("T")[0],
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

// ── Background runner ───────────────────────────────────────
async function runSnapshotJob(): Promise<void> {
    // Compute yesterday's snapshot (most recently completed day)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await computeSnapshot(yesterday);

    // Also compute today's partial snapshot
    await computeSnapshot(new Date());
}

let snapshotTimer: ReturnType<typeof setInterval> | null = null;

/** Start daily snapshot job. Call once on server boot. */
export function startDailySnapshotJob(): void {
    runSnapshotJob();

    snapshotTimer = setInterval(runSnapshotJob, SNAPSHOT_INTERVAL_MS);
    if (snapshotTimer.unref) snapshotTimer.unref();

    logger.info("jobs.daily_snapshot.started", {
        intervalMs: SNAPSHOT_INTERVAL_MS,
    });
}

/** Stop the snapshot job (graceful shutdown). */
export function stopDailySnapshotJob(): void {
    if (snapshotTimer) {
        clearInterval(snapshotTimer);
        snapshotTimer = null;
        logger.info("jobs.daily_snapshot.stopped", {});
    }
}
