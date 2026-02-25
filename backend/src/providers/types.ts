// ===== JanSathi AI — Provider Shared Types =====
// All types used across provider interfaces.

import { type ModeName, type Language } from "../config/env";

// ── Chat Message ────────────────────────────────────────────
export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

// ── Tool Definitions (for function-calling providers) ───────
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, ToolParameter>;
    handler: (args: Record<string, unknown>) => Promise<string>;
}

export interface ToolParameter {
    type: "string" | "number" | "boolean" | "object" | "array";
    description: string;
    required?: boolean;
    enum?: string[];
}

export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
}

// ── Token / Cost Tracking ───────────────────────────────────
export interface TokenUsage {
    prompt: number;
    completion: number;
    total: number;
}

export interface CostEstimate {
    inputCostUSD: number;
    outputCostUSD: number;
    totalCostUSD: number;
}

// ── LLM Provider I/O ────────────────────────────────────────
export interface LLMInput {
    mode: ModeName;
    systemPrompt: string;
    messages: ChatMessage[];
    language: Language;
    temperature?: number;
    maxTokens?: number;
    tools?: ToolDefinition[];
    responseFormat?: "text" | "json";
}

export interface LLMOutput {
    content: string;
    durationMs: number;
    isDemo: boolean;
    tokenUsage?: TokenUsage;
    toolCalls?: ToolCall[];
    cost?: CostEstimate;
}


