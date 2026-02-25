// ===== JanSathi AI — Intent Router Service =====
// Detects user intent via keyword matching + LLM fallback.
// LLM fallback uses AIService.classifyIntent() for retry and observability.

import { LLM, VALIDATION, type ModeName } from "../config/env";
import { type IntentResult } from "../utils/types";
import { aiService } from "../orchestration/AIService";
import logger from "../utils/logger";

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

    // Phase 2: LLM-based classification (via AIService — gets retry + observability)
    if (LLM.isAvailable) {
        try {
            const result = await aiService.classifyIntent(message);

            const parsed = JSON.parse(result.content || "{}");
            if (parsed.module && VALIDATION.allowedModes.includes(parsed.module as ModeName)) {
                return {
                    module: parsed.module as ModeName,
                    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
                    intent: parsed.intent || "llm_detected",
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
