// ===== JanSathi AI — Tool Router =====
// Routes tool_call responses from LLM to the appropriate module handler.
// Includes timeout protection and argument schema validation.

import type { ToolCall, ToolDefinition, ToolParameter } from "../providers/types";
import logger from "../utils/logger";

// ── Constants ───────────────────────────────────────────────
const TOOL_TIMEOUT_MS = 10_000;

// ── Timeout Utility ─────────────────────────────────────────
class ToolTimeoutError extends Error {
    constructor(toolName: string) {
        super(`Tool "${toolName}" timed out after ${TOOL_TIMEOUT_MS}ms`);
        this.name = "ToolTimeoutError";
    }
}

function withTimeout<T>(promise: Promise<T>, toolName: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new ToolTimeoutError(toolName)), TOOL_TIMEOUT_MS);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

// ── Argument Validator ──────────────────────────────────────
function validateArgs(
    params: Record<string, ToolParameter>,
    args: Record<string, unknown>
): string | null {
    for (const [name, param] of Object.entries(params)) {
        const value = args[name];

        // Check required fields
        if (param.required && (value === undefined || value === null || value === "")) {
            return `Missing required argument: "${name}"`;
        }

        // Skip validation for absent optional fields
        if (value === undefined || value === null) continue;

        // Type validation
        switch (param.type) {
            case "number": {
                const num = Number(value);
                if (isNaN(num) || !isFinite(num)) {
                    return `Invalid number for "${name}": ${String(value).slice(0, 50)}`;
                }
                break;
            }
            case "boolean": {
                if (typeof value !== "boolean" && value !== "true" && value !== "false") {
                    return `Invalid boolean for "${name}"`;
                }
                break;
            }
            case "string": {
                if (typeof value !== "string") {
                    return `Expected string for "${name}", got ${typeof value}`;
                }
                // Guard against excessively long strings
                if ((value as string).length > 2000) {
                    return `Argument "${name}" exceeds max length (2000 chars)`;
                }
                break;
            }
        }

        // Enum validation
        if (param.enum && !param.enum.includes(String(value))) {
            return `"${name}" must be one of: ${param.enum.join(", ")}`;
        }
    }

    return null; // All valid
}

// ── Tool Router ─────────────────────────────────────────────
export class ToolRouter {
    private registry: Map<string, ToolDefinition> = new Map();

    /**
     * Register tool definitions (typically from module tools.ts files).
     */
    registerTools(tools: ToolDefinition[]): void {
        for (const tool of tools) {
            this.registry.set(tool.name, tool);
            logger.debug("tool_router.registered", { tool: tool.name });
        }
    }

    /**
     * Execute a set of tool calls returned by the LLM.
     * Validates arguments, applies timeout, returns results.
     */
    async executeToolCalls(toolCalls: ToolCall[]): Promise<string[]> {
        const results: string[] = [];

        for (const call of toolCalls) {
            const tool = this.registry.get(call.name);

            if (!tool) {
                logger.warn("tool_router.unknown_tool", { name: call.name });
                results.push(`[Tool "${call.name}" not found]`);
                continue;
            }

            // Validate arguments before execution
            const validationError = validateArgs(tool.parameters, call.arguments);
            if (validationError) {
                logger.warn("tool_router.validation_error", {
                    tool: call.name,
                    error: validationError,
                });
                results.push(`[Tool "${call.name}" validation error: ${validationError}]`);
                continue;
            }

            try {
                const result = await withTimeout(tool.handler(call.arguments), call.name);
                results.push(result);
                logger.info("tool_router.executed", {
                    tool: call.name,
                    resultLength: result.length,
                });
            } catch (error) {
                const isTimeout = error instanceof ToolTimeoutError;
                logger.error("tool_router.execution_error", {
                    tool: call.name,
                    isTimeout,
                    error: error instanceof Error ? error.message : String(error),
                });
                results.push(
                    `[Tool "${call.name}" ${isTimeout ? "timed out" : "failed"}: ${error instanceof Error ? error.message : "unknown error"
                    }]`
                );
            }
        }

        return results;
    }

    /**
     * Get all registered tool definitions (for passing to LLM).
     */
    getToolDefinitions(): ToolDefinition[] {
        return Array.from(this.registry.values());
    }

    /**
     * Check if any tools are registered.
     */
    hasTools(): boolean {
        return this.registry.size > 0;
    }
}

// ── Singleton ───────────────────────────────────────────────
export const toolRouter = new ToolRouter();
