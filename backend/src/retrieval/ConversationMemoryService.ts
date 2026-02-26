// ===== JanSathi AI — Conversation Memory Service =====
// Per-user semantic memory: stores and retrieves past conversation turns.
// User-isolated — User A's memory is never visible to User B.
// Never throws — graceful degradation on any failure.

import prisma from "../models/prisma";
import type { IEmbeddingProvider } from "../providers/embedding/IEmbeddingProvider";
import { compressContext } from "./contextCompressor";
import type { RetrievedDocument } from "./types";
import logger from "../utils/logger";

export interface ConversationMemoryConfig {
    enabled: boolean;
    topK: number;
    maxTokenBudget: number;
    scoreThreshold: number;
    /** Max age in days for memory retrieval (0 = no limit) */
    maxAgeDays: number;
}

export interface MemoryEntry {
    userId: string;
    conversationId?: string;
    role: "user" | "assistant";
    content: string;
    module?: string;
}

export class ConversationMemoryService {
    constructor(
        private embeddingProvider: IEmbeddingProvider | null,
        private config: ConversationMemoryConfig
    ) { }

    /**
     * Store a conversation turn in memory with its embedding.
     * Fire-and-forget safe — failures are logged but never thrown.
     */
    async store(entry: MemoryEntry): Promise<void> {
        if (!this.config.enabled || !this.embeddingProvider) return;

        // Skip very short messages (not useful for memory)
        if (entry.content.trim().length < 20) return;

        try {
            const embedding = await this.embeddingProvider.embed(entry.content);
            if (!embedding || embedding.length === 0) return;

            const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            const vectorStr = `[${embedding.join(",")}]`;

            await prisma.$executeRawUnsafe(
                `INSERT INTO conversation_memory (id, user_id, conversation_id, role, content, embedding, module, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6::vector, $7, NOW())`,
                id,
                entry.userId,
                entry.conversationId ?? null,
                entry.role,
                entry.content,
                vectorStr,
                entry.module ?? null
            );

            logger.debug("conversation_memory.stored", {
                userId: entry.userId.slice(0, 8) + "...",
                role: entry.role,
                contentLength: entry.content.length,
            });
        } catch (error) {
            // Fire-and-forget — never block chat
            logger.error("conversation_memory.store_failed", {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    /**
     * Retrieve relevant past conversation turns for a user.
     * User-isolated: only retrieves memories for the given userId.
     * Excludes the current conversation to avoid echo.
     */
    async retrieve(
        query: string,
        userId: string,
        currentConversationId?: string
    ): Promise<string> {
        if (!this.config.enabled || !this.embeddingProvider) return "";
        if (!userId) return "";

        try {
            const embedding = await this.embeddingProvider.embed(query);
            if (!embedding || embedding.length === 0) return "";

            const vectorStr = `[${embedding.join(",")}]`;

            // Build query with optional recency filter and conversation exclusion
            let sql = `
                SELECT
                    id,
                    role,
                    content,
                    module,
                    (1 - (embedding <=> $1::vector)) AS score
                FROM conversation_memory
                WHERE user_id = $2
            `;
            const params: (string | number)[] = [vectorStr, userId];
            let paramIdx = 3;

            // Exclude current conversation
            if (currentConversationId) {
                sql += ` AND (conversation_id IS NULL OR conversation_id != $${paramIdx})`;
                params.push(currentConversationId);
                paramIdx++;
            }

            // Recency filter
            if (this.config.maxAgeDays > 0) {
                sql += ` AND created_at > NOW() - INTERVAL '${this.config.maxAgeDays} days'`;
            }

            sql += ` ORDER BY embedding <=> $1::vector LIMIT $${paramIdx}`;
            params.push(this.config.topK);

            const results = await prisma.$queryRawUnsafe<
                { id: string; role: string; content: string; module: string | null; score: number }[]
            >(sql, ...params);

            // Filter by score threshold
            const filtered = results.filter((r) => Number(r.score) >= this.config.scoreThreshold);

            if (!filtered.length) {
                logger.debug("conversation_memory.no_results", {
                    userId: userId.slice(0, 8) + "...",
                });
                return "";
            }

            // Convert to RetrievedDocument for compression
            const docs: RetrievedDocument[] = filtered.map((r) => ({
                id: r.id,
                module: r.module ?? "",
                content: `[${r.role}]: ${r.content}`,
                score: Number(r.score),
                metadata: {},
            }));

            const context = compressContext(docs, this.config.maxTokenBudget);

            logger.info("conversation_memory.retrieved", {
                userId: userId.slice(0, 8) + "...",
                count: filtered.length,
                topScore: filtered[0]?.score?.toFixed(3),
            });

            return context;
        } catch (error) {
            logger.error("conversation_memory.retrieve_failed", {
                error: error instanceof Error ? error.message : String(error),
            });
            return "";
        }
    }

    /**
     * Health check.
     */
    async isHealthy(): Promise<{ enabled: boolean; embedding: boolean; db: boolean }> {
        let db = false;
        try {
            await prisma.$queryRawUnsafe(`SELECT 1 FROM conversation_memory LIMIT 0`);
            db = true;
        } catch { /* table doesn't exist yet */ }

        return {
            enabled: this.config.enabled,
            embedding: this.embeddingProvider !== null,
            db,
        };
    }
}
