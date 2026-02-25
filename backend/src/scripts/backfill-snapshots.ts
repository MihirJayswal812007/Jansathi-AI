#!/usr/bin/env ts-node
// ===== JanSathi AI — Snapshot Backfill Script =====
// Usage: npx ts-node src/scripts/backfill-snapshots.ts --days 30
//
// Iterates backwards from today, computing a DailySnapshot for each day.
// Idempotent — safe to re-run. Skips days that already have snapshots.

import { computeSnapshot } from "../jobs/dailySnapshot";
import prisma from "../models/prisma";

const DEFAULT_DAYS = 30;

async function main() {
    const daysArg = process.argv.find((a) => a.startsWith("--days="));
    const days = daysArg ? parseInt(daysArg.split("=")[1]) : DEFAULT_DAYS;

    console.log(`[backfill] Computing snapshots for last ${days} days...`);

    let created = 0;
    let skipped = 0;

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dateStr = dayStart.toISOString().split("T")[0];

        // Check if snapshot already exists
        const existing = await prisma.dailySnapshot.findUnique({
            where: { date: dayStart },
        });

        if (existing) {
            skipped++;
            continue;
        }

        try {
            await computeSnapshot(date);
            created++;
            console.log(`  ✓ ${dateStr}`);
        } catch (error) {
            console.error(`  ✗ ${dateStr}: ${error instanceof Error ? error.message : error}`);
        }
    }

    console.log(`[backfill] Done. Created: ${created}, Skipped: ${skipped}`);
    await prisma.$disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error("[backfill] Fatal error:", err);
    process.exit(1);
});
