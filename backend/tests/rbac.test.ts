// ===== JanSathi AI — RBAC Boundary Tests =====
// Confirms normal users cannot access admin endpoints.

import { describe, it, expect, afterAll } from "vitest";
import { request, createAuthenticatedUser, createTestAdmin } from "./helpers/setup";
import { cleanupTestData, disconnectDb } from "./helpers/db";

afterAll(async () => {
    await cleanupTestData();
    await disconnectDb();
});

describe("RBAC Boundary: admin routes blocked for users", () => {
    it("should reject normal user from GET /api/admin/dashboard", async () => {
        const { session } = await createAuthenticatedUser({ role: "user" });

        const res = await request
            .get("/api/admin/dashboard")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("FORBIDDEN");
    });

    it("should reject normal user from GET /api/admin/users", async () => {
        const { session } = await createAuthenticatedUser({ role: "user" });

        const res = await request
            .get("/api/admin/users")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(403);
    });

    it("should reject normal user from GET /api/admin/search", async () => {
        const { session } = await createAuthenticatedUser({ role: "user" });

        const res = await request
            .get("/api/admin/search?query=test")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(403);
    });

    it("should reject unauthenticated request to admin routes", async () => {
        const res = await request.get("/api/admin/dashboard");

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("UNAUTHORIZED");
    });

    it("should allow admin to access admin dashboard", async () => {
        const { session } = await createTestAdmin();

        const res = await request
            .get("/api/admin/dashboard")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should reject if role is missing from session", async () => {
        // Create session without role — should fail closed
        const { session } = await createAuthenticatedUser({ role: "user" });

        // Even a "user" role should be rejected
        const res = await request
            .get("/api/admin/dashboard")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(403);
    });
});
