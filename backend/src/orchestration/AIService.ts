// ===== JanSathi AI — Central AI Service =====
// The single entry point for all AI interactions.
// Orchestrates: PromptBuilder → Provider → ToolRouter → OutputValidator → Retry.
// No controller or route should call LLM providers directly — always go through here.

import { LLM, type ModeName } from "../config/env";
import { INTENT_ROUTER_PROMPT } from "../config/prompts";
import { llmProvider } from "../providers/llm";
import type { LLMOutput } from "../providers/types";
import { buildContext } from "../modules";
import { retrievalService } from "../retrieval";
import { promptBuilder } from "./PromptBuilder";
import { outputValidator } from "./OutputValidator";
import { retryPolicy } from "./RetryPolicy";
import { toolRouter } from "./ToolRouter";
import type { AIRequest, AIResponse } from "./types";
import { metricsCollector } from "../observability/MetricsCollector";
import { promptLogger } from "../observability/PromptLogger";
import logger from "../utils/logger";

// ── Constants ───────────────────────────────────────────────
const MAX_TOOL_ROUNDS = 3;

// ── Request ID Generator ────────────────────────────────────
function generateRequestId(): string {
    try {
        return crypto.randomUUID();
    } catch {
        return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }
}

class AIServiceImpl {
    /**
     * Process an AI request end-to-end.
     *
     * Flow:
     * 1. Build module-specific context
     * 2. Sanitize user input (OutputValidator)
     * 3. Construct prompts (PromptBuilder)
     * 4. Call LLM provider with retry logic (RetryPolicy)
     * 5. Route tool calls with bounded loop (ToolRouter)
     * 6. Validate & sanitize output (OutputValidator)
     * 7. Record observability (MetricsCollector + PromptLogger)
     */
    async process(request: AIRequest): Promise<AIResponse> {
        const requestId = request.requestId || generateRequestId();
        const startTime = Date.now();
        const toolsUsed: string[] = [];

        logger.info("ai_service.processing", {
            requestId,
            mode: request.mode,
            channel: request.channel || "web",
            messageLength: request.message.length,
        });

        try {
            // 1. Build module-specific context
            const moduleContext = await buildContext(request.mode, request.message);

            // 1.5. Retrieve RAG context (if enabled)
            const ragContext = await retrievalService.retrieve(
                request.message,
                request.mode
            );
            const fullContext = ragContext
                ? `${moduleContext}\n\nRelevant Knowledge Base:\n${ragContext}`
                : moduleContext;

            // 2. Sanitize user input
            const sanitizedMessage = outputValidator.sanitizeInput(request.message);

            // 3. Build prompts
            const { systemPrompt, messages } = promptBuilder.buildMessages(
                {
                    mode: request.mode,
                    moduleContext: fullContext,
                    language: request.language,
                    message: sanitizedMessage,
                },
                request.conversationHistory
            );

            // 4. Call LLM with retry
            let currentResult = await retryPolicy.execute(
                () =>
                    llmProvider.generateResponse({
                        mode: request.mode,
                        systemPrompt,
                        messages,
                        language: request.language,
                    }),
                `llm_${request.mode}`
            );

            // 5. Handle tool calls with bounded loop
            for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
                if (!currentResult.toolCalls || currentResult.toolCalls.length === 0) break;

                const toolResults = await toolRouter.executeToolCalls(currentResult.toolCalls);
                toolsUsed.push(...currentResult.toolCalls.map((tc) => tc.name));

                // Sanitize tool outputs before reinjection
                const sanitizedToolOutput = outputValidator.sanitizeToolOutput(
                    toolResults.join("\n\n")
                );

                currentResult = await retryPolicy.execute(
                    () =>
                        llmProvider.generateResponse({
                            mode: request.mode,
                            systemPrompt,
                            messages: [
                                ...messages,
                                { role: "assistant", content: currentResult.content },
                                {
                                    role: "user",
                                    content: `Tool results:\n${sanitizedToolOutput}`,
                                },
                            ],
                            language: request.language,
                        }),
                    `llm_tool_round_${round}_${request.mode}`
                );
            }

            const finalContent = currentResult.content;

            // 6. Validate & sanitize output
            const validation = outputValidator.validate(finalContent);
            if (!validation.isValid) {
                logger.warn("ai_service.output_validation_warnings", {
                    requestId,
                    warnings: validation.warnings,
                });
            }

            const durationMs = Date.now() - startTime;

            // 7. Record observability
            promptLogger.log({
                requestId,
                mode: request.mode,
                systemPrompt,
                userMessage: sanitizedMessage,
                response: validation.sanitizedContent,
            });

            metricsCollector.record({
                requestId,
                mode: request.mode,
                provider: llmProvider.name,
                model: "default",
                promptTokens: currentResult.tokenUsage?.prompt ?? 0,
                completionTokens: currentResult.tokenUsage?.completion ?? 0,
                durationMs,
                costUSD: currentResult.cost?.totalCostUSD ?? null,
                toolsUsed,
                success: true,
                errorType: null,
                timestamp: new Date(),
            });

            logger.info("ai_service.completed", {
                requestId,
                mode: request.mode,
                durationMs,
                isDemo: currentResult.isDemo,
                toolsUsed,
                tokenUsage: currentResult.tokenUsage,
            });

            return {
                content: validation.sanitizedContent,
                mode: request.mode,
                durationMs,
                isDemo: currentResult.isDemo,
                tokenUsage: currentResult.tokenUsage,
                toolsUsed,
                requestId,
            };
        } catch (error) {
            const durationMs = Date.now() - startTime;

            logger.error("ai_service.failed", {
                requestId,
                mode: request.mode,
                durationMs,
                error: error instanceof Error ? error.message : String(error),
            });

            // Record failure metric
            metricsCollector.record({
                requestId,
                mode: request.mode,
                provider: llmProvider.name,
                model: "default",
                promptTokens: 0,
                completionTokens: 0,
                durationMs,
                costUSD: null,
                toolsUsed,
                success: false,
                errorType: error instanceof Error ? error.constructor.name : "UnknownError",
                timestamp: new Date(),
            });

            // Return graceful fallback instead of crashing
            return {
                content: "Maaf kijiye, abhi kuch technical samasya aa rahi hai. Kripya thodi der baad dobara try karein.",
                mode: request.mode,
                durationMs,
                isDemo: false,
                toolsUsed,
                requestId,
            };
        }
    }

    /**
     * Lightweight LLM call for intent classification.
     * Uses retry but skips tools, context building, and output validation.
     */
    async classifyIntent(message: string): Promise<LLMOutput> {
        return retryPolicy.execute(
            () =>
                llmProvider.generateResponse({
                    mode: "janseva",
                    systemPrompt: INTENT_ROUTER_PROMPT,
                    messages: [{ role: "user", content: message }],
                    language: "hi",
                    temperature: LLM.intentTemperature,
                    maxTokens: LLM.intentMaxTokens,
                    responseFormat: "json",
                }),
            "intent_classification"
        );
    }
}

// ── Singleton ───────────────────────────────────────────────
export const aiService = new AIServiceImpl();
