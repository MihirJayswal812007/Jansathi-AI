// ===== JanSathi AI — Auth Middleware (Express) =====
// Session-based authentication — create, retrieve, cookie management.
// Uses centralized config from config/env.ts.

import { Request, Response } from "express";
import { randomBytes } from "crypto";
import prisma from "../models/prisma";
import logger from "../utils/logger";
import { AUTH, APP } from "../config/env";
import { type SessionData } from "../utils/types";

const SESSION_MAX_AGE = AUTH.sessionMaxAgeSeconds;

export async function createSession(req: Request): Promise<SessionData> {
    const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.ip ||
        null;
    const userAgent = req.headers["user-agent"] || null;
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

    // Generate cryptographically random session token (256-bit entropy)
    const token = randomBytes(AUTH.tokenBytes).toString("hex");

    const session = await prisma.session.create({
        data: {
            token,
            ipAddress: ip,
            userAgent: userAgent ? userAgent.substring(0, 512) : null,
            expiresAt,
        },
    });

    logger.info("auth.session.created", { sessionId: session.id, ip });

    return {
        id: session.id,
        token: session.token,
        userId: session.userId,
        role: session.role,
        language: session.language,
    };
}

export async function getSession(req: Request): Promise<SessionData | null> {
    const token = req.cookies?.[AUTH.sessionCookieName];
    if (!token) return null;

    // JOIN User.role to derive role dynamically (fixes audit F1: role drift)
    const session = await prisma.session.findUnique({
        where: { token },
        include: { user: { select: { role: true, active: true } } },
    });
    if (!session) return null;

    if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => { });
        return null;
    }

    // Reject deactivated users — destroy session and deny access
    if (session.user && session.user.active === false) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => { });
        logger.warn("auth.deactivated_user.blocked", { userId: session.userId });
        return null;
    }

    return {
        id: session.id,
        token: session.token,
        userId: session.userId,
        // Derive role from User when linked, fall back to Session.role for anonymous
        role: session.user?.role ?? session.role,
        language: session.language,
    };
}

export async function resolveSession(
    req: Request
): Promise<{ session: SessionData; isNew: boolean }> {
    const existing = await getSession(req);
    if (existing) return { session: existing, isNew: false };
    const created = await createSession(req);
    return { session: created, isNew: true };
}

export function setSessionCookie(res: Response, token: string) {
    res.cookie(AUTH.sessionCookieName, token, {
        httpOnly: true,
        secure: APP.isProd,
        sameSite: APP.isProd ? "strict" : "lax",
        maxAge: SESSION_MAX_AGE * 1000,
        path: "/",
    });
}

export function isAdmin(session: SessionData): boolean {
    return session.role === "admin";
}

export async function promoteToAdmin(
    sessionId: string,
    secret: string
): Promise<boolean> {
    if (!AUTH.adminSecret || secret !== AUTH.adminSecret) return false;

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { userId: true },
    });

    // Update session role
    await prisma.session.update({
        where: { id: sessionId },
        data: { role: "admin" },
    });

    // Also update User.role if user is linked
    if (session?.userId) {
        await prisma.user.update({
            where: { id: session.userId },
            data: { role: "admin" },
        });
    }

    logger.info("auth.admin.promoted", { sessionId });
    return true;
}

// ── Session Lifecycle ───────────────────────────────────────
export async function destroySession(sessionId: string): Promise<void> {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => { });
    logger.info("auth.session.destroyed", { sessionId });
}

export function clearSessionCookie(res: Response): void {
    res.clearCookie(AUTH.sessionCookieName, {
        httpOnly: true,
        secure: APP.isProd,
        sameSite: APP.isProd ? "strict" : "lax",
        path: "/",
    });
}
