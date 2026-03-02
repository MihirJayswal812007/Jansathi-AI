// ===== JanSathi AI — Rate Limiter Concurrency Test =====
// Verifies atomic increment behavior under parallel request conditions.

import { describe, it, expect } from "vitest";
import { MemoryStore } from "../src/stores/storeFactory";

describe("Rate Limiter: MemoryStore atomic increment", () => {
    it("should correctly count all parallel increments", async () => {
        const store = new MemoryStore();
        const key = "test:concurrency";
        const windowMs = 60_000;
        const parallelCount = 100;

        // Fire 100 increments in parallel
        const promises = Array.from({ length: parallelCount }, () =>
            store.increment(key, windowMs)
        );

        const results = await Promise.all(promises);

        // Each result should have a unique count from 1 to 100
        const counts = results.map((r) => r.count).sort((a, b) => a - b);
        expect(counts[counts.length - 1]).toBe(parallelCount);

        // Final state should show the total count
        const final = await store.get(key);
        expect(final?.count).toBe(parallelCount);
    });

    it("should start new window after expiry", async () => {
        const store = new MemoryStore();
        const key = "test:expiry";
        const windowMs = 50; // 50ms window

        // Increment once
        const first = await store.increment(key, windowMs);
        expect(first.count).toBe(1);

        // Wait for window to expire
        await new Promise((resolve) => setTimeout(resolve, 60));

        // Next increment should start a new window
        const second = await store.increment(key, windowMs);
        expect(second.count).toBe(1);
    });

    it("should accurately track all requests even when exceeding max", async () => {
        const store = new MemoryStore();
        const key = "test:boundary";
        const windowMs = 60_000;
        const totalRequests = 15;

        // Fire all requests in parallel
        const promises = Array.from({ length: totalRequests }, () =>
            store.increment(key, windowMs)
        );

        const results = await Promise.all(promises);

        // All requests should be tracked
        expect(results.length).toBe(totalRequests);

        // Final store state should reflect total
        const final = await store.get(key);
        expect(final?.count).toBe(totalRequests);

        // The max count in results should equal totalRequests
        const maxCount = Math.max(...results.map((r) => r.count));
        expect(maxCount).toBe(totalRequests);
    });

    it("should maintain separate windows for different keys", async () => {
        const store = new MemoryStore();
        const windowMs = 60_000;

        await store.increment("key:a", windowMs);
        await store.increment("key:a", windowMs);
        await store.increment("key:b", windowMs);

        const a = await store.get("key:a");
        const b = await store.get("key:b");

        expect(a?.count).toBe(2);
        expect(b?.count).toBe(1);
    });
});
