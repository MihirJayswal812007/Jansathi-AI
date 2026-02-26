// ===== JanSathi AI — Retrieval Module Index =====
// Wires up the retrieval system based on environment config.
// Exports ready-to-use retrievalService and conversationMemoryService singletons.

import { RetrievalService } from "./RetrievalService";
import { ConversationMemoryService } from "./ConversationMemoryService";
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

// ── RAG Config ──────────────────────────────────────────────
const ragConfig = {
    enabled: boolEnv("ENABLE_RAG", false),
    topK: intEnv("RAG_TOP_K", 5),
    maxTokenBudget: intEnv("RAG_MAX_TOKEN_BUDGET", 1500),
    scoreThreshold: floatEnv("RAG_SCORE_THRESHOLD", 0.3),
};

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

// ── Conversation Memory Config ──────────────────────────────
const memoryConfig = {
    enabled: boolEnv("ENABLE_CONVERSATION_MEMORY", false),
    topK: intEnv("MEMORY_TOP_K", 5),
    maxTokenBudget: intEnv("MEMORY_MAX_TOKEN_BUDGET", 800),
    scoreThreshold: floatEnv("MEMORY_SCORE_THRESHOLD", 0.35),
    maxAgeDays: intEnv("MEMORY_MAX_AGE_DAYS", 30),
};

export const conversationMemoryService = new ConversationMemoryService(
    embeddingProvider,
    memoryConfig
);

if (memoryConfig.enabled) {
    logger.info("conversation_memory.initialized", {
        topK: memoryConfig.topK,
        maxTokenBudget: memoryConfig.maxTokenBudget,
        maxAgeDays: memoryConfig.maxAgeDays,
    });
} else {
    logger.info("conversation_memory.disabled", {
        note: "Set ENABLE_CONVERSATION_MEMORY=true to activate",
    });
}

// Re-export types for convenience
export type { RetrievedDocument, IVectorStore, DocumentUpsert } from "./types";
export { RetrievalService } from "./RetrievalService";
export { ConversationMemoryService } from "./ConversationMemoryService";
export { compressContext, estimateTokens } from "./contextCompressor";
export { CachedEmbeddingProvider } from "./EmbeddingCache";
export { MemoryPruner, memoryPruner } from "./MemoryPruner";
export { MemorySummarizer } from "./MemorySummarizer";
export { Reranker, reranker } from "./Reranker";
export { estimateTokensFast, estimateTokensStrict } from "./tokenizer";
