// ===== JanSathi AI — Embedding Provider Registry =====
// Exports a configured IEmbeddingProvider based on environment.
// Optionally wraps with LRU+TTL EmbeddingCache.
// Returns null if no embedding API key is available.

import type { IEmbeddingProvider } from "./IEmbeddingProvider";
import { GroqEmbeddingProvider } from "./GroqEmbeddingProvider";
import { CachedEmbeddingProvider } from "../../retrieval/EmbeddingCache";
import logger from "../../utils/logger";

export type { IEmbeddingProvider } from "./IEmbeddingProvider";

function createEmbeddingProvider(): IEmbeddingProvider | null {
    const apiKey = process.env.EMBEDDING_API_KEY || process.env.OPENAI_API_KEY || "";
    const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
    const dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || "1536", 10);
    const baseUrl = process.env.EMBEDDING_BASE_URL || "https://api.openai.com/v1";

    if (!apiKey) {
        logger.info("embedding.provider.none", {
            note: "Set EMBEDDING_API_KEY to enable RAG embeddings",
        });
        return null;
    }

    const inner = new GroqEmbeddingProvider({ apiKey, model, dimensions, baseUrl });

    // Wrap with cache if enabled
    const cacheEnabled = (process.env.ENABLE_EMBEDDING_CACHE || "").toLowerCase() === "true";
    const cacheTtlMs = parseInt(process.env.EMBEDDING_CACHE_TTL_MS || "600000", 10); // 10 min
    const cacheMaxSize = parseInt(process.env.EMBEDDING_CACHE_MAX_SIZE || "500", 10);

    if (cacheEnabled) {
        logger.info("embedding.cache.enabled", {
            ttlMs: cacheTtlMs,
            maxSize: cacheMaxSize,
        });

        return new CachedEmbeddingProvider(inner, {
            enabled: true,
            maxSize: cacheMaxSize,
            ttlMs: cacheTtlMs,
        });
    }

    logger.info("embedding.provider.configured", {
        model,
        dimensions,
        cache: false,
    });

    return inner;
}

/** Configured embedding provider (null if no API key) */
export const embeddingProvider = createEmbeddingProvider();
