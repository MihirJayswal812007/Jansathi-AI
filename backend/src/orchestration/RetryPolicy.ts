// ===== JanSathi AI — Retry Policy =====
// Exponential backoff with jitter for transient LLM failures.

import type { RetryConfig } from "./types";
import logger from "../utils/logger";

const DEFAULT_CONFIG: RetryConfig = {
    maxRetries: 2,
    baseDelayMs: 500,
    maxDelayMs: 5000,
    retryableErrors: [
        "ECONNRESET",
        "ETIMEDOUT",
        "rate_limit_exceeded",
        "503",
        "529",
        "overloaded",
    ],
};

export class RetryPolicy {
    private config: RetryConfig;

    constructor(config: Partial<RetryConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Execute a function with retry logic.
     * Uses exponential backoff with jitter.
     */
    async execute<T>(fn: () => Promise<T>, label: string = "unknown"): Promise<T> {
        let lastError: Error | undefined;

        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                if (attempt === this.config.maxRetries || !this.isRetryable(lastError)) {
                    break;
                }

                const delay = this.calculateDelay(attempt);
                logger.warn("retry_policy.retrying", {
                    label,
                    attempt: attempt + 1,
                    maxRetries: this.config.maxRetries,
                    delayMs: delay,
                    error: lastError.message,
                });

                await this.sleep(delay);
            }
        }

        throw lastError;
    }

    private isRetryable(error: Error): boolean {
        const message = error.message.toLowerCase();
        return this.config.retryableErrors.some(
            (pattern) => message.includes(pattern.toLowerCase())
        );
    }

    private calculateDelay(attempt: number): number {
        // Exponential backoff: baseDelay * 2^attempt
        const exponentialDelay = this.config.baseDelayMs * Math.pow(2, attempt);
        // Add jitter: ±25% randomness
        const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
        return Math.min(exponentialDelay + jitter, this.config.maxDelayMs);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

// ── Singleton ───────────────────────────────────────────────
export const retryPolicy = new RetryPolicy();
