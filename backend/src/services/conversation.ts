// ===== JanSathi AI — Conversation Persistence Service =====
// CRUD operations for conversations and messages in Supabase.
// Strict separation of concerns — this service owns all DB writes for chat.

import prisma from "../models/prisma";
import { VALIDATION, type ModeName } from "../config/env";
import logger from "../utils/logger";

// ── Types ───────────────────────────────────────────────────
export interface ConversationCreateInput {
    sessionId: string;
    userId?: string | null;
    mode: ModeName;
}

export interface MessageCreateInput {
    conversationId: string;
    role: "user" | "assistant" | "system";
    content: string;
    intent?: string | null;
    confidence?: number | null;
    responseTimeMs?: number | null;
}

export interface ConversationWithMessages {
    id: string;
    mode: string;
    messages: Array<{
        role: string;
        content: string;
        timestamp: Date;
    }>;
}

// ── Create Conversation ─────────────────────────────────────
export async function createConversation(
    input: ConversationCreateInput
): Promise<string> {
    if (!VALIDATION.allowedModes.includes(input.mode)) {
        throw new Error(`Invalid mode: ${input.mode}`);
    }

    const conversation = await prisma.conversation.create({
        data: {
            userId: input.userId || null,
            mode: input.mode,
        },
    });

    logger.info("conversation.created", {
        conversationId: conversation.id,
        mode: input.mode,
        sessionId: input.sessionId,
    });

    return conversation.id;
}

// ── Add Message ─────────────────────────────────────────────
export async function addMessage(input: MessageCreateInput): Promise<string> {
    if (!input.content || input.content.trim() === "") {
        throw new Error("Message content cannot be empty");
    }

    const message = await prisma.message.create({
        data: {
            conversationId: input.conversationId,
            role: input.role,
            content: input.content,
            intent: input.intent || null,
            confidence: input.confidence || null,
            responseTimeMs: input.responseTimeMs || null,
        },
    });

    logger.debug("conversation.message.added", {
        messageId: message.id,
        conversationId: input.conversationId,
        role: input.role,
        contentLength: input.content.length,
    });

    return message.id;
}

// ── Get Conversation History ────────────────────────────────
export async function getConversationHistory(
    conversationId: string,
    limit?: number
): Promise<ConversationWithMessages | null> {
    const maxMessages = limit || VALIDATION.maxConversationHistory;

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            messages: {
                orderBy: { timestamp: "desc" },
                take: maxMessages,
                select: {
                    role: true,
                    content: true,
                    timestamp: true,
                },
            },
        },
    });

    if (!conversation) return null;

    return {
        id: conversation.id,
        mode: conversation.mode,
        messages: conversation.messages.reverse(), // chronological order
    };
}

// ── Find Active Conversation ────────────────────────────────
export async function findActiveConversation(
    userId: string,
    mode: ModeName
): Promise<string | null> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const conversation = await prisma.conversation.findFirst({
        where: {
            userId,
            mode,
            endedAt: null,
            startedAt: { gte: fiveMinutesAgo },
        },
        orderBy: { startedAt: "desc" },
        select: { id: true },
    });

    return conversation?.id || null;
}

// ── End Conversation ────────────────────────────────────────
export async function endConversation(
    conversationId: string,
    satisfaction?: number
): Promise<void> {
    if (satisfaction !== undefined && (satisfaction < 1 || satisfaction > 5)) {
        throw new Error("Satisfaction must be between 1 and 5");
    }

    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            endedAt: new Date(),
            resolved: true,
            satisfaction: satisfaction || null,
        },
    });

    logger.info("conversation.ended", {
        conversationId,
        satisfaction,
    });
}

