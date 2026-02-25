// ===== JanSathi AI — Orchestration Layer Types =====

import { type ModeName, type Language } from "../config/env";
import type { ChatMessage, ToolDefinition, ToolCall } from "../providers/types";

// ── AIService Request/Response ──────────────────────────────
export interface AIRequest {
    /** The user's message */
    message: string;
    /** Active module mode */
    mode: ModeName;
    /** User's preferred language */
    language: Language;
    /** Previous conversation messages for context */
    conversationHistory: ChatMessage[];
    /** Optional: channel the request came from */
    channel?: "web" | "whatsapp" | "api";
    /** Optional: request ID for tracing */
    requestId?: string;
}

export interface AIResponse {
    /** The AI's text response */
    content: string;
    /** Module that handled the request */
    mode: ModeName;
    /** Time taken for end-to-end processing */
    durationMs: number;
    /** Whether this was a demo/fallback response */
    isDemo: boolean;
    /** Token usage if available */
    tokenUsage?: { prompt: number; completion: number; total: number };
    /** Any tools that were invoked */
    toolsUsed: string[];
    /** Request ID for correlation */
    requestId: string;
}

// ── Prompt Builder Types ────────────────────────────────────
export interface PromptContext {
    mode: ModeName;
    moduleContext: string;
    language: Language;
    message: string;
}

// ── Retry Policy Types ──────────────────────────────────────
export interface RetryConfig {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    retryableErrors: string[];
}

// ── Output Validation ───────────────────────────────────────
export interface ValidationResult {
    isValid: boolean;
    sanitizedContent: string;
    warnings: string[];
}
