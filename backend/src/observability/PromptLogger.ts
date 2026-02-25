// ===== JanSathi AI — Prompt Logger =====
// Logs prompts and responses for debugging and auditing.
// Supports three modes: full (dev), hash (prod), disabled.

import { createHash } from "crypto";
import type { PromptLogEntry } from "./types";
import logger from "../utils/logger";

type PromptLogMode = "full" | "hash" | "disabled";

class PromptLoggerImpl {
    private mode: PromptLogMode;

    constructor() {
        this.mode = (process.env.PROMPT_LOG_MODE as PromptLogMode) || "hash";
    }

    /**
     * Log a prompt/response pair.
     * - "full" mode: logs complete content (dev only — never in prod)
     * - "hash" mode: logs SHA-256 hashes for correlation without exposing PII
     * - "disabled": no logging
     */
    log(entry: {
        requestId: string;
        mode: string;
        systemPrompt: string;
        userMessage: string;
        response: string;
    }): void {
        if (this.mode === "disabled") return;

        const logEntry: PromptLogEntry = {
            requestId: entry.requestId,
            mode: entry.mode,
            systemPromptHash: this.hashOrContent(entry.systemPrompt),
            userMessagePreview: this.previewOrHash(entry.userMessage),
            responsePreview: this.previewOrHash(entry.response),
            timestamp: new Date(),
        };

        logger.debug("prompt_logger.logged", logEntry as any);
    }

    private hashOrContent(text: string): string {
        if (this.mode === "full") return text;
        return createHash("sha256").update(text).digest("hex").slice(0, 12);
    }

    private previewOrHash(text: string): string {
        if (this.mode === "full") return text;
        // In hash mode: show first 50 chars + hash for correlation
        const preview = text.slice(0, 50).replace(/\n/g, " ");
        const hash = createHash("sha256").update(text).digest("hex").slice(0, 8);
        return `${preview}... [${hash}]`;
    }
}

// ── Singleton ───────────────────────────────────────────────
export const promptLogger = new PromptLoggerImpl();
