// ===== JanSathi AI — Shared Types =====

import { type ModeName } from "../config/env";

/** Session data returned from auth middleware */
export interface SessionData {
    id: string;
    token: string;
    userId: string | null;
    role: string;
    language: string;
}

/** Incoming chat request body */
export interface ChatRequest {
    message: string;
    mode?: ModeName;
    conversationId?: string;
    conversationHistory?: { role: "user" | "assistant"; content: string }[];
    language?: "hi" | "en";
}

/** Chat response DTO */
export interface ChatResponse {
    content: string;
    mode: ModeName;
    confidence: number;
    intent: string;
    conversationId: string;
    sessionId: string;
}

/** Intent detection result */
export interface IntentResult {
    module: ModeName;
    confidence: number;
    intent: string;
}
