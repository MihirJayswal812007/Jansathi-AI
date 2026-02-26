// ===== JanSathi AI — Retrieval Service =====
// Orchestrates: embed query → vector search → compress context.
// Returns formatted context string or "" on any failure.
// Never throws — the AI pipeline continues without RAG on errors.

import type { IEmbeddingProvider } from "../providers/embedding/IEmbeddingProvider";
import type { IVectorStore, RetrievedDocument } from "./types";
import { compressContext } from "./contextCompressor";
import logger from "../utils/logger";

export interface RetrievalServiceConfig {
    enabled: boolean;
    topK: number;
    maxTokenBudget: number;
    scoreThreshold: number;
}

export class RetrievalService {
    constructor(
        private embeddingProvider: IEmbeddingProvider | null,
        private vectorStore: IVectorStore | null,
        private config: RetrievalServiceConfig
    ) { }

    /**
     * Retrieve relevant context for a user query within a module.
     *
     * Flow: embed query → search vector store → compress to token budget.
     * Returns formatted context string, or "" if RAG is disabled/failed.
     */
    async retrieve(query: string, module: string): Promise<string> {
        // Guard: disabled
        if (!this.config.enabled) return "";

        // Guard: no providers
        if (!this.embeddingProvider || !this.vectorStore) {
            logger.debug("retrieval.skipped", { reason: "no providers configured" });
            return "";
        }

        try {
            // 1. Embed the user query
            const embedding = await this.embeddingProvider.embed(query);

            if (!embedding || embedding.length === 0) {
                logger.warn("retrieval.embedding_empty", { queryLength: query.length });
                return "";
            }

            // 2. Search the vector store
            const docs = await this.vectorStore.search(
                embedding,
                module,
                this.config.topK,
                this.config.scoreThreshold
            );

            if (!docs.length) {
                logger.debug("retrieval.no_results", { module, query: query.slice(0, 80) });
                return "";
            }

            // 3. Compress to token budget
            const context = compressContext(docs, this.config.maxTokenBudget);

            logger.info("retrieval.success", {
                module,
                docsFound: docs.length,
                topScore: docs[0]?.score?.toFixed(3),
                contextTokens: Math.ceil(context.length / 4),
            });

            return context;
        } catch (error) {
            // Never crash the AI pipeline — graceful degradation
            logger.error("retrieval.failed", {
                module,
                error: error instanceof Error ? error.message : String(error),
            });
            return "";
        }
    }

    /**
     * Check if the retrieval system is healthy and available.
     */
    async isHealthy(): Promise<{ embedding: boolean; vectorStore: boolean; enabled: boolean }> {
        return {
            enabled: this.config.enabled,
            embedding: this.embeddingProvider !== null,
            vectorStore: this.vectorStore ? await this.vectorStore.isAvailable() : false,
        };
    }
}
