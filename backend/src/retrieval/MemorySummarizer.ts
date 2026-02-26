// ===== JanSathi AI — Memory Summarizer =====
// Generates long-term user profile summaries from conversation memory.
// When a user exceeds N memories, oldest batch is summarized via LLM,
// then replaced with a single summary entry in long_term_memory.

import prisma from "../models/prisma";
import type { IEmbeddingProvider } from "../providers/embedding/IEmbeddingProvider";
import { llmProvider } from "../providers/llm";
import logger from "../utils/logger";

export interface MemorySummarizerConfig {
    enabled: boolean;
    /** Trigger summarization when user memory count exceeds this */
    triggerThreshold: number;
    /** Number of oldest entries to summarize per batch */
    batchSize: number;
}

export class MemorySummarizer {
    constructor(
        private embeddingProvider: IEmbeddingProvider | null,
        public readonly config: MemorySummarizerConfig
    ) { }

    /**
     * Check if a user needs summarization and perform it if so.
     * Async, fire-and-forget safe. Never blocks chat.
     */
    async summarizeIfNeeded(userId: string): Promise<void> {
        if (!this.config.enabled || !this.embeddingProvider) return;

        try {
            // Count user's conversation memory entries
            const countResult = await prisma.$queryRawUnsafe<{ cnt: bigint }[]>(
                `SELECT COUNT(*) as cnt FROM conversation_memory WHERE user_id = $1`,
                userId
            );
            const count = Number(countResult[0]?.cnt ?? 0);

            if (count < this.config.triggerThreshold) return;

            logger.info("memory_summarizer.triggered", {
                userId: userId.slice(0, 8) + "...",
                memoryCount: count,
                threshold: this.config.triggerThreshold,
            });

            // Fetch oldest batch of entries
            const entries = await prisma.$queryRawUnsafe<
                { id: string; role: string; content: string; created_at: Date }[]
            >(
                `SELECT id, role, content, created_at
                 FROM conversation_memory
                 WHERE user_id = $1
                 ORDER BY created_at ASC
                 LIMIT $2`,
                userId,
                this.config.batchSize
            );

            if (!entries.length) return;

            // Build text to summarize
            const conversationText = entries
                .map((e) => `[${e.role}]: ${e.content}`)
                .join("\n");

            // Generate summary via LLM
            const summary = await this.generateSummary(conversationText);
            if (!summary) return;

            // Embed the summary
            const embedding = await this.embeddingProvider.embed(summary);
            if (!embedding || embedding.length === 0) return;

            const vectorStr = `[${embedding.join(",")}]`;
            const summaryId = `lts_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

            // Upsert into long_term_memory
            await prisma.$executeRawUnsafe(
                `INSERT INTO long_term_memory (id, user_id, summary, embedding, source_count, last_updated)
                 VALUES ($1, $2, $3, $4::vector, $5, NOW())
                 ON CONFLICT (id) DO UPDATE SET
                    summary = EXCLUDED.summary,
                    embedding = EXCLUDED.embedding,
                    source_count = EXCLUDED.source_count,
                    last_updated = NOW()`,
                summaryId,
                userId,
                summary,
                vectorStr,
                entries.length
            );

            // Delete summarized entries from conversation_memory
            const ids = entries.map((e) => e.id);
            await prisma.$executeRawUnsafe(
                `DELETE FROM conversation_memory WHERE id = ANY($1::text[])`,
                ids
            );

            logger.info("memory_summarizer.completed", {
                userId: userId.slice(0, 8) + "...",
                entriesSummarized: entries.length,
                summaryLength: summary.length,
            });
        } catch (error) {
            logger.error("memory_summarizer.failed", {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    /**
     * Retrieve long-term summaries for a user.
     */
    async retrieveSummary(userId: string): Promise<string> {
        if (!this.config.enabled) return "";

        try {
            const summaries = await prisma.$queryRawUnsafe<
                { summary: string; last_updated: Date }[]
            >(
                `SELECT summary, last_updated
                 FROM long_term_memory
                 WHERE user_id = $1
                 ORDER BY last_updated DESC
                 LIMIT 3`,
                userId
            );

            if (!summaries.length) return "";

            return summaries
                .map((s, i) => `[${i + 1}] ${s.summary}`)
                .join("\n\n");
        } catch (error) {
            logger.error("memory_summarizer.retrieve_failed", {
                error: error instanceof Error ? error.message : String(error),
            });
            return "";
        }
    }

    private async generateSummary(conversationText: string): Promise<string | null> {
        try {
            const systemPrompt = `You are summarizing a user's past conversations with a government services assistant (JanSathi AI) in India.
Create a concise user profile summary in 2-3 sentences capturing:
- Key topics they asked about (schemes, services, documents)
- Their location/demographics if mentioned
- Recurring needs or preferences`;

            const result = await llmProvider.generateResponse({
                mode: "janseva" as any,
                systemPrompt,
                messages: [{ role: "user", content: `Conversation:\n${conversationText.slice(0, 3000)}\n\nSummary:` }],
                language: "hi" as any,
                maxTokens: 200,
                temperature: 0.3,
            });

            return result.content?.trim() || null;
        } catch (error) {
            logger.error("memory_summarizer.llm_failed", {
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }
}
