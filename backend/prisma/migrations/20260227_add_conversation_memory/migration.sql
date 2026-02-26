-- ===== JanSathi AI — Conversation Memory Table =====
-- Migration: Per-user semantic conversation memory for RAG grounding.
-- Requires: pgvector extension (already enabled by documents migration).

CREATE TABLE IF NOT EXISTS conversation_memory (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL,
    conversation_id TEXT,
    role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content         TEXT NOT NULL,
    embedding       vector(1536),
    module          TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign key to users table (no cascade delete — memory persists)
    CONSTRAINT fk_conversation_memory_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Per-user search: filter by user_id + cosine similarity
CREATE INDEX IF NOT EXISTS idx_conv_memory_user
    ON conversation_memory(user_id);

CREATE INDEX IF NOT EXISTS idx_conv_memory_user_created
    ON conversation_memory(user_id, created_at DESC);

-- IVFFlat cosine index for similarity search
CREATE INDEX IF NOT EXISTS idx_conv_memory_embedding
    ON conversation_memory
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
