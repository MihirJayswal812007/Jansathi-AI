// ===== JanSathi AI — Test Setup Helpers =====
// Provides Supertest agent and session factory for integration tests.

import supertest from "supertest";
import { app } from "../../src/index";
import prisma from "../../src/models/prisma";
import { randomBytes } from "crypto";
import { AUTH } from "../../src/config/env";

/** Supertest agent bound to the app */
export const request = supertest(app);

/** Cookie name for session */
export const SESSION_COOKIE = AUTH.sessionCookieName;

/**
 * Create a test session directly in DB (bypasses OTP flow).
 * Returns { sessionId, token, cookie } for use in authenticated requests.
 */
export async function createTestSession(options?: {
    userId?: string;
    role?: string;
}) {
    const token = randomBytes(32).toString("hex");
    const session = await prisma.session.create({
        data: {
            token,
            role: options?.role ?? "user",
            userId: options?.userId ?? null,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        },
    });

    const cookie = `${SESSION_COOKIE}=${token}`;
    return { sessionId: session.id, token, cookie };
}

/**
 * Create a test user directly in DB.
 * Returns the created user record.
 */
export async function createTestUser(overrides?: {
    phone?: string;
    role?: string;
    name?: string;
}) {
    const unique = randomBytes(4).toString("hex");
    return prisma.user.create({
        data: {
            phone: overrides?.phone ?? `+91${unique}0000`,
            name: overrides?.name ?? `TestUser_${unique}`,
            role: overrides?.role ?? "user",
            language: "en",
        },
    });
}

/**
 * Create a test user WITH a linked session.
 * Returns { user, session: { sessionId, token, cookie } }.
 */
export async function createAuthenticatedUser(overrides?: {
    role?: string;
    name?: string;
}) {
    const user = await createTestUser(overrides);
    const session = await createTestSession({
        userId: user.id,
        role: user.role,
    });
    return { user, session };
}

/**
 * Create a test admin with linked session.
 * Convenience wrapper for admin-scoped tests.
 */
export async function createTestAdmin() {
    return createAuthenticatedUser({ role: "admin", name: "TestAdmin" });
}
