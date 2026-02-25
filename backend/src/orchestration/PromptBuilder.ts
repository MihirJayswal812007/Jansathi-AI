// ===== JanSathi AI — Prompt Builder =====
// Constructs system and user prompts from module context and configuration.

import { SYSTEM_PROMPTS } from "../config/prompts";
import type { PromptContext } from "./types";
import type { ChatMessage } from "../providers/types";

export class PromptBuilder {
    /**
     * Build the system prompt for a given module, injecting module-specific context.
     */
    buildSystemPrompt(context: PromptContext): string {
        const basePrompt = SYSTEM_PROMPTS[context.mode];
        return basePrompt.replace("{context}", context.moduleContext);
    }

    /**
     * Build the user message with language annotation.
     */
    buildUserMessage(message: string, language: "hi" | "en"): ChatMessage {
        return {
            role: "user",
            content: `[Language: ${language === "hi" ? "Hindi" : "English"}]\n${message}`,
        };
    }

    /**
     * Prepare the full message array for the LLM provider.
     * System prompt + conversation history + current user message.
     */
    buildMessages(
        context: PromptContext,
        conversationHistory: ChatMessage[]
    ): { systemPrompt: string; messages: ChatMessage[] } {
        const systemPrompt = this.buildSystemPrompt(context);
        const userMessage = this.buildUserMessage(context.message, context.language);

        return {
            systemPrompt,
            messages: [
                ...conversationHistory.filter((m) => m.role !== "system"),
                userMessage,
            ],
        };
    }
}

// ── Singleton ───────────────────────────────────────────────
export const promptBuilder = new PromptBuilder();
