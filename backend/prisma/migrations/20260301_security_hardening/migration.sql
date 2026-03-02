-- ===== JanSathi AI — Security Hardening Migration =====
-- 1. Add UNIQUE constraint on long_term_memory.user_id (one summary per user)
-- 2. Add HNSW indexes on vector columns for cosine similarity search
-- 3. These tables are managed via raw SQL migrations (not in Prisma schema)

-- 1. Unique constraint: ensures ON CONFLICT (user_id) works in MemorySummarizer upsert
-- First drop any existing duplicates (keep the most recent per user)
DELETE FROM long_term_memory
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM long_term_memory
    ORDER BY user_id, last_updated DESC
);

ALTER TABLE long_term_memory
    DROP CONSTRAINT IF EXISTS uq_ltm_user_id;

ALTER TABLE long_term_memory
    ADD CONSTRAINT uq_ltm_user_id UNIQUE (user_id);

-- 2. HNSW indexes for fast cosine similarity search (replaces sequential scan)
-- documents table
CREATE INDEX IF NOT EXISTS idx_documents_embedding_hnsw
    ON documents USING hnsw (embedding vector_cosine_ops);

-- conversation_memory table
CREATE INDEX IF NOT EXISTS idx_conversation_memory_embedding_hnsw
    ON conversation_memory USING hnsw (embedding vector_cosine_ops);
