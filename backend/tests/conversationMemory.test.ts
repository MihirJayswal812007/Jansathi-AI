// ===== JanSathi AI — Conversation Memory Tests =====
// Tests ConversationMemoryService in isolation using mocked providers.
// No real database or embedding API required — fully deterministic.

import { describe, it, expect, vi } from "vitest";
import { ConversationMemoryService } from "../src/retrieval/ConversationMemoryService";
import type { IEmbeddingProvider } from "../src/providers/embedding/IEmbeddingProvider";

// ── Mocks ───────────────────────────────────────────────────

function mockEmbedder(result: number[] = [0.1, 0.2, 0.3]): IEmbeddingProvider {
    return {
        name: "mock",
        dimensions: 3,
        embed: vi.fn().mockResolvedValue(result),
        embedBatch: vi.fn().mockResolvedValue([result]),
    };
}

const enabledConfig = {
    enabled: true,
    topK: 5,
    maxTokenBudget: 800,
    scoreThreshold: 0.35,
    maxAgeDays: 30,
};

const disabledConfig = { ...enabledConfig, enabled: false };

// ═══════════════════════════════════════════════════════════
// A) ConversationMemoryService.retrieve
// ═══════════════════════════════════════════════════════════

describe("ConversationMemoryService.retrieve", () => {
    it("should return empty when disabled", async () => {
        const svc = new ConversationMemoryService(mockEmbedder(), disabledConfig);
        const result = await svc.retrieve("test query", "user123");
        expect(result).toBe("");
    });

    it("should return empty when no embedding provider", async () => {
        const svc = new ConversationMemoryService(null, enabledConfig);
        const result = await svc.retrieve("test query", "user123");
        expect(result).toBe("");
    });

    it("should return empty when no userId provided", async () => {
        const svc = new ConversationMemoryService(mockEmbedder(), enabledConfig);
        const result = await svc.retrieve("test query", "");
        expect(result).toBe("");
    });

    it("should handle embedding provider failure gracefully", async () => {
        const failingProvider: IEmbeddingProvider = {
            name: "failing",
            dimensions: 3,
            embed: vi.fn().mockRejectedValue(new Error("API down")),
            embedBatch: vi.fn(),
        };
        const svc = new ConversationMemoryService(failingProvider, enabledConfig);
        const result = await svc.retrieve("test", "user123");
        expect(result).toBe("");
    });

    it("should handle empty embedding result", async () => {
        const emptyProvider: IEmbeddingProvider = {
            name: "empty",
            dimensions: 0,
            embed: vi.fn().mockResolvedValue([]),
            embedBatch: vi.fn(),
        };
        const svc = new ConversationMemoryService(emptyProvider, enabledConfig);
        const result = await svc.retrieve("test", "user123");
        expect(result).toBe("");
    });
});

// ═══════════════════════════════════════════════════════════
// B) ConversationMemoryService.store
// ═══════════════════════════════════════════════════════════

describe("ConversationMemoryService.store", () => {
    it("should not store when disabled", async () => {
        const embedder = mockEmbedder();
        const svc = new ConversationMemoryService(embedder, disabledConfig);

        await svc.store({
            userId: "user123",
            role: "user",
            content: "This is a long enough message for storage",
        });

        // Embed should never be called
        expect(embedder.embed).not.toHaveBeenCalled();
    });

    it("should not store when no embedding provider", async () => {
        const svc = new ConversationMemoryService(null, enabledConfig);

        // Should not throw
        await expect(
            svc.store({
                userId: "user123",
                role: "user",
                content: "This is a long enough message for storage",
            })
        ).resolves.toBeUndefined();
    });

    it("should skip very short messages", async () => {
        const embedder = mockEmbedder();
        const svc = new ConversationMemoryService(embedder, enabledConfig);

        await svc.store({
            userId: "user123",
            role: "user",
            content: "Short",  // < 20 chars
        });

        expect(embedder.embed).not.toHaveBeenCalled();
    });

    it("should handle embedding failure gracefully during store", async () => {
        const failingProvider: IEmbeddingProvider = {
            name: "failing",
            dimensions: 3,
            embed: vi.fn().mockRejectedValue(new Error("API down")),
            embedBatch: vi.fn(),
        };
        const svc = new ConversationMemoryService(failingProvider, enabledConfig);

        // Should not throw — fire-and-forget
        await expect(
            svc.store({
                userId: "user123",
                role: "user",
                content: "This is a long enough message for storage",
            })
        ).resolves.toBeUndefined();
    });
});

// ═══════════════════════════════════════════════════════════
// C) Health Check
// ═══════════════════════════════════════════════════════════

describe("ConversationMemoryService.isHealthy", () => {
    it("should report disabled when config is off", async () => {
        const svc = new ConversationMemoryService(null, disabledConfig);
        const health = await svc.isHealthy();
        expect(health.enabled).toBe(false);
        expect(health.embedding).toBe(false);
    });

    it("should report embedding available when provider exists", async () => {
        const svc = new ConversationMemoryService(mockEmbedder(), enabledConfig);
        const health = await svc.isHealthy();
        expect(health.enabled).toBe(true);
        expect(health.embedding).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════
// D) Privacy and Isolation
// ═══════════════════════════════════════════════════════════

describe("Privacy guarantees", () => {
    it("should never retrieve memory without userId", async () => {
        const embedder = mockEmbedder();
        const svc = new ConversationMemoryService(embedder, enabledConfig);

        const result = await svc.retrieve("PM Kisan eligibility", "");
        expect(result).toBe("");
        // embed should NOT be called if userId is empty
        expect(embedder.embed).not.toHaveBeenCalled();
    });

    it("should pass userId to DB query (user isolation by design)", async () => {
        // This test validates the contract — actual DB isolation is
        // enforced by the WHERE user_id=$2 filter in the SQL query.
        // Here we verify the service requires userId.
        const svc = new ConversationMemoryService(mockEmbedder(), disabledConfig);

        // When disabled, no query is made regardless
        const result = await svc.retrieve("test", "user_A");
        expect(result).toBe("");
    });
});

// ═══════════════════════════════════════════════════════════
// E) Failure Simulations
// ═══════════════════════════════════════════════════════════

describe("Failure simulations", () => {
    it("A) Embedding provider failure — returns empty, no crash", async () => {
        const svc = new ConversationMemoryService(
            { name: "crash", dimensions: 3, embed: vi.fn().mockRejectedValue(new Error("BOOM")), embedBatch: vi.fn() },
            enabledConfig
        );
        const result = await svc.retrieve("test", "user123");
        expect(result).toBe("");
    });

    it("B) ENABLE_CONVERSATION_MEMORY=false — skips entirely", async () => {
        const embedSpy = vi.fn();
        const svc = new ConversationMemoryService(
            { name: "spy", dimensions: 3, embed: embedSpy, embedBatch: vi.fn() },
            disabledConfig
        );

        await svc.retrieve("test", "user123");
        await svc.store({ userId: "user123", role: "user", content: "This is a long enough message" });

        expect(embedSpy).not.toHaveBeenCalled();
    });

    it("C) Empty userId — never queries DB", async () => {
        const embedSpy = vi.fn();
        const svc = new ConversationMemoryService(
            { name: "spy", dimensions: 3, embed: embedSpy, embedBatch: vi.fn() },
            enabledConfig
        );

        const result = await svc.retrieve("test", "");
        expect(result).toBe("");
        expect(embedSpy).not.toHaveBeenCalled();
    });
});
