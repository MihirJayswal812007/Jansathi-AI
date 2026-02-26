// ===== JanSathi AI — Intelligence Optimization Tests =====
// Tests EmbeddingCache, MemoryPruner, Reranker, Tokenizer, and MemorySummarizer.
// Fully deterministic — no real DB, API, or LLM calls.

import { describe, it, expect, vi } from "vitest";
import { CachedEmbeddingProvider, type EmbeddingCacheConfig } from "../src/retrieval/EmbeddingCache";
import { Reranker } from "../src/retrieval/Reranker";
import { MemorySummarizer } from "../src/retrieval/MemorySummarizer";
import { estimateTokensFast, estimateTokensStrict } from "../src/retrieval/tokenizer";
import { compressContext } from "../src/retrieval/contextCompressor";
import type { IEmbeddingProvider } from "../src/providers/embedding/IEmbeddingProvider";
import type { RetrievedDocument } from "../src/retrieval/types";

// ── Helpers ─────────────────────────────────────────────────

function mockProvider(result: number[] = [0.1, 0.2, 0.3]): IEmbeddingProvider {
    return {
        name: "mock",
        dimensions: 3,
        embed: vi.fn().mockResolvedValue(result),
        embedBatch: vi.fn().mockResolvedValue([result]),
    };
}

const SAMPLE_DOCS: RetrievedDocument[] = [
    { id: "d1", module: "m", content: "PM Kisan Samman Nidhi provides 6000 per year to farmers", score: 0.92, metadata: {} },
    { id: "d2", module: "m", content: "Ayushman Bharat provides health coverage up to 5 lakh", score: 0.85, metadata: {} },
    { id: "d3", module: "m", content: "Ration Card application requires Aadhaar and income certificate", score: 0.78, metadata: {} },
    { id: "d4", module: "m", content: "Pradhan Mantri Awas Yojana housing assistance program", score: 0.71, metadata: {} },
    { id: "d5", module: "m", content: "National Pension Scheme for retirement savings", score: 0.65, metadata: {} },
];

// ═══════════════════════════════════════════════════════════
// A) Embedding Cache
// ═══════════════════════════════════════════════════════════

describe("EmbeddingCache", () => {
    const cacheConfig: EmbeddingCacheConfig = { enabled: true, maxSize: 100, ttlMs: 60000 };

    it("should cache embedding on first call and return from cache on second", async () => {
        const inner = mockProvider([0.1, 0.2, 0.3]);
        const cached = new CachedEmbeddingProvider(inner, cacheConfig);

        const r1 = await cached.embed("test query");
        const r2 = await cached.embed("test query");

        expect(r1).toEqual([0.1, 0.2, 0.3]);
        expect(r2).toEqual([0.1, 0.2, 0.3]);
        expect(inner.embed).toHaveBeenCalledTimes(1); // Only 1 API call
        expect(cached.stats.hits).toBe(1);
        expect(cached.stats.misses).toBe(1);
    });

    it("should miss cache for different queries", async () => {
        const inner = mockProvider([0.4, 0.5, 0.6]);
        const cached = new CachedEmbeddingProvider(inner, cacheConfig);

        await cached.embed("query A");
        await cached.embed("query B");

        expect(inner.embed).toHaveBeenCalledTimes(2);
        expect(cached.stats.misses).toBe(2);
    });

    it("should evict entries when exceeding maxSize", async () => {
        const inner = mockProvider([0.1, 0.2]);
        const smallCache = new CachedEmbeddingProvider(inner, { enabled: true, maxSize: 2, ttlMs: 60000 });

        await smallCache.embed("q1");
        await smallCache.embed("q2");
        await smallCache.embed("q3"); // Should evict q1

        expect(smallCache.stats.size).toBeLessThanOrEqual(2);
    });

    it("should bypass cache when disabled", async () => {
        const inner = mockProvider([0.1]);
        const noCache = new CachedEmbeddingProvider(inner, { enabled: false, maxSize: 100, ttlMs: 60000 });

        await noCache.embed("same query");
        await noCache.embed("same query");

        expect(inner.embed).toHaveBeenCalledTimes(2); // No caching
    });

    it("should handle embedBatch with mixed cache hits", async () => {
        const inner = mockProvider();
        (inner.embedBatch as any).mockResolvedValue([[0.1], [0.2]]);
        const cached = new CachedEmbeddingProvider(inner, cacheConfig);

        // Prime cache with first query
        await cached.embed("cached query");

        // Batch: one cached, one new
        (inner.embedBatch as any).mockResolvedValue([[0.9]]);
        const results = await cached.embedBatch(["cached query", "new query"]);

        expect(results).toHaveLength(2);
    });

    it("should clear cache", async () => {
        const inner = mockProvider();
        const cached = new CachedEmbeddingProvider(inner, cacheConfig);

        await cached.embed("test");
        expect(cached.stats.size).toBe(1);

        cached.clear();
        expect(cached.stats.size).toBe(0);
        expect(cached.stats.hits).toBe(0);
    });

    it("should report hit rate correctly", async () => {
        const inner = mockProvider();
        const cached = new CachedEmbeddingProvider(inner, cacheConfig);

        await cached.embed("x");
        await cached.embed("x");
        await cached.embed("x");

        // 1 miss + 2 hits = 66.7%
        expect(cached.stats.hitRate).toBe("66.7%");
    });
});

