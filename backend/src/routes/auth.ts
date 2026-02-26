// ===== JanSathi AI — Auth Routes =====
// Session management + OTP authentication endpoints.

import { Router, Request, Response } from "express";
import { authRateLimiter, sessionCheckRateLimiter } from "../middleware/rateLimiter";
import { sendError } from "../middleware/errorHandler";
import {
    createSession,
    getSession,
    setSessionCookie,
    destroySession,
    clearSessionCookie,
} from "../middleware/auth";
import { otpService } from "../services/otp.service";
import logger from "../utils/logger";

export const authRouter = Router();

// Rate limiters applied per-route (not globally) so session checks
// don't consume the strict OTP budget.

// POST /api/auth/session — Create or refresh session
authRouter.post("/session", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const existing = await getSession(req);

        if (existing) {
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

// GET /api/auth/session — Check current session (60 req/min — called on every page load)
authRouter.get("/session", sessionCheckRateLimiter, async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();
    const session = await getSession(req);

    if (!session) {
        return res.json({ success: true, authenticated: false, requestId });
    }

    res.json({ success: true, authenticated: true, session, requestId });
});

// POST /api/auth/request-otp — Request OTP (5 req/min strict)
authRouter.post("/request-otp", authRateLimiter, async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const { identifier } = req.body || {};

        if (!identifier || typeof identifier !== "string" || identifier.trim().length < 5) {
            return sendError(res, "INVALID_INPUT", "Valid phone number or email required", requestId);
        }

        const result = await otpService.requestOTP(identifier);

        if (!result.success) {
            return res.status(429).json({
                success: false,
                message: result.message,
                requestId,
            });
        }

        // Note: devOtp is only populated in development mode
        res.json({
            success: true,
            message: result.message,
            expiresInSeconds: result.expiresInSeconds,
            ...(result.devOtp ? { devOtp: result.devOtp } : {}),
            requestId,
        });
    } catch (error) {
        logger.error("auth.request_otp.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});

// POST /api/auth/verify-otp — Verify OTP and authenticate (5 req/min strict)
authRouter.post("/verify-otp", authRateLimiter, async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const { identifier, code } = req.body || {};

        if (!identifier || typeof identifier !== "string") {
            return sendError(res, "INVALID_INPUT", "Identifier required", requestId);
        }
        if (!code || typeof code !== "string" || code.length < 4) {
            return sendError(res, "INVALID_INPUT", "Valid OTP code required", requestId);
        }

        const result = await otpService.verifyOTP(identifier, code.trim());

        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.message,
                requestId,
            });
        }

        // Link user to session (create session if needed)
        const { session, isNew } = await (async () => {
            const existing = await getSession(req);
            if (existing) return { session: existing, isNew: false };
            const created = await createSession(req);
            return { session: created, isNew: true };
        })();

        // Link authenticated user to session
        await otpService.linkUserToSession(result.userId!, session.id);

        // Re-fetch session to get the correct role from User table
        const updatedSession = await getSession(req) || session;

        // Set cookie
        if (isNew) {
            setSessionCookie(res, session.token);
        }

        logger.info("auth.otp_verified", { requestId, userId: result.userId, sessionId: session.id });

        res.json({
            success: true,
            message: "Authentication successful",
            session: {
                ...updatedSession,
                userId: result.userId,
            },
            requestId,
        });
    } catch (error) {
        logger.error("auth.verify_otp.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});

// POST /api/auth/logout — Destroy session and clear cookie
authRouter.post("/logout", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();

    try {
        const session = await getSession(req);

        if (session) {
            await destroySession(session.id);
        }

        clearSessionCookie(res);

        logger.info("auth.logout", { requestId, sessionId: session?.id ?? "none" });

        res.json({
            success: true,
            message: "Logged out successfully",
            requestId,
        });
    } catch (error) {
        logger.error("auth.logout.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        // Still clear cookie even on error
        clearSessionCookie(res);
        res.json({ success: true, message: "Logged out", requestId });
    }
});
