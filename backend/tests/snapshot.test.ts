// ===== JanSathi AI — Snapshot & Trends Unit Tests =====

import { describe, it, expect, afterAll } from "vitest";
import { cleanupTestData, disconnectDb } from "./helpers/db";
import { computeSnapshot } from "../src/jobs/dailySnapshot";
import { getTrends } from "../src/services/analytics.service";
import prisma from "../src/models/prisma";

afterAll(async () => {
    // Clean up any test snapshots
    await prisma.dailySnapshot.deleteMany({});
    await cleanupTestData();
    await disconnectDb();
});

describe("computeSnapshot", () => {
    it("should create a DailySnapshot record", async () => {
        const today = new Date();
        const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        await computeSnapshot(today);

        const snapshot = await prisma.dailySnapshot.findUnique({
            where: { date: dayStart },
        });

        expect(snapshot).toBeDefined();
        expect(snapshot!.totalUsers).toBeGreaterThanOrEqual(0);
        expect(snapshot!.activeUsers).toBeGreaterThanOrEqual(0);
        expect(snapshot!.totalConversations).toBeGreaterThanOrEqual(0);
    });

    it("should upsert idempotently (running twice produces same result)", async () => {
        const today = new Date();
        const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        await computeSnapshot(today);
        await computeSnapshot(today);

        const count = await prisma.dailySnapshot.count({
            where: { date: dayStart },
        });

        // Only one record — upsert doesn't duplicate
        expect(count).toBe(1);
    });
});

describe("getTrends", () => {
    it("should return structured trend data even with no snapshots", async () => {
        // Clean snapshots first
        await prisma.dailySnapshot.deleteMany({});

        const trends = await getTrends(7);

        expect(trends).toHaveProperty("snapshots");
        expect(trends).toHaveProperty("deltas");
        expect(trends.snapshots).toBeInstanceOf(Array);
        expect(trends.deltas).toHaveProperty("activeUsers", 0);
        expect(trends.deltas).toHaveProperty("conversations", 0);
        expect(trends.deltas).toHaveProperty("satisfaction", 0);
        expect(trends.deltas).toHaveProperty("resolvedRate", 0);
    });

    it("should return snapshots when data exists", async () => {
        // Create a snapshot for today
        await computeSnapshot(new Date());

        const trends = await getTrends(7);

        expect(trends.snapshots.length).toBeGreaterThanOrEqual(1);
        expect(trends.snapshots[0]).toHaveProperty("date");
        expect(trends.snapshots[0]).toHaveProperty("activeUsers");
        expect(trends.snapshots[0]).toHaveProperty("newConversations");
    });
});
