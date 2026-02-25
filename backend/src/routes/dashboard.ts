// ===== JanSathi AI — Dashboard Route (Express) =====

import { Router, Request, Response } from "express";
import prisma from "../models/prisma";
import { getSession, isAdmin } from "../middleware/auth";
import { sendError } from "../middleware/errorHandler";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
import logger from "../utils/logger";

export const dashboardRouter = Router();

// Apply rate limiting to ALL dashboard routes
dashboardRouter.use(rateLimitMiddleware);

dashboardRouter.get("/", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    try {
        const session = await getSession(req);
        const isAdminUser = session ? isAdmin(session) : false;

        // ── CRITICAL AUTH GUARD ─────────────────────────────────
        // Must halt execution BEFORE any DB queries run.
        // Without this, all 11 aggregation queries run and return
        // to ANY unauthenticated user — a full data exfiltration.
        if (!isAdminUser) {
            return sendError(res, "UNAUTHORIZED", "Admin access required", requestId);
        }

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

        // Process
        const moduleUsage: Record<string, number> = {};
        for (const m of moduleUsageRaw) {
            moduleUsage[m.mode] = m._count.mode;
        }

        const topIntents = topIntentsRaw.map((item: any) => {
            const meta = item.metadata as { intent?: string } | null;
            const count = typeof item._count === "number" ? item._count : 0;
            return { intent: meta?.intent || "unknown", count };
        });

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

        const stats = {
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

        logger.info("api.dashboard.served", { requestId, isAdmin: isAdminUser, durationMs: Date.now() - startTime });
        res.json({ success: true, data: stats, isAdmin: isAdminUser, generatedAt: new Date().toISOString(), requestId });
    } catch (error) {
        logger.error("api.dashboard.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "DB_ERROR", "Failed to fetch dashboard stats", requestId);
    }
});
