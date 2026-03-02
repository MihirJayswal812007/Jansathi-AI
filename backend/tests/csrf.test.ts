// ===== JanSathi AI — CSRF Protection Test =====
// Verifies that CSRF middleware rejects state-changing requests without tokens.

import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { request } from "./helpers/setup";
import { cleanupTestData, disconnectDb } from "./helpers/db";
import { _setCSRFEnabled } from "../src/middleware/csrf";

afterAll(async () => {
    await cleanupTestData();
    await disconnectDb();
});

describe("CSRF Protection", () => {
    beforeAll(() => {
        // Enable CSRF for this test suite
        _setCSRFEnabled(true);
    });

    afterAll(() => {
        // Restore disabled state for other test files
        _setCSRFEnabled(false);
    });

    it("should reject POST /api/chat without CSRF token", async () => {
        const res = await request
            .post("/api/chat")
            .send({ message: "hello", mode: "janseva" });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("CSRF_FAILED");
    });

    it("should reject PATCH without CSRF token", async () => {
        const res = await request
            .patch("/api/chat/some-id/feedback")
            .send({ satisfaction: 5 });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("CSRF_FAILED");
    });

    it("should allow GET requests without CSRF token", async () => {
        const res = await request.get("/api/health");
        expect(res.status).toBe(200);
    });

    it("should allow POST with valid CSRF token (cookie + header match)", async () => {
        // Seed a known CSRF token manually via cookie
        const token = "test-csrf-token-12345";

        // POST with matching cookie and header should pass CSRF
        // (may still fail on other validation, but not 403 CSRF)
        const res = await request
            .post("/api/chat")
            .set("Cookie", `jansathi_csrf=${token}`)
            .set("x-csrf-token", token)
            .send({ message: "hello", mode: "janseva" });

        // Should NOT be 403 CSRF — may be 400/401/500 for other reasons
        expect(res.status).not.toBe(403);
    });

    it("should reject POST when cookie and header tokens differ", async () => {
        const res = await request
            .post("/api/chat")
            .set("Cookie", "jansathi_csrf=token-a")
            .set("x-csrf-token", "token-b")
            .send({ message: "hello" });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("CSRF_FAILED");
    });

    it("should exempt /api/auth paths from CSRF", async () => {
        const res = await request
            .post("/api/auth/session")
            .send({});

        // Should NOT be 403 CSRF (may be 200 or 201)
        expect(res.status).not.toBe(403);
    });
});
