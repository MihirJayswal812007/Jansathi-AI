-- ===== JanSathi AI — pgvector Documents Table =====
-- Migration: Add documents table for RAG vector storage.
-- Requires: PostgreSQL 14+ with pgvector extension.

-- Enable pgvector extension (requires superuser or rds_superuser)
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table for RAG knowledge base
CREATE TABLE IF NOT EXISTS documents (
    id         TEXT PRIMARY KEY,
    module     TEXT NOT NULL,
    content    TEXT NOT NULL,
    embedding  vector(1536),
    metadata   JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B-tree index for module filtering
CREATE INDEX IF NOT EXISTS idx_documents_module ON documents(module);

-- IVFFlat index for cosine similarity search
-- lists = 100 is good for up to ~100k documents
-- For larger datasets, increase lists = sqrt(num_documents)
CREATE INDEX IF NOT EXISTS idx_documents_embedding
    ON documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Partial index for quick module-scoped searches
CREATE INDEX IF NOT EXISTS idx_documents_module_embedding
    ON documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 50);
