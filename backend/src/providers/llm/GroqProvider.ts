// ===== JanSathi AI — Groq LLM Provider =====
// Adapter for Groq SDK. Extracted from services/llm.service.ts.

import Groq from "groq-sdk";
import { LLM, VALIDATION, type ModeName } from "../../config/env";
import logger from "../../utils/logger";
import type { ILLMProvider, StreamChunk, HealthCheckResult } from "./ILLMProvider";
import type { LLMInput, LLMOutput, ToolCall } from "../types";

// ── Demo Responses (when no API key) ────────────────────────
const DEMO_RESPONSES: Record<ModeName, string[]> = {
    janseva: [
        "🏛️ PM Awas Yojana ke liye aapki eligibility check karte hain.\n\n**Patrta ke liye sharaten:**\n• Aapki saalana aamdani ₹3 lakh se kam ho\n• Aapke paas pehle se pucca ghar na ho\n\n👉 Kya aap apni aamdani aur category bata sakte hain?",
    ],
    janshiksha: [
        "🌱 **Photosynthesis ko aise samjho:**\n\nJaise humein khana khane se energy milti hai, waise hi **paudhon ko suraj ki roshni se energy milti hai!**\n\n📚 Samajh aaya? Koi aur sawal?",
    ],
    jankrishi: [
        "🌾 **Gehun mein Pila Rust (Yellow Rust) ki samasyaa:**\n\n⚠️ **URGENT: Turant action lein!**\n\n**💊 Ilaj:**\n1️⃣ Propiconazole (Tilt 25 EC) — 1 ml/litre paani\n2️⃣ Neem tel (5ml/litre) spray",
    ],
    janvyapar: [
        "🍯 **Aapke shahad ka professional listing:**\n\n💰 **Suggested Price:** 500g → ₹350-450\n\n🛒 WhatsApp Business download karein!",
    ],
    jankaushal: [
        "📄 **Resume banana shuru karte hain!**\n\nMujhe ye jaankari dijiye:\n1️⃣ Naam\n2️⃣ Phone\n3️⃣ Padhai\n4️⃣ Skills\n\n🎯 Aap bolo, main likhta hoon!",
    ],
};

function getDemoResponse(mode: ModeName): string {
    const responses = DEMO_RESPONSES[mode] || DEMO_RESPONSES.janseva;
    return responses[Math.floor(Math.random() * responses.length)];
}

// ── Groq Provider Implementation ────────────────────────────
export class GroqProvider implements ILLMProvider {
    readonly name = "groq";
    private client: Groq;

    constructor() {
        this.client = new Groq({ apiKey: LLM.apiKey || "" });
    }

    async healthCheck(): Promise<HealthCheckResult> {
        if (!LLM.isAvailable) {
            return { healthy: true, latencyMs: 0, error: "No API key — demo mode active" };
        }

        const start = Date.now();
        try {
            await this.client.chat.completions.create({
                model: LLM.model,
                messages: [{ role: "user", content: "ping" }],
                max_completion_tokens: 1,
            });
            return { healthy: true, latencyMs: Date.now() - start };
        } catch (error) {
            return {
                healthy: false,
                latencyMs: Date.now() - start,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    async generateResponse(input: LLMInput): Promise<LLMOutput> {
        const startTime = Date.now();

        // Demo mode if no API key
        if (!LLM.isAvailable) {
            return {
                content: getDemoResponse(input.mode),
                durationMs: Date.now() - startTime,
                isDemo: true,
            };
        }

        // Build message array
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
            { role: "system", content: input.systemPrompt },
            ...input.messages.slice(-VALIDATION.maxConversationHistory),
        ];

        try {
            const params: Record<string, unknown> = {
                model: LLM.model,
                messages,
                temperature: input.temperature ?? LLM.temperature,
                max_completion_tokens: input.maxTokens ?? LLM.maxTokens,
                top_p: LLM.topP,
            };

            // Add response format for JSON mode
            if (input.responseFormat === "json") {
                params.response_format = { type: "json_object" };
            }

            const completion = await this.client.chat.completions.create(params as any);

            const choice = completion.choices[0];
            const usage = completion.usage;

            // Parse tool calls if present
            let toolCalls: ToolCall[] | undefined;
            if (choice?.message?.tool_calls) {
                toolCalls = choice.message.tool_calls.map((tc: any) => ({
                    id: tc.id,
                    name: tc.function.name,
                    arguments: JSON.parse(tc.function.arguments || "{}"),
                }));
            }

            return {
                content: choice?.message?.content || "Maaf kijiye, koi gadbad ho gayi.",
                durationMs: Date.now() - startTime,
                isDemo: false,
                tokenUsage: usage
                    ? { prompt: usage.prompt_tokens, completion: usage.completion_tokens, total: usage.total_tokens }
                    : undefined,
                toolCalls,
            };
        } catch (error) {
            logger.error("groq_provider.completion.error", {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    async *stream(input: LLMInput): AsyncGenerator<StreamChunk, void, unknown> {
        const startTime = Date.now();

        if (!LLM.isAvailable) {
            yield { content: getDemoResponse(input.mode), isLast: true, metadata: { durationMs: 0, isDemo: true } };
            return;
        }

        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
            { role: "system", content: input.systemPrompt },
            ...input.messages.slice(-VALIDATION.maxConversationHistory),
        ];

        const expectsJSON = input.systemPrompt.includes("CRITICAL INSTRUCTION FOR QUIZZES")
            && input.messages.some(m => m.content.toLowerCase().includes("quiz") || m.content.toLowerCase().includes("mcq"));

        if (expectsJSON) {
            messages.push({
                role: "system",
                content: "CRITICAL REMINDER: The user has asked for a quiz. You MUST respond with ONLY the quiz in the exact format shown in the original instructions: two lines of ---QUIZ_JSON--- surrounding a single-line JSON object. No markdown, no conversation, no code blocks. Just the markers and the JSON."
            });
        }

        try {
            const stream = await this.client.chat.completions.create({
                model: LLM.model,
                messages,
                temperature: input.temperature ?? LLM.temperature,
                max_completion_tokens: input.maxTokens ?? LLM.maxTokens,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) yield { content, isLast: false };
            }

            // Final chunk with metadata
            yield {
                content: "",
                isLast: true,
                metadata: { durationMs: Date.now() - startTime, isDemo: false },
            };
        } catch (error) {
            logger.error("groq_provider.stream.error", {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    estimateCost(input: LLMInput): { estimatedInputTokens: number; estimatedCostUSD: number } | null {
        const totalChars = input.messages.reduce((sum, m) => sum + m.content.length, 0) + input.systemPrompt.length;
        const estimatedTokens = Math.ceil(totalChars / 3);
        const costPerMillion = 0.05;
        return {
            estimatedInputTokens: estimatedTokens,
            estimatedCostUSD: (estimatedTokens / 1_000_000) * costPerMillion,
        };
    }
}
