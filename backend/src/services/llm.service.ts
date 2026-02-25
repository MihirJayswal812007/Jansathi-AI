// ===== JanSathi AI — LLM Service =====
// Handles all LLM interaction: completion calls and demo fallbacks.
// Abstracted behind ILLMProvider so the underlying SDK (Groq, OpenAI,
// Anthropic) can be swapped without touching chat.service.ts.

import Groq from "groq-sdk";
import { LLM, VALIDATION, type ModeName } from "../config/env";
import { SYSTEM_PROMPTS } from "../config/prompts";
import logger from "../utils/logger";

// ── Provider Interface ───────────────────────────────────────
// Any LLM provider (OpenAI, Anthropic, local Llama…) must implement this.
// Swap the active provider by changing the export at the bottom of this file.
export interface ILLMProvider {
    generateResponse(input: LLMInput): Promise<LLMOutput>;
}

// ── Shared I/O Types ─────────────────────────────────────────
export interface LLMInput {
    mode: ModeName;
    context: string;
    message: string;
    conversationHistory: { role: "user" | "assistant"; content: string }[];
    language: "hi" | "en";
}

export interface LLMOutput {
    content: string;
    durationMs: number;
    isDemo: boolean;
}

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
    const responses = DEMO_RESPONSES[mode];
    return responses[Math.floor(Math.random() * responses.length)];
}

// ── Groq Implementation ──────────────────────────────────────
// To swap providers, create a new class (e.g. `OpenAILLMProvider`)
// that implements `ILLMProvider` and change the export below.
class GroqLLMProvider implements ILLMProvider {
    private client: Groq;

    constructor() {
        this.client = new Groq({ apiKey: LLM.apiKey || "" });
    }

    async generateResponse(input: LLMInput): Promise<LLMOutput> {
        const startTime = Date.now();

        // If no API key is configured, return a canned demo response
        if (!LLM.isAvailable) {
            return {
                content: getDemoResponse(input.mode),
                durationMs: Date.now() - startTime,
                isDemo: true,
            };
        }

        const systemPrompt = SYSTEM_PROMPTS[input.mode].replace("{context}", input.context);

        const llmMessages = [
            { role: "system" as const, content: systemPrompt },
            ...input.conversationHistory.slice(-VALIDATION.maxConversationHistory).map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
            })),
            {
                role: "user" as const,
                content: `[Language: ${input.language === "hi" ? "Hindi" : "English"}]\n${input.message}`,
            },
        ];

        try {
            const completion = await this.client.chat.completions.create({
                model: LLM.model,
                messages: llmMessages,
                temperature: LLM.temperature,
                max_completion_tokens: LLM.maxTokens,
                top_p: LLM.topP,
            });

            return {
                content: completion.choices[0]?.message?.content || "Maaf kijiye, koi gadbad ho gayi.",
                durationMs: Date.now() - startTime,
                isDemo: false,
            };
        } catch (error) {
            logger.error("llm.completion.error", {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
}

// ── Active Provider ───────────────────────────────────────────
// Swap this line to change the underlying LLM without touching any
// other file. Example:
//   export const llmProvider: ILLMProvider = new OpenAILLMProvider();
export const llmProvider: ILLMProvider = new GroqLLMProvider();

// ── Convenience wrapper (backward-compatible) ─────────────────
// chat.service.ts can still call generateResponse(input) directly.
export async function generateResponse(input: LLMInput): Promise<LLMOutput> {
    return llmProvider.generateResponse(input);
}
