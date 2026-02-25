// ===== JanSathi AI — Observability Types =====

export interface MetricEntry {
    requestId: string;
    mode: string;
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    durationMs: number;
    costUSD: number | null;
    toolsUsed: string[];
    success: boolean;
    errorType: string | null;
    timestamp: Date;
}

export interface PromptLogEntry {
    requestId: string;
    mode: string;
    systemPromptHash: string;
    userMessagePreview: string;
    responsePreview: string;
    timestamp: Date;
}
