// ===== JanSathi AI — Chat Route (Express) =====
// POST /api/chat — Thin HTTP transport layer.
// All business logic lives in services/chat.service.ts.

import { Router, Request, Response } from "express";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
import { validateChatInput } from "../middleware/validator";
import { sendError } from "../middleware/errorHandler";
import { setSessionCookie } from "../middleware/auth";
import { handleChat } from "../services/chat.service";
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

        const result = await handleChat(req, body);

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
