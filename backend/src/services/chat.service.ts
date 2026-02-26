// ===== JanSathi AI — Chat Service =====
// Wires intent → module → AIService → persistence.
// Pure business logic — no HTTP concerns. Session resolved by route layer.

import { type ModeName } from "../config/env";
import { type ChatRequest, type ChatResponse } from "../utils/types";
import { type SessionData } from "../utils/types";
import logger from "../utils/logger";
import { detectIntent } from "./intent.service";
import { aiService } from "../orchestration/AIService";
import { userService } from "./user.service";
import { conversationMemoryService } from "../retrieval";
import {
    createConversation,
    addMessage,
    findActiveConversation,
} from "./conversation";
import { trackEvent } from "./analytics.service";

export interface ChatHandleResult {
    response: ChatResponse;
    sessionToken?: string; // set only when a new session was created
}

/**
 * Handle a chat message end-to-end.
 * Pure business logic — no HTTP concerns.
 * Session is resolved by the route layer and passed in.
 */
export async function handleChat(
    session: SessionData,
    body: ChatRequest,
    isNewSession: boolean
): Promise<ChatHandleResult> {
    const { message, mode, conversationHistory = [], language = "hi" } = body;

    // 1. Intent detection
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

    // 2. Resolve or create conversation
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

    // 3. Persist user message
    await addMessage({ conversationId, role: "user", content: message, intent, confidence });

    // 4. Call AI orchestration (retry, tools, validation, observability — all handled)
    const aiResult = await aiService.process({
        message,
        mode: activeMode,
        language,
        conversationHistory: conversationHistory.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
        })),
        channel: "web",
        requestId: conversationId,
        userId: session.userId ?? undefined,
        conversationId: conversationId ?? undefined,
    });

    // 5. Persist AI response
    await addMessage({
        conversationId,
        role: "assistant",
        content: aiResult.content,
        responseTimeMs: aiResult.durationMs,
    });

    // 6. Update lastActiveAt (fire-and-forget — never blocks response)
    if (session.userId) {
        userService.updateLastActive(session.userId);

        // 6.5 Store conversation turns in semantic memory (fire-and-forget)
        conversationMemoryService.store({
            userId: session.userId,
            conversationId: conversationId ?? undefined,
            role: "user",
            content: message,
            module: activeMode,
        });
        conversationMemoryService.store({
            userId: session.userId,
            conversationId: conversationId ?? undefined,
            role: "assistant",
            content: aiResult.content,
            module: activeMode,
        });
    }

    // 7. Track analytics (fire-and-forget)
    trackEvent(
        "message_sent",
        session.id,
        { intent, confidence, mode: activeMode, responseTimeMs: aiResult.durationMs },
        session.userId,
        activeMode
    );

    logger.info("chat.completed", {
        mode: activeMode,
        intent,
        llmDurationMs: aiResult.durationMs,
        isDemo: aiResult.isDemo,
        toolsUsed: aiResult.toolsUsed,
    });

    return {
        response: {
            content: aiResult.content,
            mode: activeMode,
            confidence,
            intent,
            conversationId,
            sessionId: session.id,
        },
        sessionToken: isNewSession ? session.token : undefined,
    };
}
