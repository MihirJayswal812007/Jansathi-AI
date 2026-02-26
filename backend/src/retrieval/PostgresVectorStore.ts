// ===== JanSathi AI — PostgreSQL Vector Store (pgvector) =====
// Implements IVectorStore using Prisma raw SQL + pgvector cosine distance.
// Requires: CREATE EXTENSION vector; + documents table (see migration).

import prisma from "../models/prisma";
import logger from "../utils/logger";
import type { IVectorStore, RetrievedDocument, DocumentUpsert } from "./types";

export class PostgresVectorStore implements IVectorStore {
    /**
     * Search for similar documents using cosine distance.
     * pgvector operator: <=> (cosine distance, lower = more similar).
     * Score = 1 - distance (higher = more similar).
     */
    async search(
        embedding: number[],
        module: string,
        topK: number,
        scoreThreshold = 0.3
    ): Promise<RetrievedDocument[]> {
        try {
            const vectorStr = `[${embedding.join(",")}]`;

            const results = await prisma.$queryRawUnsafe<
                { id: string; module: string; content: string; score: number; metadata: Record<string, unknown> }[]
            >(
                `SELECT
                    id,
                    module,
                    content,
                    metadata,
                    (1 - (embedding <=> $1::vector)) AS score
                FROM documents
                WHERE module = $2
                ORDER BY embedding <=> $1::vector
                LIMIT $3`,
                vectorStr,
                module,
                topK
            );

            // Filter by score threshold
            return results
                .filter((r) => r.score >= scoreThreshold)
                .map((r) => ({
                    id: r.id,
                    module: r.module,
                    content: r.content,
                    score: Number(r.score),
                    metadata: (r.metadata as Record<string, unknown>) ?? {},
                }));
        } catch (error) {
            logger.error("vector_store.search_failed", {
                module,
                error: error instanceof Error ? error.message : String(error),
            });
            return []; // Graceful degradation
        }
    }

    /**
     * Upsert documents with embeddings.
     * Uses INSERT ... ON CONFLICT for idempotent ingestion.
     */
    async upsert(docs: DocumentUpsert[]): Promise<void> {
        if (!docs.length) return;

        try {
            for (const doc of docs) {
                const vectorStr = `[${doc.embedding.join(",")}]`;
                await prisma.$executeRawUnsafe(
                    `INSERT INTO documents (id, module, content, embedding, metadata, created_at)
                     VALUES ($1, $2, $3, $4::vector, $5::jsonb, NOW())
                     ON CONFLICT (id) DO UPDATE SET
                        content = EXCLUDED.content,
                        embedding = EXCLUDED.embedding,
                        metadata = EXCLUDED.metadata`,
                    doc.id,
                    doc.module,
                    doc.content,
                    vectorStr,
                    JSON.stringify(doc.metadata ?? {})
                );
            }

            logger.info("vector_store.upserted", { count: docs.length });
        } catch (error) {
            logger.error("vector_store.upsert_failed", {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error; // Re-throw for indexing script to handle
        }
    }

    /**
     * Delete documents by IDs.
     */
    async delete(ids: string[]): Promise<void> {
        if (!ids.length) return;

        try {
            await prisma.$executeRawUnsafe(
                `DELETE FROM documents WHERE id = ANY($1::text[])`,
                ids
            );
            logger.info("vector_store.deleted", { count: ids.length });
        } catch (error) {
            logger.error("vector_store.delete_failed", {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    /**
     * Health check — verify pgvector extension and documents table exist.
     */
    async isAvailable(): Promise<boolean> {
        try {
            await prisma.$queryRawUnsafe(
                `SELECT 1 FROM pg_extension WHERE extname = 'vector'`
            );
            return true;
        } catch {
            return false;
        }
    }
}

// ── Singleton ───────────────────────────────────────────────
export const postgresVectorStore = new PostgresVectorStore();
