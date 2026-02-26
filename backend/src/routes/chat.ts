// ===== JanSathi AI — Chat Route (Express) =====
// POST /api/chat — Thin HTTP transport layer.
// All business logic lives in services/chat.service.ts.

import { Router, Request, Response } from "express";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
import { validateChatInput } from "../middleware/validator";
import { sendError } from "../middleware/errorHandler";
import { resolveSession, setSessionCookie } from "../middleware/auth";
import { handleChat } from "../services/chat.service";
import { endConversation } from "../services/conversation";
import { type ChatRequest } from "../utils/types";
import logger from "../utils/logger";

export const chatRouter = Router();
chatRouter.use(rateLimitMiddleware);

chatRouter.post("/", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const body = req.body as ChatRequest;

        const validationError = validateChatInput({
            message: body.message,
            mode: body.mode ?? undefined,
            language: body.language,
        });
        if (validationError) return sendError(res, "INVALID_INPUT", validationError, requestId);

        // Resolve session at HTTP layer — service receives pure data
        const { session, isNew } = await resolveSession(req);
        if (isNew) setSessionCookie(res, session.token);

        const result = await handleChat(session, body, isNew);

        if (result.sessionToken) setSessionCookie(res, result.sessionToken);

        res.json(result.response);
    } catch (error) {
        logger.error("chat.route.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});

// PATCH /api/chat/:id/feedback — Submit satisfaction rating for a conversation
chatRouter.patch("/:id/feedback", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const { id } = req.params;
        const { satisfaction } = req.body || {};

        if (!id || typeof id !== "string") {
            return sendError(res, "INVALID_INPUT", "Conversation ID required", requestId);
        }

        if (satisfaction === undefined || !Number.isInteger(satisfaction) || satisfaction < 1 || satisfaction > 5) {
            return sendError(res, "INVALID_INPUT", "Satisfaction must be an integer between 1 and 5", requestId);
        }

        await endConversation(id, satisfaction);

        logger.info("chat.feedback.submitted", { requestId, conversationId: id, satisfaction });

        res.json({
            success: true,
            message: "Feedback recorded",
            requestId,
        });
    } catch (error) {
        logger.error("chat.feedback.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});
