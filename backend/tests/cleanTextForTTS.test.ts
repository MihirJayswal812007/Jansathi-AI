// ===== JanSathi AI — cleanTextForTTS Unit Tests =====
// Tests the TTS text cleaner. This is a pure function with zero dependencies,
// so we copy-paste ONLY the function here to test it in isolation —
// the source of truth is frontend/src/lib/cleanTextForTTS.ts.

import { describe, it, expect } from "vitest";

// ── Inline the function for backend vitest (avoids frontend module resolution) ──
function cleanTextForTTS(text: string): string {
    if (!text) return "";
    let clean = text;
    clean = clean.replace(/^#{1,6}\s+/gm, "");
    clean = clean.replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1");
    clean = clean.replace(/_{1,3}([^_\n]+)_{1,3}/g, "$1");
    clean = clean.replace(/```[\s\S]*?```/g, "");
    clean = clean.replace(/`([^`]+)`/g, "$1");
    clean = clean.replace(/^>\s+/gm, "");
    clean = clean.replace(/^\s*\d+\.\s+/gm, "");
    clean = clean.replace(/^\s*[-*•]\s+/gm, "");
    clean = clean.replace(/^[-*_]{3,}\s*$/gm, "");
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    clean = clean.replace(/!\[[^\]]*\]\([^)]+\)/g, "");
    clean = clean.replace(/<[^>]+>/g, "");
    clean = clean.replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}\u{FE0F}\u{200D}]/gu,
        ""
    );
    clean = clean.replace(/([=\-*_~])\1{2,}/g, "");
    clean = clean.replace(/[*_~\\]/g, "");
    clean = clean.replace(/\n{3,}/g, ". ");
    clean = clean.replace(/\n\n/g, ". ");
    clean = clean.replace(/\n/g, " ");
    clean = clean.replace(/\s{2,}/g, " ");
    clean = clean.replace(/\.{2,}/g, ".");
    clean = clean.replace(/\.\s*\./g, ".");
    clean = clean.trim();
    return clean;
}

// ── A) Emojis Removed ───────────────────────────────────────

describe("cleanTextForTTS: emoji removal", () => {
    it("should remove common emojis", () => {
        expect(cleanTextForTTS("Hello 🌾 world 📊")).toBe("Hello world");
    });

    it("should remove face emojis", () => {
        expect(cleanTextForTTS("Great job! 😀👍")).toBe("Great job!");
    });

    it("should remove flag emojis", () => {
        expect(cleanTextForTTS("India 🇮🇳")).toBe("India");
    });

    it("should preserve Hindi text alongside emojis", () => {
        expect(cleanTextForTTS("🌾 मंडी भाव: गेहूं ₹2100 📊")).toBe("मंडी भाव: गेहूं ₹2100");
    });

    it("should handle empty string", () => {
        expect(cleanTextForTTS("")).toBe("");
    });

    it("should handle null-ish input", () => {
        expect(cleanTextForTTS("")).toBe("");
    });
});

// ── B) Markdown Stripped ─────────────────────────────────────

describe("cleanTextForTTS: markdown removal", () => {
    it("should remove bold markers", () => {
        expect(cleanTextForTTS("This is **bold** text")).toBe("This is bold text");
    });

    it("should remove italic markers", () => {
        expect(cleanTextForTTS("This is *italic* text")).toBe("This is italic text");
    });

    it("should remove heading markers", () => {
        expect(cleanTextForTTS("## My Heading\nContent here")).toBe("My Heading Content here");
    });

    it("should remove inline code", () => {
        expect(cleanTextForTTS("Run `npm install` first")).toBe("Run npm install first");
    });

    it("should remove code blocks entirely", () => {
        const input = "Intro text\n```javascript\nconst x = 1;\n```\nEnd text";
        const result = cleanTextForTTS(input);
        expect(result).toContain("Intro text");
        expect(result).toContain("End text");
        expect(result).not.toContain("const x");
    });

    it("should remove markdown links but keep label", () => {
        expect(cleanTextForTTS("Visit [Google](https://google.com)")).toBe("Visit Google");
    });

    it("should remove images entirely", () => {
        const result = cleanTextForTTS("See ![photo](img.png) below");
        expect(result).not.toContain("img.png");
        expect(result).toContain("below");
    });

    it("should remove blockquotes", () => {
        expect(cleanTextForTTS("> This is a quote")).toBe("This is a quote");
    });

    it("should remove horizontal rules", () => {
        const result = cleanTextForTTS("Above\n---\nBelow");
        expect(result).toContain("Above");
        expect(result).toContain("Below");
        expect(result).not.toContain("---");
    });

    it("should remove HTML tags", () => {
        expect(cleanTextForTTS("Hello <b>world</b>")).toBe("Hello world");
    });
});

// ── C) Lists Normalized ─────────────────────────────────────

describe("cleanTextForTTS: list normalization", () => {
    it("should remove numbered list markers", () => {
        const input = "Steps:\n1. Visit website\n2. Fill form\n3. Submit";
        const result = cleanTextForTTS(input);
        expect(result).toContain("Visit website");
        expect(result).toContain("Fill form");
        expect(result).toContain("Submit");
        expect(result).not.toContain("1.");
        expect(result).not.toContain("2.");
    });

    it("should remove bullet list markers (dash)", () => {
        const input = "Items:\n- Apple\n- Banana";
        const result = cleanTextForTTS(input);
        expect(result).toContain("Apple");
        expect(result).toContain("Banana");
        expect(result).not.toContain("- ");
    });

    it("should remove bullet list markers (asterisk)", () => {
        const input = "* First\n* Second";
        const result = cleanTextForTTS(input);
        expect(result).toContain("First");
        expect(result).toContain("Second");
    });
});

// ── D) Mixed Hindi/English ──────────────────────────────────

describe("cleanTextForTTS: mixed language preservation", () => {
    it("should preserve Hindi devanagari script", () => {
        const input = "**योजना का लाभ** पाने के लिए *आधार कार्ड* अनिवार्य है।";
        const result = cleanTextForTTS(input);
        expect(result).toBe("योजना का लाभ पाने के लिए आधार कार्ड अनिवार्य है।");
    });

    it("should handle Hindi numerals and currency", () => {
        const input = "₹6000 per year for किसान";
        expect(cleanTextForTTS(input)).toBe("₹6000 per year for किसान");
    });

    it("should handle mixed sentences", () => {
        const input = "## PM Kisan योजना\n**₹6000** annually to eligible farmers.";
        const result = cleanTextForTTS(input);
        expect(result).toContain("PM Kisan योजना");
        expect(result).toContain("₹6000 annually");
    });
});

// ── E) Special Characters ───────────────────────────────────

describe("cleanTextForTTS: special characters", () => {
    it("should remove repeated decorative symbols", () => {
        expect(cleanTextForTTS("Hello ===== World")).toBe("Hello World");
    });

    it("should normalize excessive whitespace", () => {
        expect(cleanTextForTTS("Hello    World")).toBe("Hello World");
    });

    it("should handle multiple newlines as sentence breaks", () => {
        const input = "First paragraph\n\n\nSecond paragraph";
        const result = cleanTextForTTS(input);
        expect(result).toContain("First paragraph");
        expect(result).toContain("Second paragraph");
    });

    it("should fix doubled periods", () => {
        expect(cleanTextForTTS("End.. Start")).toBe("End. Start");
    });

    it("should preserve valid punctuation", () => {
        expect(cleanTextForTTS("Hello, world! How are you?")).toBe("Hello, world! How are you?");
    });

    it("should not break on text with no formatting", () => {
        const plain = "This is a plain text message with no formatting at all.";
        expect(cleanTextForTTS(plain)).toBe(plain);
    });
});

// ── F) Complex Real-World Inputs ────────────────────────────

describe("cleanTextForTTS: real-world samples", () => {
    it("should clean a typical JanSathi AI response", () => {
        const input = [
            "## 🌾 PM Kisan Samman Nidhi",
            "",
            "**Eligibility:**",
            "- Land-owning farmer families",
            "- Annual income below ₹200,000",
            "",
            "**Benefits:**",
            "1. ₹6,000 per year",
            "2. Direct bank transfer",
            "3. Three installments of ₹2,000 each",
            "",
            "📋 **Documents needed:** Aadhaar card, land records, bank account",
            "",
            "🔗 Apply at [PM Kisan Portal](https://pmkisan.gov.in)",
        ].join("\n");

        const result = cleanTextForTTS(input);

        // Should NOT contain format artifacts
        expect(result).not.toContain("##");
        expect(result).not.toContain("**");
        expect(result).not.toContain("🌾");
        expect(result).not.toContain("📋");
        expect(result).not.toContain("🔗");
        expect(result).not.toContain("[PM Kisan Portal]");

        // Should preserve meaning
        expect(result).toContain("PM Kisan Samman Nidhi");
        expect(result).toContain("₹6,000");
        expect(result).toContain("Aadhaar card");
        expect(result).toContain("PM Kisan Portal");
    });
});
