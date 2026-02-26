// ===== JanSathi AI — User Profile Integration Tests =====

import { describe, it, expect, afterAll } from "vitest";
import { request, createAuthenticatedUser, createTestSession, createTestConversation } from "./helpers/setup";
import { cleanupTestData, disconnectDb } from "./helpers/db";

afterAll(async () => {
    await cleanupTestData();
    await disconnectDb();
});

describe("GET /api/user/profile", () => {
    it("should return 401 without session", async () => {
        const res = await request.get("/api/user/profile");
        expect(res.status).toBe(401);
    });

    it("should return 401 with session but no linked user", async () => {
        const { cookie } = await createTestSession(); // anonymous session

        const res = await request
            .get("/api/user/profile")
            .set("Cookie", cookie);

        // Route checks req.session.userId — anonymous sessions have userId=null
        expect([401, 404]).toContain(res.status);
    });

    it("should return profile for authenticated user", async () => {
        const { user, session } = await createAuthenticatedUser({ name: "Test Profile" });

        const res = await request
            .get("/api/user/profile")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(user.id);
        expect(res.body.data.name).toBe("Test Profile");
    });
});

describe("PATCH /api/user/profile", () => {
    it("should update whitelisted fields", async () => {
        const { session } = await createAuthenticatedUser();

        const res = await request
            .patch("/api/user/profile")
            .set("Cookie", session.cookie)
            .send({ name: "Updated Name", village: "TestVillage" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Updated Name");
        expect(res.body.data.village).toBe("TestVillage");
    });

    it("should strip role from update payload (mass assignment protection)", async () => {
        const { user, session } = await createAuthenticatedUser();

        const res = await request
            .patch("/api/user/profile")
            .set("Cookie", session.cookie)
            .send({ role: "admin", name: "Innocent Update" });

        expect(res.status).toBe(200);
        // Role should NOT have changed
        expect(res.body.data.role).toBe("user");
        expect(res.body.data.name).toBe("Innocent Update");
    });

    it("should strip id from update payload", async () => {
        const { user, session } = await createAuthenticatedUser();

        const res = await request
            .patch("/api/user/profile")
            .set("Cookie", session.cookie)
            .send({ id: "injected-id", name: "Safe Update" });

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(user.id); // unchanged
    });

    it("should return 401 without session", async () => {
        const res = await request
            .patch("/api/user/profile")
            .send({ name: "Hacker" });

        expect(res.status).toBe(401);
    });
});

describe("GET /api/user/preferences", () => {
    it("should return preferences for authenticated user", async () => {
        const { session } = await createAuthenticatedUser();

        const res = await request
            .get("/api/user/preferences")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("voiceEnabled");
        expect(res.body.data).toHaveProperty("fontSize");
    });
});

describe("GET /api/user/conversations", () => {
    it("should return 401 without session", async () => {
        const res = await request.get("/api/user/conversations");
        expect(res.status).toBe(401);
    });

    it("should return paginated conversations for authenticated user", async () => {
        const { user, session } = await createAuthenticatedUser();
        await createTestConversation(user.id, "janseva");
        await createTestConversation(user.id, "jankrishi");

        const res = await request
            .get("/api/user/conversations?page=1&limit=10")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        expect(res.body.pagination).toHaveProperty("page", 1);
        expect(res.body.pagination).toHaveProperty("totalPages");
    });

    it("should return empty list for fresh user", async () => {
        const { session } = await createAuthenticatedUser();

        const res = await request
            .get("/api/user/conversations")
            .set("Cookie", session.cookie);

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });
});

describe("GET /api/user/conversations/:id", () => {
    it("should return conversation detail with messages", async () => {
        const { user, session } = await createAuthenticatedUser();
        const convId = await createTestConversation(user.id);

        const res = await request
            .get(`/api/user/conversations/${convId}`)
            .set("Cookie", session.cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(convId);
        expect(res.body.data.messages).toBeInstanceOf(Array);
        expect(res.body.data.messages.length).toBe(2);
    });

    it("should return error for non-existent conversation", async () => {
        const { session } = await createAuthenticatedUser();

        const res = await request
            .get("/api/user/conversations/non-existent-id")
            .set("Cookie", session.cookie);

        expect([400, 404, 500]).toContain(res.status);
    });
});
