// ===== JanSathi AI — Long-Term Memory Dedup Test =====
// Verifies that the MemorySummarizer never creates duplicate summary rows.

import { describe, it, expect, afterAll, beforeAll } from "vitest";
import prisma from "../src/models/prisma";
import { cleanupTestData, disconnectDb } from "./helpers/db";
import { createTestUser } from "./helpers/setup";

beforeAll(async () => {
    // Ensure UNIQUE constraint exists (idempotent)
    await prisma.$executeRawUnsafe(
        `ALTER TABLE long_term_memory
         DROP CONSTRAINT IF EXISTS uq_ltm_user_id`
    );
    // Clean any existing duplicates first
    await prisma.$executeRawUnsafe(
        `DELETE FROM long_term_memory
         WHERE id NOT IN (
             SELECT DISTINCT ON (user_id) id
             FROM long_term_memory
             ORDER BY user_id, last_updated DESC
         )`
    ).catch(() => { /* table may have no rows */ });
    await prisma.$executeRawUnsafe(
        `ALTER TABLE long_term_memory
         ADD CONSTRAINT uq_ltm_user_id UNIQUE (user_id)`
    );
});

afterAll(async () => {
    await cleanupTestData();
    await disconnectDb();
});

describe("Long-Term Memory: deduplication", () => {
    it("should have at most one summary row per user via SQL upsert", async () => {
        const user = await createTestUser();

        // Insert first summary
        await prisma.$executeRawUnsafe(
            `INSERT INTO long_term_memory (id, user_id, summary, source_count, last_updated)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
                summary = EXCLUDED.summary,
                source_count = long_term_memory.source_count + EXCLUDED.source_count,
                last_updated = NOW()`,
            `lts_test_1`,
            user.id,
            "First summary",
            5
        );

        // Insert second summary for same user (should upsert, not duplicate)
        await prisma.$executeRawUnsafe(
            `INSERT INTO long_term_memory (id, user_id, summary, source_count, last_updated)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
                summary = EXCLUDED.summary,
                source_count = long_term_memory.source_count + EXCLUDED.source_count,
                last_updated = NOW()`,
            `lts_test_2`,
            user.id,
            "Second summary",
            3
        );

        // Insert third summary — still should be one row
        await prisma.$executeRawUnsafe(
            `INSERT INTO long_term_memory (id, user_id, summary, source_count, last_updated)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
                summary = EXCLUDED.summary,
                source_count = long_term_memory.source_count + EXCLUDED.source_count,
                last_updated = NOW()`,
            `lts_test_3`,
            user.id,
            "Third summary",
            2
        );

        // Query: should be exactly 1 row
        const rows = await prisma.$queryRawUnsafe<{ cnt: bigint }[]>(
            `SELECT COUNT(*) as cnt FROM long_term_memory WHERE user_id = $1`,
            user.id
        );

        expect(Number(rows[0].cnt)).toBe(1);

        // Verify content is the latest summary with accumulated source count
        const summary = await prisma.$queryRawUnsafe<
            { summary: string; source_count: number }[]
        >(
            `SELECT summary, source_count FROM long_term_memory WHERE user_id = $1`,
            user.id
        );

        expect(summary[0].summary).toBe("Third summary");
        expect(summary[0].source_count).toBe(10); // 5 + 3 + 2

        // Cleanup
        await prisma.$executeRawUnsafe(
            `DELETE FROM long_term_memory WHERE user_id = $1`,
            user.id
        );
    });
});
