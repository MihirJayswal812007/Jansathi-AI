// ===== JanSathi AI — Token Estimator =====
// Replaces the 4 chars/token heuristic with a proper byte-pair estimation.
// Supports Hindi (Devanagari) + English mixed text.
//
// Toggle: USE_STRICT_TOKENIZER (default: false = use fast heuristic)
//
// When strict mode is OFF:
//   Uses a refined heuristic: 4 chars/token for Latin, 2 chars/token for Devanagari.
// When strict mode is ON:
//   Uses a regex-based BPE-like tokenizer that better handles subword patterns.

const DEVANAGARI_REGEX = /[\u0900-\u097F]/g;
const LATIN_REGEX = /[a-zA-Z0-9]/g;

/**
 * Fast heuristic token estimation.
 * Better than the previous 4-char flat heuristic because:
 * - Devanagari characters map to ~2 chars/token in most LLM tokenizers
 * - Latin characters map to ~4 chars/token
 * - Punctuation and spaces are ~1 char/token
 */
export function estimateTokensFast(text: string): number {
    if (!text) return 0;

    const devanagariCount = (text.match(DEVANAGARI_REGEX) || []).length;
    const latinCount = (text.match(LATIN_REGEX) || []).length;
    const otherCount = text.length - devanagariCount - latinCount;

    // Devanagari: ~2 chars/token, Latin: ~4 chars/token, Other: ~1 char/token
    const tokens =
        Math.ceil(devanagariCount / 2) +
        Math.ceil(latinCount / 4) +
        Math.ceil(otherCount / 1.5);

    return Math.max(1, tokens);
}

/**
 * Strict regex-based tokenizer.
 * Approximates BPE tokenization patterns used by GPT/Llama models.
 * More accurate but slightly slower than the fast heuristic.
 */
export function estimateTokensStrict(text: string): number {
    if (!text) return 0;

    // Regex patterns that approximate BPE token boundaries
    // Based on OpenAI's cl100k_base tokenizer patterns
    const tokenPattern = /[\u0900-\u097F]+|[a-zA-Z]+(?:'[a-zA-Z]+)?|\d+|[^\sa-zA-Z\d\u0900-\u097F]+|\s+/g;

    const matches = text.match(tokenPattern);
    if (!matches) return 0;

    let tokenCount = 0;
    for (const match of matches) {
        // Devanagari words: roughly 1 token per 2-3 characters
        if (DEVANAGARI_REGEX.test(match)) {
            tokenCount += Math.max(1, Math.ceil(match.length / 2.5));
        }
        // English words: roughly 1 token per word (short words) or 2+ for long words
        else if (/^[a-zA-Z]/.test(match)) {
            tokenCount += match.length <= 4 ? 1 : Math.ceil(match.length / 4);
        }
        // Numbers
        else if (/^\d/.test(match)) {
            tokenCount += Math.max(1, Math.ceil(match.length / 3));
        }
        // Whitespace and punctuation
        else {
            tokenCount += Math.max(1, Math.ceil(match.length / 2));
        }
    }

    return Math.max(1, tokenCount);
}

// ── Configured estimator ────────────────────────────────────
const USE_STRICT = (process.env.USE_STRICT_TOKENIZER || "").toLowerCase() === "true";

/**
 * Estimate token count for a given text.
 * Uses strict BPE-approximation if USE_STRICT_TOKENIZER=true,
 * otherwise uses the fast refined heuristic.
 */
export function estimateTokens(text: string): number {
    return USE_STRICT ? estimateTokensStrict(text) : estimateTokensFast(text);
}
