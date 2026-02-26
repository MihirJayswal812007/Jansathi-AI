// ===== JanSathi AI — User Routes =====
// Profile and preferences management. All routes require authentication.

import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/rbac";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
import { sendError } from "../middleware/errorHandler";
import { userService } from "../services/user.service";
import { listConversations, getConversationHistory } from "../services/conversation";
import logger from "../utils/logger";

export const userRouter = Router();

// All user routes require authentication
userRouter.use(rateLimitMiddleware);
userRouter.use(authMiddleware);

// GET /api/user/profile — Get current user's profile
userRouter.get("/profile", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const userId = req.session?.userId;
        if (!userId) {
            return sendError(res, "UNAUTHORIZED", "User not linked to session. Complete OTP verification first.", requestId);
        }

        const profile = await userService.getProfile(userId);
        if (!profile) {
            return sendError(res, "INTERNAL_ERROR", "User record not found", requestId);
        }

        res.json({ success: true, data: profile, requestId });
    } catch (error) {
        logger.error("api.user.profile.get.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});

// PATCH /api/user/profile — Update current user's profile
userRouter.patch("/profile", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const userId = req.session?.userId;
        if (!userId) {
            return sendError(res, "UNAUTHORIZED", "User not linked to session", requestId);
        }

        const updated = await userService.updateProfile(userId, req.body || {});
        res.json({ success: true, data: updated, requestId });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Validation errors are user-facing
        if (message.includes("must be") || message.includes("No valid")) {
            return sendError(res, "INVALID_INPUT", message, requestId);
        }
        logger.error("api.user.profile.update.error", { requestId, error: message });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});

// GET /api/user/preferences — Get current user's preferences
userRouter.get("/preferences", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const userId = req.session?.userId;
        if (!userId) {
            return sendError(res, "UNAUTHORIZED", "User not linked to session", requestId);
        }

        const prefs = await userService.getPreferences(userId);
        if (!prefs) {
            return sendError(res, "INTERNAL_ERROR", "User record not found", requestId);
        }

        res.json({ success: true, data: prefs, requestId });
    } catch (error) {
        logger.error("api.user.preferences.get.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});

// PATCH /api/user/preferences — Update current user's preferences
userRouter.patch("/preferences", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const userId = req.session?.userId;
        if (!userId) {
            return sendError(res, "UNAUTHORIZED", "User not linked to session", requestId);
        }

        const updated = await userService.updatePreferences(userId, req.body || {});
        res.json({ success: true, data: updated, requestId });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("must be") || message.includes("Invalid") || message.includes("No valid")) {
            return sendError(res, "INVALID_INPUT", message, requestId);
        }
        logger.error("api.user.preferences.update.error", { requestId, error: message });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});

// GET /api/user/conversations — List user's conversations (paginated)
userRouter.get("/conversations", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const userId = req.session?.userId;
        if (!userId) {
            return sendError(res, "UNAUTHORIZED", "User not linked to session", requestId);
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

        const result = await listConversations(userId, page, limit);

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
        logger.error("api.user.conversations.list.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});

// GET /api/user/conversations/:id — Get conversation detail with messages
userRouter.get("/conversations/:id", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const userId = req.session?.userId;
        if (!userId) {
            return sendError(res, "UNAUTHORIZED", "User not linked to session", requestId);
        }

        const id = req.params.id as string;
        const conversation = await getConversationHistory(id);

        if (!conversation) {
            return sendError(res, "INVALID_INPUT", "Conversation not found", requestId);
        }

        res.json({ success: true, data: conversation, requestId });
    } catch (error) {
        logger.error("api.user.conversations.detail.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});
