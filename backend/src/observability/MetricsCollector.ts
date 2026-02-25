// ===== JanSathi AI — Metrics Collector =====
// In-memory buffer with periodic DB flush for AI request metrics.

import type { MetricEntry } from "./types";
import logger from "../utils/logger";

const FLUSH_INTERVAL_MS = 30_000; // 30 seconds
const MAX_BUFFER_SIZE = 100;

class MetricsCollectorImpl {
    private buffer: MetricEntry[] = [];
    private flushTimer: ReturnType<typeof setInterval> | null = null;

    /**
     * Record a metric entry. Buffered in memory and flushed periodically.
     */
    record(entry: MetricEntry): void {
        this.buffer.push(entry);

        if (this.buffer.length >= MAX_BUFFER_SIZE) {
            this.flush();
        }
    }

    /**
     * Start the periodic flush timer.
     */
    start(): void {
        if (this.flushTimer) return;

        this.flushTimer = setInterval(() => {
            this.flush();
        }, FLUSH_INTERVAL_MS);

        // Don't keep the process alive just for metrics flushing
        if (this.flushTimer.unref) {
            this.flushTimer.unref();
        }

        logger.info("metrics_collector.started", { flushIntervalMs: FLUSH_INTERVAL_MS });
    }

    /**
     * Flush buffered metrics to the database.
     * For MVP: log to stdout. Post-MVP: persist to AIMetric table.
     */
    async flush(): Promise<void> {
        if (this.buffer.length === 0) return;

        const batch = [...this.buffer];
        this.buffer = [];

        // MVP: Log metrics as structured JSON for now.
        // Post-MVP: Use prisma.aiMetric.createMany(batch) here.
        logger.info("metrics_collector.flushed", {
            count: batch.length,
            summary: {
                avgDurationMs: Math.round(batch.reduce((s, m) => s + m.durationMs, 0) / batch.length),
                totalTokens: batch.reduce((s, m) => s + m.promptTokens + m.completionTokens, 0),
                successRate: Math.round((batch.filter((m) => m.success).length / batch.length) * 100),
                providers: [...new Set(batch.map((m) => m.provider))],
                modes: [...new Set(batch.map((m) => m.mode))],
            },
        });
    }

    /**
     * Stop the flush timer and flush remaining metrics.
     */
    async stop(): Promise<void> {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
        await this.flush();
        logger.info("metrics_collector.stopped");
    }

    /**
     * Get current buffer stats (for health checks).
     */
    getStats(): { bufferedCount: number; isRunning: boolean } {
        return {
            bufferedCount: this.buffer.length,
            isRunning: this.flushTimer !== null,
        };
    }
}

// ── Singleton ───────────────────────────────────────────────
export const metricsCollector = new MetricsCollectorImpl();
