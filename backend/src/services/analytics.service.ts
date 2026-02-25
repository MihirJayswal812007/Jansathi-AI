// ===== JanSathi AI — Analytics Service =====
// Dedicated service for analytics event tracking and dashboard aggregation.
// Extracted from conversation.ts and admin.ts for proper separation of concerns.

import prisma from "../models/prisma";
import logger from "../utils/logger";

// ── Track Event ─────────────────────────────────────────────
export async function trackEvent(
    type: string,
    sessionId: string,
    metadata: Record<string, unknown> = {},
    userId?: string | null,
    mode?: string | null
): Promise<void> {
    try {
        await prisma.analyticsEvent.create({
            data: {
                type,
                userId: userId || null,
                mode: mode || null,
                metadata: metadata as any,
                sessionId,
            },
        });

        logger.debug("analytics.event.tracked", { type, sessionId, mode });
    } catch (error) {
        // Analytics should never break the user flow
        logger.error("analytics.event.failed", {
            type,
            sessionId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

// ── Dashboard Stats ─────────────────────────────────────────
export async function getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsersToday: number;
    totalConversations: number;
    avgResponseTimeMs: number;
    moduleUsage: Record<string, number>;
    languageSplit: { hi: number; en: number };
    topIntents: Array<{ intent: string; count: number }>;
    dailyActiveUsers: Array<{ date: string; count: number }>;
    satisfactionAvg: number;
    resolvedRate: number;
}> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

    const [
        totalUsers, activeUsersToday, totalConversations,
        moduleUsageRaw, avgResponseTime, satisfactionAgg,
        resolvedCount, topIntentsRaw, dailyActiveRaw,
        hiCount, enCount,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.analyticsEvent.findMany({
            where: { timestamp: { gte: todayStart } },
            select: { userId: true, sessionId: true },
            distinct: ["userId"],
        }),
        prisma.conversation.count(),
        prisma.conversation.groupBy({
            by: ["mode"],
            _count: { mode: true },
            orderBy: { _count: { mode: "desc" } },
        }),
        prisma.message.aggregate({
            where: { responseTimeMs: { not: null } },
            _avg: { responseTimeMs: true },
        }),
        prisma.conversation.aggregate({
            where: { satisfaction: { not: null } },
            _avg: { satisfaction: true },
        }),
        prisma.conversation.count({ where: { resolved: true } }),
        prisma.analyticsEvent.groupBy({
            by: ["metadata"],
            where: { type: "message_sent" },
            _count: true,
            orderBy: { _count: { metadata: "desc" } },
            take: 10,
        }),
        prisma.analyticsEvent.findMany({
            where: { timestamp: { gte: sevenDaysAgo } },
            select: { userId: true, sessionId: true, timestamp: true },
        }),
        prisma.user.count({ where: { language: "hi" } }),
        prisma.user.count({ where: { language: "en" } }),
    ]);

    // Process module usage
    const moduleUsage: Record<string, number> = {};
    for (const m of moduleUsageRaw) {
        moduleUsage[m.mode] = m._count.mode;
    }

    const topIntents = topIntentsRaw.map((item: any) => {
        const meta = item.metadata as { intent?: string } | null;
        const count = typeof item._count === "number" ? item._count : 0;
        return { intent: meta?.intent || "unknown", count };
    });

    // Daily active users over last 7 days
    const dailyActiveUsers: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayStart = new Date(dateStr);
        const dayEnd = new Date(dayStart.getTime() + 86400000);
        const dayUsers = new Set(
            dailyActiveRaw
                .filter((e: { timestamp: Date }) => e.timestamp >= dayStart && e.timestamp < dayEnd)
                .map((e: { userId: string | null; sessionId: string }) => e.userId || e.sessionId)
        );
        dailyActiveUsers.push({ date: dateStr, count: dayUsers.size });
    }

    return {
        totalUsers,
        activeUsersToday: activeUsersToday.length,
        totalConversations,
        avgResponseTimeMs: Math.round(avgResponseTime._avg.responseTimeMs || 0),
        moduleUsage,
        languageSplit: { hi: hiCount, en: enCount },
        topIntents,
        dailyActiveUsers,
        satisfactionAvg: Math.round((satisfactionAgg._avg.satisfaction || 0) * 10) / 10,
        resolvedRate: totalConversations > 0 ? Math.round((resolvedCount / totalConversations) * 100) : 0,
    };
}

// ── Trend Computation ───────────────────────────────────────
export interface TrendData {
    snapshots: Array<{
        date: string;
        activeUsers: number;
        newConversations: number;
        satisfactionAvg: number;
        resolvedRate: number;
        moduleUsage: Record<string, number>;
    }>;
    deltas: {
        activeUsers: number;    // % change vs prior period
        conversations: number;  // % change vs prior period
        satisfaction: number;   // absolute change
        resolvedRate: number;   // absolute change (pp)
    };
}

export async function getTrends(days = 7): Promise<TrendData> {
    const snapshots = await prisma.dailySnapshot.findMany({
        orderBy: { date: "desc" },
        take: days * 2, // current period + prior period for delta
    });

    // Split into current period and prior period
    const current = snapshots.slice(0, days);
    const prior = snapshots.slice(days, days * 2);

    // Compute period averages
    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const pctChange = (curr: number, prev: number) =>
        prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

    const currentActiveAvg = avg(current.map(s => s.activeUsers));
    const priorActiveAvg = avg(prior.map(s => s.activeUsers));

    const currentConvSum = current.reduce((sum, s) => sum + s.newConversations, 0);
    const priorConvSum = prior.reduce((sum, s) => sum + s.newConversations, 0);

    const currentSatAvg = avg(current.map(s => s.satisfactionAvg));
    const priorSatAvg = avg(prior.map(s => s.satisfactionAvg));

    const currentResolvedAvg = avg(current.map(s => s.resolvedRate));
    const priorResolvedAvg = avg(prior.map(s => s.resolvedRate));

    return {
        snapshots: current.reverse().map(s => ({
            date: s.date.toISOString().split("T")[0],
            activeUsers: s.activeUsers,
            newConversations: s.newConversations,
            satisfactionAvg: s.satisfactionAvg,
            resolvedRate: s.resolvedRate,
            moduleUsage: s.moduleUsage as Record<string, number>,
        })),
        deltas: {
            activeUsers: pctChange(currentActiveAvg, priorActiveAvg),
            conversations: pctChange(currentConvSum, priorConvSum),
            satisfaction: Math.round((currentSatAvg - priorSatAvg) * 10) / 10,
            resolvedRate: Math.round(currentResolvedAvg - priorResolvedAvg),
        },
    };
}
