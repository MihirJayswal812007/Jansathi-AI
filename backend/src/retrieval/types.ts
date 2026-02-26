// ===== JanSathi AI — RAG Retrieval Types =====

import type { ModeName } from "../config/env";

/** A document retrieved from the vector store */
export interface RetrievedDocument {
    id: string;
    module: string;
    content: string;
    score: number;
    metadata: Record<string, unknown>;
}

/** Arguments for upserting documents into the vector store */
export interface DocumentUpsert {
    id: string;
    module: string;
    content: string;
    embedding: number[];
    metadata?: Record<string, unknown>;
}

/** Vector store interface — implemented by PostgresVectorStore (or others) */
export interface IVectorStore {
    /** Search for similar documents in a module namespace */
    search(embedding: number[], module: string, topK: number, scoreThreshold?: number): Promise<RetrievedDocument[]>;
    /** Upsert documents with pre-computed embeddings */
    upsert(docs: DocumentUpsert[]): Promise<void>;
    /** Delete documents by IDs */
    delete(ids: string[]): Promise<void>;
    /** Health check */
    isAvailable(): Promise<boolean>;
}

/** RAG configuration (from env) */
export interface RAGConfig {
    enabled: boolean;
    topK: number;
    maxTokenBudget: number;
    scoreThreshold: number;
}
