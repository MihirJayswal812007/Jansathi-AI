// ===== JanSathi AI — Retrieval System Tests =====
// Tests RetrievalService, contextCompressor, and mocked vector store.
// No real database or embedding API required — fully deterministic.

import { describe, it, expect, vi } from "vitest";
import { RetrievalService } from "../src/retrieval/RetrievalService";
import { compressContext, estimateTokens } from "../src/retrieval/contextCompressor";
import type { IVectorStore, RetrievedDocument } from "../src/retrieval/types";
import type { IEmbeddingProvider } from "../src/providers/embedding/IEmbeddingProvider";

// ── Mock Factories ──────────────────────────────────────────

function mockEmbeddingProvider(embedResult: number[] = [0.1, 0.2, 0.3]): IEmbeddingProvider {
    return {
        name: "mock",
        dimensions: 3,
        embed: vi.fn().mockResolvedValue(embedResult),
        embedBatch: vi.fn().mockResolvedValue([embedResult]),
    };
}

function mockVectorStore(searchResults: RetrievedDocument[] = []): IVectorStore {
    return {
        search: vi.fn().mockResolvedValue(searchResults),
        upsert: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        isAvailable: vi.fn().mockResolvedValue(true),
    };
}

const SAMPLE_DOCS: RetrievedDocument[] = [
    { id: "d1", module: "janseva", content: "PM Kisan Samman Nidhi provides ₹6000 per year to eligible farmers in three installments.", score: 0.92, metadata: {} },
    { id: "d2", module: "janseva", content: "Ayushman Bharat provides health coverage up to ₹5 lakh per family per year.", score: 0.85, metadata: {} },
    { id: "d3", module: "janseva", content: "Ration Card application requires Aadhaar, income certificate, and passport photo.", score: 0.78, metadata: {} },
    { id: "d4", module: "janseva", content: "Pradhan Mantri Awas Yojana provides housing assistance to eligible beneficiaries.", score: 0.71, metadata: {} },
    { id: "d5", module: "janseva", content: "National Pension Scheme offers retirement savings with government contribution.", score: 0.65, metadata: {} },
];

// ═══════════════════════════════════════════════════════════
// A) Context Compressor
// ═══════════════════════════════════════════════════════════

describe("contextCompressor", () => {
    it("should estimate tokens reasonably", () => {
        // "Hello world" → should be between 2-5 tokens regardless of tokenizer
        expect(estimateTokens("Hello world")).toBeGreaterThanOrEqual(2);
        expect(estimateTokens("Hello world")).toBeLessThanOrEqual(5);
        expect(estimateTokens("")).toBe(0);
        // 400 Latin chars → should be ~80-120 tokens
        expect(estimateTokens("A".repeat(400))).toBeGreaterThanOrEqual(50);
        expect(estimateTokens("A".repeat(400))).toBeLessThanOrEqual(200);
    });

    it("should format docs as numbered list", () => {
        const result = compressContext(SAMPLE_DOCS.slice(0, 2), 10000);
        expect(result).toContain("[1]");
        expect(result).toContain("[2]");
        expect(result).toContain("PM Kisan");
        expect(result).toContain("Ayushman");
    });

    it("should respect token budget", () => {
        // First doc formatted is ~31 tokens. Budget of 35 should fit first doc only.
        const result = compressContext(SAMPLE_DOCS, 35);
        expect(result).toContain("PM Kisan");
        // Second doc is also ~25+ tokens — total would exceed 35
        expect(result).not.toContain("[3]");
        expect(result).not.toContain("[4]");
        expect(result).not.toContain("[5]");
    });

    it("should return empty for no docs", () => {
        expect(compressContext([], 1000)).toBe("");
    });

    it("should return empty if first doc exceeds budget", () => {
        const hugeDocs: RetrievedDocument[] = [
            { id: "big", module: "m", content: "A".repeat(10000), score: 0.9, metadata: {} },
        ];
        // Budget = 10 tokens = ~40 chars, but doc is 10000 chars
        expect(compressContext(hugeDocs, 10)).toBe("");
    });
});

// ═══════════════════════════════════════════════════════════
// B) RetrievalService
// ═══════════════════════════════════════════════════════════

