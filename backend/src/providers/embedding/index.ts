// ===== JanSathi AI — Embedding Provider Registry =====
// Exports a configured IEmbeddingProvider based on environment.
// Returns null if no embedding API key is available.

import type { IEmbeddingProvider } from "./IEmbeddingProvider";
import { GroqEmbeddingProvider } from "./GroqEmbeddingProvider";
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

    logger.info("embedding.provider.configured", {
        model,
        dimensions,
        baseUrl: baseUrl.replace(/\/\/.*@/, "//<redacted>@"),
    });

    return new GroqEmbeddingProvider({ apiKey, model, dimensions, baseUrl });
}

/** Configured embedding provider (null if no API key) */
export const embeddingProvider = createEmbeddingProvider();
