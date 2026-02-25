// ===== JanSathi AI — Analytics Route Integration Tests =====

import { describe, it, expect, afterAll } from "vitest";
import { request, createTestSession } from "./helpers/setup";
import { cleanupTestData, disconnectDb } from "./helpers/db";

afterAll(async () => {
    await cleanupTestData();
    await disconnectDb();
});

describe("POST /api/analytics", () => {
    it("should return 401 without session", async () => {
        const res = await request
            .post("/api/analytics")
            .send({ type: "page_view", sessionId: "test-123" });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("UNAUTHORIZED");
    });

    it("should track event with valid payload", async () => {
        const { cookie } = await createTestSession();

        const res = await request
            .post("/api/analytics")
            .set("Cookie", cookie)
            .send({
                type: "page_view",
                sessionId: "test-session-123",
                metadata: { page: "/home" },
                mode: "janseva",
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it("should return 400 when type is missing", async () => {
        const { cookie } = await createTestSession();

        const res = await request
            .post("/api/analytics")
            .set("Cookie", cookie)
            .send({ sessionId: "test-session-123" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_INPUT");
    });

    it("should return 400 when sessionId is missing", async () => {
        const { cookie } = await createTestSession();

        const res = await request
            .post("/api/analytics")
            .set("Cookie", cookie)
            .send({ type: "page_view" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_INPUT");
    });
});
