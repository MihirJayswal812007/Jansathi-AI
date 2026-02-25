// ===== JanSathi AI — RBAC Middleware =====
// Role-Based Access Control for Express routes.
// authMiddleware: requires valid session (401 if absent)
// requireRole: requires specific role (403 if insufficient)

import { Request, Response, NextFunction } from "express";
import { getSession } from "./auth";
import { sendError } from "./errorHandler";
import logger from "../utils/logger";
import { type SessionData } from "../utils/types";

// ── Extend Express Request to carry session ─────────────────
declare global {
    namespace Express {
        interface Request {
            session?: SessionData;
        }
    }
}

/**
 * Middleware: Requires a valid, non-expired session.
 * Attaches session to req.session for downstream handlers.
 * Returns 401 if no valid session found.
 */
export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const session = await getSession(req);

        if (!session) {
            sendError(res, "UNAUTHORIZED", "Authentication required");
            return;
        }

        // Attach session to request for downstream middleware/handlers
        req.session = session;
        next();
    } catch (error) {
        logger.error("rbac.auth_middleware.error", {
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", "Authentication check failed");
    }
}

/**
 * Middleware factory: Requires the session to have a specific role.
 * Must be used AFTER authMiddleware (req.session must be populated).
 *
 * Usage: router.use(authMiddleware, requireRole("admin"))
 */
export function requireRole(...roles: string[]) {
    return function roleMiddleware(
        req: Request,
        res: Response,
        next: NextFunction
    ): void {
        const session = req.session;

        if (!session) {
            // authMiddleware should have run first — this is a misconfiguration
            logger.error("rbac.require_role.no_session", {
                path: req.path,
                hint: "requireRole must be used after authMiddleware",
            });
            sendError(res, "UNAUTHORIZED", "Authentication required");
            return;
        }

        if (!roles.includes(session.role)) {
            logger.warn("rbac.access_denied", {
                sessionId: session.id,
                requiredRoles: roles,
                actualRole: session.role,
                path: req.path,
            });
            sendError(res, "FORBIDDEN", "Insufficient permissions");
            return;
        }

        next();
    };
}

/** Alias for authMiddleware — semantic clarity */
export const requireAuth = authMiddleware;
