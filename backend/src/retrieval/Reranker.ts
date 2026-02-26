// ===== JanSathi AI — Semantic Reranker =====
// Optional second-pass reranking of retrieved documents.
// Uses cross-encoder API if available, falls back to cosine order.
// Toggle: ENABLE_RERANKER

import type { RetrievedDocument } from "./types";
import logger from "../utils/logger";

export interface RerankerConfig {
    enabled: boolean;
    /** API endpoint for cross-encoder reranker */
    apiUrl?: string;
    /** API key */
    apiKey?: string;
    /** Number of docs to keep after reranking */
    topN: number;
}

export class Reranker {
    constructor(private config: RerankerConfig) { }

    /**
     * Rerank documents for a given query.
     * Pipeline: top-k from vector search → rerank → top-n final.
     *
     * If reranker is disabled or fails, returns input in original cosine order.
     */
    async rerank(
        query: string,
        docs: RetrievedDocument[],
    ): Promise<RetrievedDocument[]> {
        // Guard: disabled or no docs
        if (!this.config.enabled || !docs.length) {
            return docs.slice(0, this.config.topN);
        }

        // Guard: no API configured — use keyword-boost fallback
        if (!this.config.apiUrl || !this.config.apiKey) {
            return this.keywordFallback(query, docs);
        }

        try {
            return await this.crossEncoderRerank(query, docs);
        } catch (error) {
            logger.error("reranker.api_failed", {
                error: error instanceof Error ? error.message : String(error),
            });
            // Fallback to keyword scoring
            return this.keywordFallback(query, docs);
        }
    }

    /**
     * Cross-encoder reranking via external API.
     * Compatible with Cohere, Jina, or any OpenAI-like reranker endpoint.
     */
    private async crossEncoderRerank(
        query: string,
        docs: RetrievedDocument[]
    ): Promise<RetrievedDocument[]> {
        const response = await fetch(this.config.apiUrl!, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                documents: docs.map((d) => d.content),
                top_n: this.config.topN,
            }),
        });

        if (!response.ok) {
            throw new Error(`Reranker API returned ${response.status}`);
        }

        const data = (await response.json()) as {
            results: { index: number; relevance_score: number }[];
        };

        // Map reranked results back to original docs
        return data.results
            .sort((a, b) => b.relevance_score - a.relevance_score)
            .slice(0, this.config.topN)
            .map((r) => ({
                ...docs[r.index],
                score: r.relevance_score,
            }));
    }

    /**
     * Keyword-based fallback reranker.
     * Boosts cosine score by keyword overlap between query and document.
     * Does NOT require an external API.
     */
    private keywordFallback(
        query: string,
        docs: RetrievedDocument[]
    ): RetrievedDocument[] {
        const queryTokens = new Set(
            query.toLowerCase().split(/\s+/).filter((t) => t.length > 2)
        );

        if (!queryTokens.size) return docs.slice(0, this.config.topN);

        const scored = docs.map((doc) => {
            const docTokens = doc.content.toLowerCase().split(/\s+/);
            const overlap = docTokens.filter((t) => queryTokens.has(t)).length;
            const boost = overlap / queryTokens.size; // 0 to 1

            return {
                ...doc,
                score: doc.score * 0.7 + boost * 0.3, // Weighted: 70% cosine, 30% keyword
            };
        });

        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, this.config.topN);
    }
}

// ── Singleton ───────────────────────────────────────────────
function boolEnv(key: string, fallback: boolean): boolean {
    const val = process.env[key]?.toLowerCase();
    return val === "true" || val === "1" ? true : val === "false" || val === "0" ? false : fallback;
}

function intEnv(key: string, fallback: number): number {
    const p = parseInt(process.env[key] ?? "", 10);
    return isNaN(p) ? fallback : p;
}

export const reranker = new Reranker({
    enabled: boolEnv("ENABLE_RERANKER", false),
    apiUrl: process.env.RERANKER_API_URL,
    apiKey: process.env.RERANKER_API_KEY,
    topN: intEnv("RERANKER_TOP_N", 3),
});