describe("RetrievalService", () => {
    const enabledConfig = { enabled: true, topK: 5, maxTokenBudget: 1500, scoreThreshold: 0.3 };
    const disabledConfig = { ...enabledConfig, enabled: false };

    it("should return context when docs are found", async () => {
        const svc = new RetrievalService(
            mockEmbeddingProvider(),
            mockVectorStore(SAMPLE_DOCS.slice(0, 3)),
            enabledConfig
        );

        const result = await svc.retrieve("What schemes can I apply for?", "janseva");
        expect(result).toContain("PM Kisan");
        expect(result).toContain("Ayushman");
        expect(result).toContain("[1]");
    });

    it("should return empty when disabled (ENABLE_RAG=false)", async () => {
        const svc = new RetrievalService(
            mockEmbeddingProvider(),
            mockVectorStore(SAMPLE_DOCS),
            disabledConfig
        );

        const result = await svc.retrieve("test query", "janseva");
        expect(result).toBe("");
    });

    it("should return empty when no embedding provider", async () => {
        const svc = new RetrievalService(
            null,
            mockVectorStore(SAMPLE_DOCS),
            enabledConfig
        );

        const result = await svc.retrieve("test query", "janseva");
        expect(result).toBe("");
    });

    it("should return empty when no vector store", async () => {
        const svc = new RetrievalService(
            mockEmbeddingProvider(),
            null,
            enabledConfig
        );

        const result = await svc.retrieve("test query", "janseva");
        expect(result).toBe("");
    });

    it("should return empty when vector store returns nothing", async () => {
        const svc = new RetrievalService(
            mockEmbeddingProvider(),
            mockVectorStore([]),
            enabledConfig
        );

        const result = await svc.retrieve("unknown query", "janseva");
        expect(result).toBe("");
    });

    it("should gracefully handle embedding provider failure", async () => {
        const failingProvider: IEmbeddingProvider = {
            name: "failing",
            dimensions: 3,
            embed: vi.fn().mockRejectedValue(new Error("API down")),
            embedBatch: vi.fn().mockRejectedValue(new Error("API down")),
        };

        const svc = new RetrievalService(
            failingProvider,
            mockVectorStore(SAMPLE_DOCS),
            enabledConfig
        );

        // Should NOT throw — returns empty
        const result = await svc.retrieve("test", "janseva");
        expect(result).toBe("");
    });

    it("should gracefully handle vector store failure", async () => {
        const failingStore: IVectorStore = {
            search: vi.fn().mockRejectedValue(new Error("DB down")),
            upsert: vi.fn(),
            delete: vi.fn(),
            isAvailable: vi.fn().mockResolvedValue(false),
        };

        const svc = new RetrievalService(
            mockEmbeddingProvider(),
            failingStore,
            enabledConfig
        );

        const result = await svc.retrieve("test", "janseva");
        expect(result).toBe("");
    });

    it("should pass module to vector store for namespace isolation", async () => {
        const store = mockVectorStore([]);
        const svc = new RetrievalService(mockEmbeddingProvider(), store, enabledConfig);

        await svc.retrieve("wheat disease", "jankrishi");

        expect(store.search).toHaveBeenCalledWith(
            expect.any(Array),
            "jankrishi",
            5,
            0.3
        );
    });

    it("should pass correct topK and scoreThreshold from config", async () => {
        const store = mockVectorStore([]);
        const customConfig = { ...enabledConfig, topK: 3, scoreThreshold: 0.5 };
        const svc = new RetrievalService(mockEmbeddingProvider(), store, customConfig);

        await svc.retrieve("test", "janseva");

        expect(store.search).toHaveBeenCalledWith(
            expect.any(Array),
            "janseva",
            3,
            0.5
        );
    });

    it("should handle empty embedding result", async () => {
        const emptyProvider: IEmbeddingProvider = {
            name: "empty",
            dimensions: 0,
            embed: vi.fn().mockResolvedValue([]),
            embedBatch: vi.fn().mockResolvedValue([[]]),
        };

        const svc = new RetrievalService(
            emptyProvider,
            mockVectorStore(SAMPLE_DOCS),
            enabledConfig
        );

        const result = await svc.retrieve("test", "janseva");
        expect(result).toBe("");
    });

    it("should report health status", async () => {
        const svc = new RetrievalService(
            mockEmbeddingProvider(),
            mockVectorStore(),
            enabledConfig
        );

        const health = await svc.isHealthy();
        expect(health.enabled).toBe(true);
        expect(health.embedding).toBe(true);
        expect(health.vectorStore).toBe(true);
    });

    it("should report disabled health when RAG is off", async () => {
        const svc = new RetrievalService(null, null, disabledConfig);

        const health = await svc.isHealthy();
        expect(health.enabled).toBe(false);
        expect(health.embedding).toBe(false);
        expect(health.vectorStore).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════
// C) Failure Simulation
// ═══════════════════════════════════════════════════════════

describe("Failure simulations", () => {
    const config = { enabled: true, topK: 5, maxTokenBudget: 1500, scoreThreshold: 0.3 };

    it("A) No relevant docs found — returns empty, no crash", async () => {
        const svc = new RetrievalService(
            mockEmbeddingProvider(),
            mockVectorStore([]),
            config
        );
        const result = await svc.retrieve("random unrelated query", "janseva");
        expect(result).toBe("");
    });

    it("B) Embedding provider throws — returns empty, no crash", async () => {
        const svc = new RetrievalService(
            { name: "crash", dimensions: 3, embed: vi.fn().mockRejectedValue(new Error("BOOM")), embedBatch: vi.fn() },
            mockVectorStore(SAMPLE_DOCS),
            config
        );
        const result = await svc.retrieve("test", "janseva");
        expect(result).toBe("");
    });

    it("C) Vector DB unavailable — returns empty, no crash", async () => {
        const svc = new RetrievalService(
            mockEmbeddingProvider(),
            { search: vi.fn().mockRejectedValue(new Error("CONNECTION_REFUSED")), upsert: vi.fn(), delete: vi.fn(), isAvailable: vi.fn().mockResolvedValue(false) },
            config
        );
        const result = await svc.retrieve("test", "janseva");
        expect(result).toBe("");
    });

    it("D) Long document exceeding token budget — trimmed", () => {
        const longDoc: RetrievedDocument = {
            id: "long", module: "m", content: "A".repeat(10000), score: 0.95, metadata: {},
        };
        const result = compressContext([longDoc], 50); // 50 tokens — doc is 10000+ chars
        expect(result).toBe("");
    });

    it("E) ENABLE_RAG=false — retrieval skipped entirely", async () => {
        const embedSpy = vi.fn();
        const searchSpy = vi.fn();
        const svc = new RetrievalService(
            { name: "spy", dimensions: 3, embed: embedSpy, embedBatch: vi.fn() },
            { search: searchSpy, upsert: vi.fn(), delete: vi.fn(), isAvailable: vi.fn().mockResolvedValue(true) },
            { ...config, enabled: false }
        );

        await svc.retrieve("test", "janseva");

        // Neither embed nor search should be called
        expect(embedSpy).not.toHaveBeenCalled();
        expect(searchSpy).not.toHaveBeenCalled();
    });
});
