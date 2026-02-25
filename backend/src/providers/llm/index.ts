// ===== JanSathi AI — LLM Provider Registry =====
// Config-driven provider selection. Change LLM_PROVIDER env var to swap.

import type { ILLMProvider } from "./ILLMProvider";
import { GroqProvider } from "./GroqProvider";
import logger from "../../utils/logger";

// ── Provider Factory ────────────────────────────────────────
function createProvider(providerName: string): ILLMProvider {
    switch (providerName) {
        case "groq":
            return new GroqProvider();
        // Future providers:
        // case "openai":
        //     return new OpenAIProvider();
        // case "bedrock":
        //     return new BedrockProvider();
        default:
            logger.warn("llm_provider.unknown", { provider: providerName, fallback: "groq" });
            return new GroqProvider();
    }
}

// ── Active Provider Singleton ───────────────────────────────
const providerName = process.env.LLM_PROVIDER || "groq";
export const llmProvider: ILLMProvider = createProvider(providerName);

logger.info("llm_provider.initialized", { provider: llmProvider.name });

// ── Re-exports ──────────────────────────────────────────────
export type { ILLMProvider, StreamChunk, HealthCheckResult } from "./ILLMProvider";
