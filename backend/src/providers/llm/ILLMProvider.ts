// ===== JanSathi AI — LLM Provider Interface =====
// Any LLM provider (Groq, OpenAI, Anthropic, Bedrock, local) must implement this.
// Swap the active provider in providers/llm/index.ts.

import { type LLMInput, type LLMOutput } from "../types";

// ── Streaming Types ─────────────────────────────────────────
export interface StreamChunk {
    /** Text content of this chunk */
    content: string;
    /** Whether this is the final chunk */
    isLast: boolean;
    /** Final metadata, only present on the last chunk */
    metadata?: Partial<LLMOutput>;
}

// ── Health Check Result ─────────────────────────────────────
export interface HealthCheckResult {
    healthy: boolean;
    latencyMs: number;
    error?: string;
}

// ── Provider Interface ──────────────────────────────────────
export interface ILLMProvider {
    /** Human-readable provider name for logging/metrics */
    readonly name: string;

    /** Standard completion — returns full response after generation finishes */
    generateResponse(input: LLMInput): Promise<LLMOutput>;

    /**
     * Streaming completion — yields typed chunks as they arrive.
     * Last chunk has `isLast: true` and includes metadata (tokenUsage, durationMs).
     */
    stream?(input: LLMInput): AsyncGenerator<StreamChunk, void, unknown>;

    /**
     * Estimate cost for a given input without actually calling the API.
     * Returns null if cost tracking is not supported for this provider.
     */
    estimateCost?(input: LLMInput): { estimatedInputTokens: number; estimatedCostUSD: number } | null;

    /**
     * Validate API key and connectivity. Called at startup.
     * Must not throw — returns result object.
     */
    healthCheck(): Promise<HealthCheckResult>;
}
