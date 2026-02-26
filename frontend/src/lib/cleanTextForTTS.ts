// ===== JanSathi AI — TTS Text Cleaner =====
// Transforms LLM-formatted display text into clean natural speech.
// NEVER pass raw markdown/emoji text to the TTS engine.

/**
 * Cleans LLM output for text-to-speech synthesis.
 *
 * Removes markdown formatting, emojis, decorative symbols, and
 * converts structured text (lists, headers) into natural speech.
 *
 * @param text - Raw LLM output (may contain markdown, emojis, bullets)
 * @returns Clean plain-text string safe for TTS consumption
 */
export function cleanTextForTTS(text: string): string {
    if (!text) return "";

    let clean = text;

    // ── 1. Remove markdown headings (# ## ### etc.) ─────────────
    clean = clean.replace(/^#{1,6}\s+/gm, "");

    // ── 2. Remove bold and italic markers ────────────────────────
    // **bold** → bold | __bold__ → bold
    clean = clean.replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1");
    clean = clean.replace(/_{1,3}([^_\n]+)_{1,3}/g, "$1");

    // ── 3. Remove inline code and code blocks ─────────────────────
    // ```lang\ncode\n``` → (omit entirely for speech)
    clean = clean.replace(/```[\s\S]*?```/g, "");
    // `inline` → inline value
    clean = clean.replace(/`([^`]+)`/g, "$1");

    // ── 4. Remove blockquotes ─────────────────────────────────────
    clean = clean.replace(/^>\s+/gm, "");

    // ── 5. Convert numbered lists to natural speech ──────────────
    // "1. Item" → "Item." so TTS reads it as a sentence
    clean = clean.replace(/^\s*\d+\.\s+/gm, "");

    // ── 6. Convert bullet/dash/asterisk lists ────────────────────
    clean = clean.replace(/^\s*[-*•]\s+/gm, "");

    // ── 7. Remove horizontal rules ───────────────────────────────
    clean = clean.replace(/^[-*_]{3,}\s*$/gm, "");

    // ── 8. Remove markdown links, keep label ─────────────────────
    // [label](url) → label
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    // ── 9. Remove image syntax ───────────────────────────────────
    clean = clean.replace(/!\[[^\]]*\]\([^)]+\)/g, "");

    // ── 10. Remove HTML tags ─────────────────────────────────────
    clean = clean.replace(/<[^>]+>/g, "");

    // ── 11. Remove emojis (Unicode-safe) ─────────────────────────
    // Covers: emoji, pictographs, dingbats, transport, symbols, flags
    clean = clean.replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}\u{FE0F}\u{200D}]/gu,
        ""
    );

    // ── 12. Remove repeated decorative symbols (===, ----, ****) ─
    clean = clean.replace(/([=\-*_~])\1{2,}/g, "");

    // ── 13. Remove stray asterisks / underscores / tildes ────────
    clean = clean.replace(/[*_~\\]/g, "");

    // ── 14. Normalize whitespace ──────────────────────────────────
    // Collapse multiple blank lines into one pause (single period)
    clean = clean.replace(/\n{3,}/g, ". ");
    // Collapse double newlines into ". " (natural pause)
    clean = clean.replace(/\n\n/g, ". ");
    // Single newlines → space
    clean = clean.replace(/\n/g, " ");
    // Collapse multiple spaces
    clean = clean.replace(/\s{2,}/g, " ");

    // ── 15. Fix doubled punctuation ───────────────────────────────
    clean = clean.replace(/\.{2,}/g, ".");
    clean = clean.replace(/\.\s*\./g, ".");

    // ── 16. Trim ──────────────────────────────────────────────────
    clean = clean.trim();

    return clean;
}
