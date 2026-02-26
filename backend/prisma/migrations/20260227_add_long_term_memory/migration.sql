-- ===== JanSathi AI — Long-Term Memory Table =====
-- Stores LLM-generated summaries of conversation batches per user.
-- Replaces old conversation_memory entries with compressed summaries.

CREATE TABLE IF NOT EXISTS long_term_memory (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL,
    summary      TEXT NOT NULL,
    embedding    vector(1536),
    source_count INT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_long_term_memory_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ltm_user
    ON long_term_memory(user_id);

CREATE INDEX IF NOT EXISTS idx_ltm_embedding
    ON long_term_memory
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 50);
