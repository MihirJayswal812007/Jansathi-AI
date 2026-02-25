// ===== JanSathi AI — Auth Route (Express) =====

import { Router, Request, Response } from "express";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
import { sendError } from "../middleware/errorHandler";
import {
    createSession,
    getSession,
    setSessionCookie,
    promoteToAdmin,
} from "../middleware/auth";
import logger from "../utils/logger";

export const authRouter = Router();

authRouter.use(rateLimitMiddleware);

// POST /api/auth/session — Create or refresh session
authRouter.post("/session", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const existing = await getSession(req);

        if (existing) {
            // Check for admin promotion
            const { adminSecret } = req.body || {};
            if (adminSecret) {
                const promoted = await promoteToAdmin(existing.id, adminSecret);
                if (promoted) {
                    logger.info("auth.admin.promoted", { requestId, sessionId: existing.id });
                    return res.json({
                        success: true,
                        session: { ...existing, role: "admin" },
                        promoted: true,
                        requestId,
                    });
                }
            }

            return res.json({
                success: true,
                session: existing,
                isNew: false,
                requestId,
            });
        }

        // Create new session
        const session = await createSession(req);
        setSessionCookie(res, session.token);

        logger.info("auth.session.created_via_route", { requestId, sessionId: session.id });

        res.status(201).json({
            success: true,
            session,
            isNew: true,
            requestId,
        });
    } catch (error) {
        logger.error("auth.session.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});

// GET /api/auth/session — Check current session
authRouter.get("/session", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();
    const session = await getSession(req);

    if (!session) {
        return res.json({ success: true, authenticated: false, requestId });
    }

    res.json({ success: true, authenticated: true, session, requestId });
});
