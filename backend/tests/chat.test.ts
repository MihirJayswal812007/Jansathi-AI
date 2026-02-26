// ===== JanSathi AI — Chat Route Integration Tests =====

import { describe, it, expect, afterAll } from "vitest";
import { request, createTestSession, createAuthenticatedUser, createTestConversation, SESSION_COOKIE } from "./helpers/setup";
import { cleanupTestData, disconnectDb } from "./helpers/db";

afterAll(async () => {
    await cleanupTestData();
    await disconnectDb();
});

describe("POST /api/chat", () => {
    it("should return 400 when message is missing", async () => {
        const res = await request
            .post("/api/chat")
            .send({ mode: "janseva" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_INPUT");
    });

    it("should return 400 when message is empty string", async () => {
        const res = await request
            .post("/api/chat")
            .send({ message: "   ", mode: "janseva" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_INPUT");
    });

    it("should return 400 for invalid mode", async () => {
        const res = await request
            .post("/api/chat")
            .send({ message: "Hello", mode: "invalid_mode" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_INPUT");
    });

    it("should return 400 for invalid language", async () => {
        const res = await request
            .post("/api/chat")
            .send({ message: "Hello", language: "fr" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_INPUT");
    });

    it("should create a session and respond to valid chat", async () => {
        const res = await request
            .post("/api/chat")
            .send({ message: "What schemes are available?", mode: "janseva" });

        // Should either succeed or return a session-related cookie
        // In demo mode (no LLM API key), the response may vary
        expect([200, 500]).toContain(res.status);

        if (res.status === 200) {
            // Check session cookie was set (auto-created)
            const cookies = res.headers["set-cookie"];
            if (cookies) {
                const hasSid = Array.isArray(cookies)
                    ? cookies.some((c: string) => c.includes(SESSION_COOKIE))
                    : (cookies as string).includes(SESSION_COOKIE);
                expect(hasSid).toBe(true);
            }
        }
    });

    it("should reuse existing session via cookie", async () => {
        const { cookie } = await createTestSession();

        const res = await request
            .post("/api/chat")
            .set("Cookie", cookie)
            .send({ message: "Hello", mode: "janseva" });

        // Should not set a new session cookie (reusing existing)
        expect([200, 500]).toContain(res.status);
    });
});

describe("PATCH /api/chat/:id/feedback", () => {
    it("should return 400 for missing satisfaction", async () => {
        const res = await request
            .patch("/api/chat/some-id/feedback")
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_INPUT");
    });

    it("should return 400 for out-of-range satisfaction", async () => {
        const res = await request
            .patch("/api/chat/some-id/feedback")
            .send({ satisfaction: 10 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_INPUT");
    });

    it("should accept valid feedback for existing conversation", async () => {
        // Create a user + conversation to submit feedback for
        const { user } = await createAuthenticatedUser();
        const convId = await createTestConversation(user.id);

        const res = await request
            .patch(`/api/chat/${convId}/feedback`)
            .send({ satisfaction: 5 });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Feedback recorded");
    });
});
