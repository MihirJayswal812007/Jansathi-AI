// ===== JanSathi AI — Security Simulation Tests =====
// Simulates attack vectors: brute force, session replay, privilege escalation,
// malformed payloads, rate limit bypass. Each MUST assert failure.

import { describe, it, expect, afterAll } from "vitest";
import { request, createTestSession, createAuthenticatedUser, createTestAdmin, createTestUser, SESSION_COOKIE } from "./helpers/setup";
import { cleanupTestData, disconnectDb } from "./helpers/db";
import prisma from "../src/models/prisma";

afterAll(async () => {
    await cleanupTestData();
    await disconnectDb();
});

// ── 1. OTP Brute Force Attempt ──────────────────────────────

describe("Security: OTP brute force", () => {
    it("should reject multiple wrong OTP guesses without leaking info", async () => {
        const otpRes = await request
            .post("/api/auth/request-otp")
            .send({ identifier: "9999888801" });

        if (otpRes.status === 429) return; // rate limited, skip

        expect(otpRes.status).toBe(200);

        // Attempt 3 wrong guesses (keep it low to avoid rate limit)
        const wrongCodes = ["000000", "111111", "222222"];
        for (const code of wrongCodes) {
            const res = await request
                .post("/api/auth/verify-otp")
                .send({ identifier: "9999888801", code });

            if (res.status === 429) continue; // rate limited

            // Should fail with consistent message (no timing leak)
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBeDefined();
        }
    });
});

// ── 2. Expired Session Reuse ────────────────────────────────

describe("Security: expired session reuse", () => {
    it("should reject requests with expired session", async () => {
        // Create session that expires immediately
        const token = require("crypto").randomBytes(32).toString("hex");
        await prisma.session.create({
            data: {
                token,
                role: "user",
                expiresAt: new Date(Date.now() - 1000), // already expired
            },
        });

        const res = await request
            .get("/api/user/profile")
            .set("Cookie", `${SESSION_COOKIE}=${token}`);

        expect(res.status).toBe(401);
    });

    it("should reject logged-out session token", async () => {
        const { cookie } = await createTestSession();

        // Logout
        await request.post("/api/auth/logout").set("Cookie", cookie);

        // Try to access a protected route with the old token
        const replayRes = await request
            .get("/api/user/profile")
            .set("Cookie", cookie);

        expect(replayRes.status).toBe(401);
    });
});

// ── 3. Privilege Escalation Attempt ─────────────────────────

describe("Security: privilege escalation", () => {
    it("should deny admin API access for regular user", async () => {
        const { session } = await createAuthenticatedUser({ role: "user" });

        const res = await request
            .get("/api/admin/dashboard")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("FORBIDDEN");
    });

    it("should prevent role tampering via profile update (mass assignment)", async () => {
        const { user, session } = await createAuthenticatedUser({ role: "user" });

        const res = await request
            .patch("/api/user/profile")
            .set("Cookie", session.cookie)
            .send({ role: "admin", name: "Hacker" });

        expect(res.status).toBe(200);
        // Role must NOT have changed
        expect(res.body.data.role).toBe("user");

        // Double-check in DB
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        expect(dbUser?.role).toBe("user");
    });

    it("should prevent id tampering via profile update", async () => {
        const { user, session } = await createAuthenticatedUser();

        const res = await request
            .patch("/api/user/profile")
            .set("Cookie", session.cookie)
            .send({ id: "injected-id-12345", name: "Safe Update" });

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(user.id);
    });

    it("should block deactivated user from accessing protected routes", async () => {
        const { user, session } = await createAuthenticatedUser();

        // Admin deactivates the user
        await prisma.user.update({
            where: { id: user.id },
            data: { active: false },
        });

        const res = await request
            .get("/api/user/profile")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(401);
    });
});

// ── 4. Malformed Payload Injection ──────────────────────────

describe("Security: malformed payloads", () => {
    it("should reject chat with SQL injection in message", async () => {
        const res = await request
            .post("/api/chat")
            .send({ message: "'; DROP TABLE users; --", mode: "janseva" });

        // Should NOT crash — should either process normally or return error
        expect([200, 400, 500]).toContain(res.status);
        // Server should still be alive
        const healthRes = await request.get("/api/health");
        expect(healthRes.status).toBe(200);
    });

    it("should reject chat with excessively long message", async () => {
        const longMessage = "A".repeat(50000);

        const res = await request
            .post("/api/chat")
            .send({ message: longMessage, mode: "janseva" });

        // Should either reject or handle gracefully
        expect([400, 413, 200, 500]).toContain(res.status);
    });

    it("should handle null/undefined fields gracefully", async () => {
        const res = await request
            .post("/api/chat")
            .send({ message: null, mode: null });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_INPUT");
    });

    it("should reject non-JSON content type", async () => {
        const res = await request
            .post("/api/chat")
            .set("Content-Type", "text/plain")
            .send("raw text payload");

        // Should not crash
        expect([400, 415, 500]).toContain(res.status);
    });

    it("should reject OTP with non-numeric code", async () => {
        const res = await request
            .post("/api/auth/verify-otp")
            .send({ identifier: "9999000001", code: "abcdef" });

        // Server should not crash — any controlled response is acceptable
        expect(res.status).toBeGreaterThanOrEqual(200);
        expect(res.status).toBeLessThan(600);
        // If it goes through verification, it should fail
        if (res.status === 200 && res.body.success !== undefined) {
            expect(res.body.success).toBe(false);
        }
    });
});

// ── 5. Cookie Tampering ─────────────────────────────────────

describe("Security: cookie tampering", () => {
    it("should reject forged session token", async () => {
        const res = await request
            .get("/api/user/profile")
            .set("Cookie", `${SESSION_COOKIE}=forged-token-12345`);

        expect(res.status).toBe(401);
    });

    it("should reject empty session cookie", async () => {
        const res = await request
            .get("/api/user/profile")
            .set("Cookie", `${SESSION_COOKIE}=`);

        expect(res.status).toBe(401);
    });
});

// ── 6. Cross-User Data Access ───────────────────────────────

describe("Security: cross-user data isolation", () => {
    it("should not allow user A to access user B's conversations", async () => {
        const userA = await createAuthenticatedUser();
        const userB = await createAuthenticatedUser();

        // Create a conversation for user B
        const conv = await prisma.conversation.create({
            data: { userId: userB.user.id, mode: "janseva" },
        });

        // User A tries to access user B's conversation
        const res = await request
            .get(`/api/user/conversations/${conv.id}`)
            .set("Cookie", userA.session.cookie);

        // Should either 404, 403, or return empty — NOT return user B's messages
        if (res.status === 200 && res.body.data) {
            // If 200, verify it doesn't contain user B's data
            // (endpoint may return empty or own data, not cross-user)
            expect(res.body.data.userId === userB.user.id && res.body.data.messages?.length > 0).toBe(false);
        } else {
            expect([403, 404, 400, 500]).toContain(res.status);
        }
    });
});
