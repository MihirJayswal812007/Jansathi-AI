// ===== JanSathi AI — Retrieval Module Index =====
// Wires up the retrieval system based on environment config.
// Exports a ready-to-use retrievalService singleton.

import { RetrievalService } from "./RetrievalService";
import { postgresVectorStore } from "./PostgresVectorStore";
import { embeddingProvider } from "../providers/embedding";
import logger from "../utils/logger";

// ── Config from env ─────────────────────────────────────────
function boolEnv(key: string, fallback: boolean): boolean {
    const val = process.env[key]?.toLowerCase();
    if (val === "true" || val === "1") return true;
    if (val === "false" || val === "0") return false;
    return fallback;
}

function intEnv(key: string, fallback: number): number {
    const raw = process.env[key];
    if (!raw) return fallback;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? fallback : parsed;
}

function floatEnv(key: string, fallback: number): number {
    const raw = process.env[key];
    if (!raw) return fallback;
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? fallback : parsed;
}

const ragConfig = {
    enabled: boolEnv("ENABLE_RAG", false),
    topK: intEnv("RAG_TOP_K", 5),
    maxTokenBudget: intEnv("RAG_MAX_TOKEN_BUDGET", 1500),
    scoreThreshold: floatEnv("RAG_SCORE_THRESHOLD", 0.3),
};

// ── Build the singleton ─────────────────────────────────────
const vectorStore = ragConfig.enabled ? postgresVectorStore : null;

export const retrievalService = new RetrievalService(
    embeddingProvider,
    vectorStore,
    ragConfig
);

if (ragConfig.enabled) {
    logger.info("retrieval.initialized", {
        topK: ragConfig.topK,
        maxTokenBudget: ragConfig.maxTokenBudget,
        scoreThreshold: ragConfig.scoreThreshold,
        embeddingProvider: embeddingProvider?.name ?? "none",
    });
} else {
    logger.info("retrieval.disabled", { note: "Set ENABLE_RAG=true to activate" });
}

// Re-export types for convenience
export type { RetrievedDocument, IVectorStore, DocumentUpsert } from "./types";
export { RetrievalService } from "./RetrievalService";
export { compressContext, estimateTokens } from "./contextCompressor";
