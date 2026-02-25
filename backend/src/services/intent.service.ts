// ===== JanSathi AI — Intent Router Service =====
// Detects user intent via keyword matching + LLM fallback.
// Extracted from routes/chat.ts for testability and reuse.

import Groq from "groq-sdk";
import { LLM, VALIDATION, type ModeName } from "../config/env";
import { INTENT_ROUTER_PROMPT } from "../config/prompts";
import { type IntentResult } from "../utils/types";
import logger from "../utils/logger";

const groq = new Groq({ apiKey: LLM.apiKey || "" });

// ── Keyword Map ─────────────────────────────────────────────
const KEYWORD_MAP: Record<string, ModeName> = {
    scheme: "janseva", yojana: "janseva", aadhaar: "janseva", ration: "janseva",
    sarkari: "janseva", government: "janseva", complaint: "janseva", shikayat: "janseva",
    pension: "janseva", awas: "janseva", ujjwala: "janseva", document: "janseva",
    card: "janseva", ayushman: "janseva", ladli: "janseva", sukanya: "janseva",
    explain: "janshiksha", padhai: "janshiksha", homework: "janshiksha",
    class: "janshiksha", math: "janshiksha", science: "janshiksha",
    question: "janshiksha", quiz: "janshiksha", photosynthesis: "janshiksha",
    exam: "janshiksha", study: "janshiksha", samjhao: "janshiksha",
    crop: "jankrishi", fasal: "jankrishi", mandi: "jankrishi",
    kisan: "jankrishi", weather: "jankrishi", mausam: "jankrishi",
    disease: "jankrishi", keeda: "jankrishi", gehun: "jankrishi",
    wheat: "jankrishi", rice: "jankrishi", dhan: "jankrishi",
    fertilizer: "jankrishi", soil: "jankrishi", kheti: "jankrishi",
    sell: "janvyapar", bechna: "janvyapar", product: "janvyapar",
    price: "janvyapar", catalog: "janvyapar", shop: "janvyapar",
    shahad: "janvyapar", honey: "janvyapar", pickle: "janvyapar",
    business: "janvyapar", dukan: "janvyapar",
    job: "jankaushal", naukri: "jankaushal", resume: "jankaushal",
    career: "jankaushal", skill: "jankaushal", interview: "jankaushal",
    driver: "jankaushal", training: "jankaushal", rojgar: "jankaushal",
};

/**
 * Detect the user's intent from their message.
 * Strategy: fast keyword match first, LLM fallback if no hit.
 */
export async function detectIntent(message: string): Promise<IntentResult> {
    const lowerMsg = message.toLowerCase();

    // Phase 1: Keyword match (< 1ms)
    for (const [keyword, module] of Object.entries(KEYWORD_MAP)) {
        if (lowerMsg.includes(keyword)) {
            return { module, confidence: 0.85, intent: `keyword_${keyword}` };
        }
    }

    // Phase 2: LLM-based classification (if available)
    if (LLM.isAvailable) {
        try {
            const response = await groq.chat.completions.create({
                model: LLM.model,
                messages: [
                    { role: "system", content: INTENT_ROUTER_PROMPT },
                    { role: "user", content: message },
                ],
                temperature: LLM.intentTemperature,
                max_completion_tokens: LLM.intentMaxTokens,
                response_format: { type: "json_object" },
            });

            const result = JSON.parse(response.choices[0]?.message?.content || "{}");
            if (result.module && VALIDATION.allowedModes.includes(result.module as ModeName)) {
                return {
                    module: result.module as ModeName,
                    confidence: typeof result.confidence === "number" ? result.confidence : 0.8,
                    intent: result.intent || "llm_detected",
                };
            }
        } catch (error) {
            logger.warn("intent.llm_fallback", {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    // Phase 3: Default fallback
    return { module: "janseva", confidence: 0.5, intent: "default_fallback" };
}
