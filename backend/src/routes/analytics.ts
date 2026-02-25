// ===== JanSathi AI — Analytics Route (Express) =====

import { Router, Request, Response } from "express";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
import { validateAnalyticsInput } from "../middleware/validator";
import { sendError } from "../middleware/errorHandler";
import { getSession } from "../middleware/auth";
import { authMiddleware } from "../middleware/rbac";
import { trackEvent } from "../services/analytics.service";
import logger from "../utils/logger";

export const analyticsRouter = Router();

analyticsRouter.use(rateLimitMiddleware);

analyticsRouter.post("/", authMiddleware, async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const body = req.body;

        const validationError = validateAnalyticsInput(body);
        if (validationError) return sendError(res, "INVALID_INPUT", validationError, requestId);

        const session = await getSession(req);
        const userId = session?.userId || null;

        await trackEvent(body.type, body.sessionId, body.metadata || {}, userId, body.mode || null);

        logger.info("api.analytics.tracked", { requestId, type: body.type, sessionId: body.sessionId });
        res.status(201).json({ success: true, requestId });
    } catch (error) {
        logger.error("api.analytics.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});
