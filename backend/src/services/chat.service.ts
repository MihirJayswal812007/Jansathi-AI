// ===== JanSathi AI — Chat Service (Orchestrator) =====
// The central brain. Wires intent → module → LLM → persistence.
// Routes call this; it knows nothing about HTTP.

import { Request } from "express";
import { type ModeName } from "../config/env";
import { type ChatRequest, type ChatResponse } from "../utils/types";
import logger from "../utils/logger";
import { detectIntent } from "./intent.service";
import { generateResponse } from "./llm.service";
import { buildContext } from "../modules";
import { resolveSession, setSessionCookie } from "../middleware/auth";
import {
    createConversation,
    addMessage,
    findActiveConversation,
    trackEvent,
} from "./conversation";

export interface ChatHandleResult {
    response: ChatResponse;
    sessionToken?: string; // set only when a new session was created
}

/**
 * Handle a chat message end-to-end.
 * Pure business logic — no HTTP concerns.
 */
export async function handleChat(
    req: Request,
    body: ChatRequest
): Promise<ChatHandleResult> {
    const { message, mode, conversationHistory = [], language = "hi" } = body;

    // 1. Resolve session
    const { session, isNew: isNewSession } = await resolveSession(req);

    // 2. Intent detection
    const detected = await detectIntent(message);
    let activeMode: ModeName;
    let confidence: number;
    let intent: string;

    if (mode && detected.module === mode) {
        activeMode = mode; confidence = 1.0; intent = "explicit_confirmed";
    } else if (mode && detected.confidence >= 0.8 && detected.module !== mode) {
        activeMode = detected.module; confidence = detected.confidence; intent = `auto_switch_${detected.intent}`;
    } else if (mode) {
        activeMode = mode; confidence = 1.0; intent = "explicit_mode";
    } else {
        activeMode = detected.module; confidence = detected.confidence; intent = detected.intent;
    }

    // 3. Resolve or create conversation
    let conversationId = body.conversationId || null;
    if (!conversationId && session.userId) {
        conversationId = await findActiveConversation(session.userId, activeMode);
    }
    if (!conversationId) {
        conversationId = await createConversation({
            sessionId: session.id,
            userId: session.userId,
            mode: activeMode,
        });
    }

    // 4. Persist user message
    await addMessage({ conversationId, role: "user", content: message, intent, confidence });

    // 5. Build module-specific context
    const context = await buildContext(activeMode, message);

    // 6. Call LLM
    const llmResult = await generateResponse({
        mode: activeMode,
        context,
        message,
        conversationHistory,
        language,
    });

    // 7. Persist AI response
    await addMessage({
        conversationId,
        role: "assistant",
        content: llmResult.content,
        responseTimeMs: llmResult.durationMs,
    });

    // 8. Track analytics (fire-and-forget)
    trackEvent(
        "message_sent",
        session.id,
        { intent, confidence, mode: activeMode, responseTimeMs: llmResult.durationMs },
        session.userId,
        activeMode
    );

    logger.info("chat.completed", {
        mode: activeMode,
        intent,
        llmDurationMs: llmResult.durationMs,
        isDemo: llmResult.isDemo,
    });

    return {
        response: {
            content: llmResult.content,
            mode: activeMode,
            confidence,
            intent,
            conversationId,
            sessionId: session.id,
        },
        sessionToken: isNewSession ? session.token : undefined,
    };
}