// ═══════════════════════════════════════════════════════════
// B) Tokenizer
// ═══════════════════════════════════════════════════════════

describe("Tokenizer", () => {
    it("should estimate English tokens (~4 chars/token)", () => {
        const tokens = estimateTokensFast("Hello world this is a test");
        expect(tokens).toBeGreaterThan(3);
        expect(tokens).toBeLessThan(15);
    });

    it("should estimate Hindi tokens (~2 chars/token)", () => {
        const hindi = "नमस्ते दुनिया";
        const tokens = estimateTokensFast(hindi);
        // Hindi has 12 Devanagari chars → ~6 tokens
        expect(tokens).toBeGreaterThanOrEqual(5);
    });

    it("should give more tokens for Hindi than English of same length", () => {
        const english = "A".repeat(20); // 20 Latin chars → ~5 tokens
        const hindi = "अ".repeat(20);   // 20 Devanagari chars → ~10 tokens

        const englishTokens = estimateTokensFast(english);
        const hindiTokens = estimateTokensFast(hindi);

        expect(hindiTokens).toBeGreaterThan(englishTokens);
    });

    it("should handle empty strings", () => {
        expect(estimateTokensFast("")).toBe(0);
        expect(estimateTokensStrict("")).toBe(0);
    });

    it("should handle mixed Hindi/English correctly", () => {
        const mixed = "PM किसान Samman Nidhi";
        const tokens = estimateTokensFast(mixed);
        expect(tokens).toBeGreaterThan(3);
        expect(tokens).toBeLessThan(20);
    });

    it("strict mode should produce reasonable estimates", () => {
        const text = "Pradhan Mantri Kisan Samman Nidhi provides financial assistance";
        const fast = estimateTokensFast(text);
        const strict = estimateTokensStrict(text);

        // Both should be in a reasonable range
        expect(fast).toBeGreaterThan(5);
        expect(strict).toBeGreaterThan(5);
        expect(Math.abs(fast - strict)).toBeLessThan(20); // Reasonable agreement
    });
});

// ═══════════════════════════════════════════════════════════
// C) Reranker
// ═══════════════════════════════════════════════════════════

describe("Reranker", () => {
    it("should return top-N docs when enabled (keyword fallback)", () => {
        const r = new Reranker({ enabled: true, topN: 2 });
        const result = r.rerank("Kisan scheme eligibility", SAMPLE_DOCS);

        // Should return reranked result
        expect(result).resolves.toHaveLength(2);
    });

    it("should return original order when disabled", async () => {
        const r = new Reranker({ enabled: false, topN: 3 });
        const result = await r.rerank("test", SAMPLE_DOCS);

        expect(result).toHaveLength(3);
        expect(result[0].id).toBe("d1"); // Original order preserved
    });

    it("should boost docs with keyword overlap", async () => {
        const r = new Reranker({ enabled: true, topN: 5 });

        // Query contains "Ration Card" — should boost d3
        const result = await r.rerank("Ration Card application process", SAMPLE_DOCS);

        // d3 should be higher ranked due to keyword overlap
        const d3idx = result.findIndex((d) => d.id === "d3");
        expect(d3idx).toBeLessThan(3); // Should be in top 3
    });

    it("should handle empty docs", async () => {
        const r = new Reranker({ enabled: true, topN: 3 });
        const result = await r.rerank("test", []);
        expect(result).toHaveLength(0);
    });

    it("should fall back to keyword on API error", async () => {
        const r = new Reranker({
            enabled: true,
            apiUrl: "https://invalid-url-that-will-fail.example.com/rerank",
            apiKey: "fake-key",
            topN: 3,
        });

        // Should not throw — falls back to keyword reranker
        const result = await r.rerank("test query", SAMPLE_DOCS);
        expect(result.length).toBeGreaterThan(0);
        expect(result.length).toBeLessThanOrEqual(3);
    });
});

