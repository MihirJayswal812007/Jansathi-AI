// ===== JanSathi AI — Output Validator =====
// Validates and sanitizes LLM outputs before returning to users.
// Also sanitizes user inputs (defense against prompt injection)
// and tool outputs before reinjection into LLM context.

import type { ValidationResult } from "./types";
import logger from "../utils/logger";

// ── Constants ───────────────────────────────────────────────
const MAX_RESPONSE_LENGTH = 8000;
const MAX_TOOL_OUTPUT_LENGTH = 2000;

// ── Prompt Injection Patterns ───────────────────────────────
const INJECTION_PATTERNS: RegExp[] = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /you\s+are\s+now\s+/i,
    /system:\s*override/i,
    /\[system\]/i,
    /disregard\s+(all\s+)?prior/i,
    /\bpretend\s+you\s+are\b/i,
    /\brole\s*:\s*system\b/i,
];

// ── Content Safety Patterns ─────────────────────────────────
const UNSAFE_CONTENT_PATTERNS: RegExp[] = [
    /\b(password|secret|token|api[_-]?key)\s*[:=]\s*\S+/i,
];

export class OutputValidator {
    /**
     * Validate and sanitize an LLM output string.
     */
    validate(content: string): ValidationResult {
        const warnings: string[] = [];
        let sanitized = content;

        // Enforce max length
        if (sanitized.length > MAX_RESPONSE_LENGTH) {
            sanitized = sanitized.slice(0, MAX_RESPONSE_LENGTH) + "\n\n[Response truncated]";
            warnings.push(`Response exceeded ${MAX_RESPONSE_LENGTH} chars, truncated`);
        }

        // HTML entity sanitization (XSS defense for web rendering)
        sanitized = sanitized
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/javascript:/gi, "");

        // Check for injection patterns in the output (defense-in-depth)
        for (const pattern of INJECTION_PATTERNS) {
            if (pattern.test(sanitized)) {
                warnings.push(`Injection pattern detected: ${pattern.source}`);
                logger.warn("output_validator.injection_detected", { pattern: pattern.source });
            }
        }

        // Redact any leaked secrets
        for (const pattern of UNSAFE_CONTENT_PATTERNS) {
            if (pattern.test(sanitized)) {
                sanitized = sanitized.replace(pattern, "[REDACTED]");
                warnings.push("Unsafe content redacted");
                logger.warn("output_validator.content_redacted");
            }
        }

        // Trim excessive whitespace
        sanitized = sanitized.trim();

        // Check for empty/too-short responses
        if (!sanitized || sanitized.length < 2) {
            sanitized = "Maaf kijiye, koi gadbad ho gayi. Kripya dobara try karein.";
            warnings.push("Empty or too-short response replaced with fallback");
        }

        return {
            isValid: warnings.length === 0,
            sanitizedContent: sanitized,
            warnings,
        };
    }

    /**
     * Sanitize user input before sending to LLM (defense against prompt injection).
     */
    sanitizeInput(input: string): string {
        let sanitized = input;

        for (const pattern of INJECTION_PATTERNS) {
            sanitized = sanitized.replace(pattern, "");
        }

        return sanitized.trim();
    }

    /**
     * Sanitize tool output before reinjecting into LLM context.
     * Applies injection defense + length capping.
     */
    sanitizeToolOutput(output: string): string {
        let sanitized = this.sanitizeInput(output);

        // Cap tool output length to prevent context window bloat
        if (sanitized.length > MAX_TOOL_OUTPUT_LENGTH) {
            sanitized = sanitized.slice(0, MAX_TOOL_OUTPUT_LENGTH) + "\n[Tool output truncated]";
        }

        return sanitized;
    }
}

// ── Singleton ───────────────────────────────────────────────
export const outputValidator = new OutputValidator();
