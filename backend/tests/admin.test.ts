// ===== JanSathi AI — Admin Route Integration Tests =====

import { describe, it, expect, afterAll } from "vitest";
import { request, createTestSession, createTestAdmin } from "./helpers/setup";
import { cleanupTestData, disconnectDb } from "./helpers/db";

afterAll(async () => {
    await cleanupTestData();
    await disconnectDb();
});

describe("GET /api/admin/dashboard", () => {
    it("should return 401 without session", async () => {
        const res = await request.get("/api/admin/dashboard");
        expect(res.status).toBe(401);
        expect(res.body.error).toBe("UNAUTHORIZED");
    });

    it("should return 403 for non-admin user", async () => {
        const { cookie } = await createTestSession();

        const res = await request
            .get("/api/admin/dashboard")
            .set("Cookie", cookie);

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("FORBIDDEN");
    });

    it("should return dashboard stats for admin", async () => {
        const { session } = await createTestAdmin();

        const res = await request
            .get("/api/admin/dashboard")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data).toHaveProperty("totalUsers");
        expect(res.body.data).toHaveProperty("activeUsersToday");
        expect(res.body.data).toHaveProperty("totalConversations");
        expect(res.body.data).toHaveProperty("moduleUsage");
        expect(res.body.data).toHaveProperty("dailyActiveUsers");
        expect(res.body.data).toHaveProperty("satisfactionAvg");
        expect(res.body.data).toHaveProperty("resolvedRate");
        expect(res.body.generatedAt).toBeDefined();
    });
});

describe("GET /api/admin/users", () => {
    it("should return 403 for non-admin user", async () => {
        const { cookie } = await createTestSession();

        const res = await request
            .get("/api/admin/users")
            .set("Cookie", cookie);

        expect(res.status).toBe(403);
    });

    it("should return paginated user list for admin", async () => {
        const { session } = await createTestAdmin();

        const res = await request
            .get("/api/admin/users?page=1&limit=5")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination).toHaveProperty("page", 1);
        expect(res.body.pagination).toHaveProperty("limit", 5);
        expect(res.body.pagination).toHaveProperty("total");
        expect(res.body.pagination).toHaveProperty("totalPages");
    });
});

describe("GET /api/admin/trends", () => {
    it("should return 403 for non-admin user", async () => {
        const { cookie } = await createTestSession();

        const res = await request
            .get("/api/admin/trends")
            .set("Cookie", cookie);

        expect(res.status).toBe(403);
    });

    it("should return trend data for admin", async () => {
        const { session } = await createTestAdmin();

        const res = await request
            .get("/api/admin/trends")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data).toHaveProperty("snapshots");
        expect(res.body.data).toHaveProperty("deltas");
        expect(res.body.data.deltas).toHaveProperty("activeUsers");
        expect(res.body.data.deltas).toHaveProperty("conversations");
        expect(res.body.data.deltas).toHaveProperty("satisfaction");
        expect(res.body.data.deltas).toHaveProperty("resolvedRate");
        expect(res.body.data.snapshots).toBeInstanceOf(Array);
    });

    it("should respect days query param", async () => {
        const { session } = await createTestAdmin();

        const res = await request
            .get("/api/admin/trends?days=3")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(200);
        expect(res.body.data.snapshots.length).toBeLessThanOrEqual(3);
    });
});
