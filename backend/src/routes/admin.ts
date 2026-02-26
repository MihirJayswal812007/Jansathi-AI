import { Router, Request, Response } from "express";
import { authMiddleware, requireRole } from "../middleware/rbac";
import { adminRateLimiter } from "../middleware/rateLimiter";
import { sendError } from "../middleware/errorHandler";
import { getDashboardStats, getTrends } from "../services/analytics.service";
import { searchConversations, getConversationHistory } from "../services/conversation";
import prisma from "../models/prisma";
import logger from "../utils/logger";

export const adminRouter = Router();

// ── Global middleware for ALL admin routes ───────────────────
adminRouter.use(adminRateLimiter);
adminRouter.use(authMiddleware);
adminRouter.use(requireRole("admin"));

// GET /api/admin/dashboard — Dashboard stats
adminRouter.get("/dashboard", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();
    const startTime = Date.now();

    try {
        const stats = await getDashboardStats();

        logger.info("api.admin.dashboard.served", {
            requestId,
            adminId: req.session?.userId,
            durationMs: Date.now() - startTime,
        });

        res.json({
            success: true,
            data: stats,
            generatedAt: new Date().toISOString(),
            requestId,
        });
    } catch (error) {
        logger.error("api.admin.dashboard.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "DB_ERROR", "Failed to fetch dashboard stats", requestId);
    }
});

// GET /api/admin/users — List users (paginated)
adminRouter.get("/users", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    phone: true,
                    email: true,
                    name: true,
                    role: true,
                    language: true,
                    state: true,
                    createdAt: true,
                    lastActiveAt: true,
                },
                orderBy: { lastActiveAt: "desc" },
            }),
            prisma.user.count(),
        ]);

        res.json({
            success: true,
            data: users,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            requestId,
        });
    } catch (error) {
        logger.error("api.admin.users.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "DB_ERROR", "Failed to fetch users", requestId);
    }
});

// GET /api/admin/trends — 7-day rolling trend data
adminRouter.get("/trends", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const days = Math.min(30, Math.max(1, parseInt(req.query.days as string) || 7));
        const trends = await getTrends(days);

        res.json({
            success: true,
            data: trends,
            requestId,
        });
    } catch (error) {
        logger.error("api.admin.trends.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "DB_ERROR", "Failed to fetch trends", requestId);
    }
});

// GET /api/admin/conversations — Search conversations (filterable, paginated)
adminRouter.get("/conversations", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
        const mode = req.query.mode as string | undefined;
        const resolved = req.query.resolved === "true" ? true : req.query.resolved === "false" ? false : undefined;

        const result = await searchConversations({ mode, resolved, page, limit });

        res.json({
            success: true,
            data: result.conversations,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
            requestId,
        });
    } catch (error) {
        logger.error("api.admin.conversations.list.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "DB_ERROR", "Failed to fetch conversations", requestId);
    }
});

// GET /api/admin/conversations/:id — Conversation detail with messages
adminRouter.get("/conversations/:id", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const id = req.params.id as string;
        const conversation = await getConversationHistory(id);

        if (!conversation) {
            return sendError(res, "INVALID_INPUT", "Conversation not found", requestId);
        }

        res.json({ success: true, data: conversation, requestId });
    } catch (error) {
        logger.error("api.admin.conversations.detail.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "DB_ERROR", "Failed to fetch conversation", requestId);
    }
});
