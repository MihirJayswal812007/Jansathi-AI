// ===== JanSathi AI — Auth Middleware (Express) =====
// Session-based authentication — create, retrieve, cookie management

import { Request, Response } from "express";
import prisma from "../models/prisma";
import logger from "../utils/logger";
import { type SessionData } from "../utils/types";

const SESSION_COOKIE_NAME = "jansathi_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

export async function createSession(req: Request): Promise<SessionData> {
    const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.ip ||
        null;
    const userAgent = req.headers["user-agent"] || null;
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

    const session = await prisma.session.create({
        data: {
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
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (!token) return null;

    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return null;

    if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => { });
        return null;
    }

    return {
        id: session.id,
        token: session.token,
        userId: session.userId,
        role: session.role,
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
    res.cookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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
    if (!ADMIN_SECRET || secret !== ADMIN_SECRET) return false;
    await prisma.session.update({
        where: { id: sessionId },
        data: { role: "admin" },
    });
    logger.info("auth.admin.promoted", { sessionId });
    return true;
}
