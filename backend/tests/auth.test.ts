// ===== JanSathi AI — Auth Integration Tests =====

import { describe, it, expect, afterAll } from "vitest";
import { request, createTestSession, SESSION_COOKIE } from "./helpers/setup";
import { cleanupTestData, disconnectDb } from "./helpers/db";

afterAll(async () => {
    await cleanupTestData();
    await disconnectDb();
});

describe("POST /api/auth/session", () => {
    it("should create a new session and set cookie", async () => {
        const res = await request.post("/api/auth/session");

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.session).toBeDefined();
        expect(res.body.session.token).toBeDefined();
        expect(res.body.session.role).toBe("user");

        // Cookie should be set
        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeDefined();
        const hasSid = Array.isArray(cookies)
            ? cookies.some((c: string) => c.includes(SESSION_COOKIE))
            : (cookies as string).includes(SESSION_COOKIE);
        expect(hasSid).toBe(true);
    });
});

describe("POST /api/auth/logout", () => {
    it("should destroy session and clear cookie", async () => {
        const { cookie } = await createTestSession();

        const res = await request
            .post("/api/auth/logout")
            .set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("Logged out");

        // Cookie should be cleared
        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeDefined();
    });

    it("should return success even without session cookie", async () => {
        const res = await request.post("/api/auth/logout");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should reject replayed cookie after logout", async () => {
        const { cookie } = await createTestSession();

        // Logout
        await request
            .post("/api/auth/logout")
            .set("Cookie", cookie);

        // Replay — session destroyed, should get 401 from authMiddleware
        const replayRes = await request
            .get("/api/user/profile")
            .set("Cookie", cookie);

        expect(replayRes.status).toBe(401);
    });
});

describe("GET /api/health", () => {
    it("should return health status", async () => {
        const res = await request.get("/api/health");

        expect(res.status).toBe(200);
        expect(res.body.status).toBe("ok");
        expect(res.body.service).toBeDefined();
    });
});

describe("404 handling", () => {
    it("should return 404 for unknown routes", async () => {
        const res = await request.get("/api/nonexistent");

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("NOT_FOUND");
    });
});
