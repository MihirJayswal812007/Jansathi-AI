// ===== JanSathi AI — Context Compressor =====
// Token-aware trimming of retrieved documents to fit within token budget.
// Uses Hindi-aware tokenizer (replaces old 4 chars/token heuristic).

import type { RetrievedDocument } from "./types";
import { estimateTokens as tokenize } from "./tokenizer";

// Re-export for backward compatibility (tests import from here)
export { estimateTokens } from "./tokenizer";

/**
 * Compress retrieved documents into a token-budget-aware context string.
 *
 * - Documents are already sorted by score (highest first).
 * - Each doc is added until the token budget is exhausted.
 * - Partial documents are NOT included — it's all or nothing per doc.
 * - Output is a numbered list with source attribution.
 *
 * @param docs  Retrieved documents sorted by relevance score (desc)
 * @param maxTokenBudget  Maximum tokens for the combined context
 * @returns Formatted context string (may be empty if nothing fits)
 */
export function compressContext(
    docs: RetrievedDocument[],
    maxTokenBudget: number
): string {
    if (!docs.length) return "";

    const chunks: string[] = [];
    let usedTokens = 0;

    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        const formatted = `[${i + 1}] ${doc.content.trim()}`;
        const tokenCost = tokenize(formatted);

        if (usedTokens + tokenCost > maxTokenBudget) break;

        chunks.push(formatted);
        usedTokens += tokenCost;
    }

    if (!chunks.length) return "";

    return chunks.join("\n\n");
}