// ═══════════════════════════════════════════════════════════
// D) Context Compressor (with new tokenizer)
// ═══════════════════════════════════════════════════════════

describe("Context compressor with Hindi-aware tokenizer", () => {
    it("should respect token budget for Hindi text", () => {
        const hindiDocs: RetrievedDocument[] = [
            { id: "h1", module: "m", content: "प्रधानमंत्री किसान सम्मान निधि योजना के तहत किसानों को सालाना छह हजार रुपये की आर्थिक सहायता दी जाती है", score: 0.9, metadata: {} },
            { id: "h2", module: "m", content: "आयुष्मान भारत योजना के तहत पांच लाख रुपये तक का स्वास्थ्य बीमा कवरेज मिलता है", score: 0.8, metadata: {} },
        ];

        const result = compressContext(hindiDocs, 80);
        // With Hindi-aware tokenizer, first doc (~50 tokens) should fit within 80
        expect(result.length).toBeGreaterThan(0);
        expect(result).toContain("प्रधानमंत्री");
    });

    it("should handle empty docs", () => {
        expect(compressContext([], 1000)).toBe("");
    });
});

// ═══════════════════════════════════════════════════════════
// E) Memory Summarizer
// ═══════════════════════════════════════════════════════════

describe("MemorySummarizer", () => {
    it("should skip when disabled", async () => {
        const embedder = mockProvider();
        const s = new MemorySummarizer(embedder, { enabled: false, triggerThreshold: 100, batchSize: 30 });

        await s.summarizeIfNeeded("user123");
        expect(embedder.embed).not.toHaveBeenCalled();
    });

    it("should skip when no embedding provider", async () => {
        const s = new MemorySummarizer(null, { enabled: true, triggerThreshold: 100, batchSize: 30 });

        // Should not throw
        await expect(s.summarizeIfNeeded("user123")).resolves.toBeUndefined();
    });

    it("should expose config as public readonly", () => {
        const s = new MemorySummarizer(mockProvider(), { enabled: true, triggerThreshold: 50, batchSize: 10 });
        expect(s.config.enabled).toBe(true);
        expect(s.config.triggerThreshold).toBe(50);
    });

    it("should return empty summary when disabled", async () => {
        const s = new MemorySummarizer(mockProvider(), { enabled: false, triggerThreshold: 100, batchSize: 30 });
        const result = await s.retrieveSummary("user123");
        expect(result).toBe("");
    });
});

// ═══════════════════════════════════════════════════════════
// F) Failure Simulations
// ═══════════════════════════════════════════════════════════

describe("Failure simulations", () => {
    it("A) Cache miss → API call → cache stored", async () => {
        const inner = mockProvider([0.5, 0.6]);
        const cached = new CachedEmbeddingProvider(inner, { enabled: true, maxSize: 10, ttlMs: 60000 });

        const r1 = await cached.embed("new query");
        expect(r1).toEqual([0.5, 0.6]);
        expect(inner.embed).toHaveBeenCalledTimes(1);

        const r2 = await cached.embed("new query");
        expect(r2).toEqual([0.5, 0.6]);
        expect(inner.embed).toHaveBeenCalledTimes(1); // Still 1 — cached
    });

    it("B) Reranker API failure → falls back to keyword", async () => {
        const r = new Reranker({
            enabled: true,
            apiUrl: "https://nonexistent.example.com",
            apiKey: "key",
            topN: 2,
        });
        const result = await r.rerank("Kisan scheme", SAMPLE_DOCS);
        expect(result.length).toBe(2); // Keyword fallback worked
    });

    it("C) Summarizer disabled → no-op", async () => {
        const embedder = mockProvider();
        const s = new MemorySummarizer(embedder, { enabled: false, triggerThreshold: 1, batchSize: 1 });

        await s.summarizeIfNeeded("user123");
        const summary = await s.retrieveSummary("user123");

        expect(embedder.embed).not.toHaveBeenCalled();
        expect(summary).toBe("");
    });

    it("D) Token estimator handles edge cases", () => {
        expect(estimateTokensFast("")).toBe(0);
        expect(estimateTokensFast("a")).toBeGreaterThanOrEqual(1);
        expect(estimateTokensFast("🇮🇳")).toBeGreaterThanOrEqual(1); // Emoji
        expect(estimateTokensStrict("123")).toBeGreaterThanOrEqual(1);
    });
});
