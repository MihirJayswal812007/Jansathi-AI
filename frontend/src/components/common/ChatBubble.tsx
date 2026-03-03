// ===== JanSathi AI — Chat Bubble V2 (Stitch Design) =====
// Glassmorphic AI messages with module-accent left border
// User messages with dark card style · Material Symbols play audio button

"use client";

import { motion } from "framer-motion";
import { ChatMessage } from "@/types/modules";
import { MODE_CONFIGS } from "@/lib/constants";
import { cleanTextForTTS } from "@/lib/cleanTextForTTS";
import QuizCard, { QuizData } from "../chat/QuizCard";

interface ChatBubbleProps {
    message: ChatMessage;
    onSpeak?: (text: string) => void;
    isSpeaking?: boolean;
    onStopSpeaking?: () => void;
    language?: "hi" | "en";
}

export default function ChatBubble({
    message,
    onSpeak,
    isSpeaking = false,
    onStopSpeaking,
    language = "hi",
}: ChatBubbleProps) {
    const isUser = message.role === "user";
    const modeConfig = message.mode ? MODE_CONFIGS[message.mode] : null;

    let parsedQuiz: QuizData | null = null;
    let displayText = message.content;

    // ── Quiz Detection ──────────────────────────────────────────────
    // Handle all possible formats the LLM might output:
    // 1. ---QUIZ_JSON--- markers (preferred)
    // 2. Markdown ```json blocks
    // 3. <QUIZ>...</QUIZ> XML tags
    // 4. HTML-escaped &lt;QUIZ&gt;...&lt;/QUIZ&gt; (happens when LLM escapes HTML)

    if (!isUser && message.content.includes('"type": "quiz"')) {
        let jsonString = "";
        const raw = message.content;

        // Strategy 1: ---QUIZ_JSON--- markers
        const MARKER = "---QUIZ_JSON---";
        if (raw.includes(MARKER)) {
            const parts = raw.split(MARKER);
            if (parts.length >= 3) {
                jsonString = parts[1].trim();
            } else if (parts.length === 2) {
                displayText = parts[0].trim();
            }
        }

        // Strategy 2: ```json / ``` markdown block
        if (!jsonString) {
            const mdMatch = raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/);
            if (mdMatch) jsonString = mdMatch[1].trim();
        }

        // Strategy 3: <QUIZ>...</QUIZ> raw tags
        if (!jsonString && raw.includes("<QUIZ>")) {
            const s = raw.indexOf("<QUIZ>") + 6;
            const e = raw.lastIndexOf("</QUIZ>");
            if (e > s) jsonString = raw.substring(s, e).trim();
        }

        // Strategy 4: HTML-escaped &lt;QUIZ&gt;...&lt;/QUIZ&gt;
        if (!jsonString && raw.includes("&lt;QUIZ&gt;")) {
            const s = raw.indexOf("&lt;QUIZ&gt;") + 12;
            const e = raw.lastIndexOf("&lt;/QUIZ&gt;");
            if (e > s) jsonString = raw.substring(s, e).trim();
        }

        // Strategy 5: fallback — grab the first { ... } that contains "type":"quiz"
        if (!jsonString) {
            const s = raw.indexOf("{");
            const e = raw.lastIndexOf("}");
            if (s !== -1 && e > s) jsonString = raw.substring(s, e + 1);
        }

        if (jsonString) {
            try {
                const jsonObj = JSON.parse(jsonString);
                if (jsonObj && jsonObj.type === "quiz") {
                    parsedQuiz = jsonObj as QuizData;
                    // Clean up display text — remove everything from the first marker/tag onwards
                    displayText = raw
                        .replace(jsonString, "")
                        .replace(/---QUIZ_JSON---/g, "")
                        .replace(/```json/gi, "").replace(/```/g, "")
                        .replace(/<\/?QUIZ>/g, "")
                        .replace(/&lt;\/?QUIZ&gt;/g, "")
                        .trim();
                }
            } catch {
                // JSON is incomplete (still streaming) — hide raw payload, show nothing extra
                const firstMarkerIdx = Math.min(
                    raw.includes(MARKER) ? raw.indexOf(MARKER) : Infinity,
                    raw.includes("```json") ? raw.indexOf("```json") : Infinity,
                    raw.includes("<QUIZ>") ? raw.indexOf("<QUIZ>") : Infinity,
                    raw.includes("&lt;QUIZ&gt;") ? raw.indexOf("&lt;QUIZ&gt;") : Infinity,
                    raw.includes("{") ? raw.indexOf("{") : Infinity
                );
                if (firstMarkerIdx !== Infinity) {
                    displayText = raw.substring(0, firstMarkerIdx).trim();
                }
            }
        }
    }


    const timeStr = message.timestamp
        ? new Date(message.timestamp).toLocaleTimeString(
            language === "hi" ? "hi-IN" : "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        )
        : "";

    const ariaLabel = isUser
        ? `${language === "hi" ? "आपका संदेश" : "Your message"}: ${message.content}`
        : `${modeConfig?.name || "AI"}: ${message.content}`;

    return (
        <motion.div
            className={`chat-bubble ${isUser ? "user" : "assistant"}`}
            data-mode={message.mode || undefined}
            style={
                !isUser && modeConfig
                    ? { borderLeftColor: modeConfig.primaryColor }
                    : undefined
            }
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            role="article"
            aria-label={ariaLabel}
        >
            {/* Mode indicator + timestamp for assistant messages */}
            {!isUser && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                    }}
                >
                    {modeConfig && (
                        <>
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    color: modeConfig.primaryColor,
                                    fontSize: "18px",
                                    background: `${modeConfig.primaryColor}20`,
                                    padding: "4px",
                                    borderRadius: "var(--radius-sm)",
                                }}
                                aria-hidden="true"
                            >
                                smart_toy
                            </span>
                            <span
                                style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: modeConfig.primaryColor,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                JanSathi AI
                            </span>
                        </>
                    )}
                    <span
                        style={{
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: "var(--text-muted)",
                        }}
                    />
                    {timeStr && (
                        <time
                            style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                            dateTime={message.timestamp?.toISOString?.() || ""}
                        >
                            {timeStr}
                        </time>
                    )}
                    {/* RAG indicator badge */}
                    <span
                        style={{
                            marginLeft: "auto",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "var(--radius-full)",
                            background: "#10B98115",
                            color: "#10B981",
                            border: "1px solid #10B98130",
                            letterSpacing: "0.02em",
                        }}
                    >
                        ✦ Grounded
                    </span>
                </div>
            )}

            {/* Message content */}
            {displayText && (
                <p
                    className="whitespace-pre-wrap m-0"
                    style={{ fontSize: "1rem", lineHeight: 1.6 }}
                >
                    {displayText}
                </p>
            )}

            {/* Render Interactive Quiz Component if detected */}
            {parsedQuiz && (
                <QuizCard data={parsedQuiz} primaryColor={modeConfig?.primaryColor} />
            )}

            {/* Footer: user timestamp + assistant speak button */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "10px",
                    gap: "8px",
                }}
            >
                {/* User message timestamp */}
                {isUser && timeStr && (
                    <time
                        style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                        dateTime={message.timestamp?.toISOString?.() || ""}
                    >
                        {timeStr}
                    </time>
                )}

                {/* Play Audio button for assistant messages */}
                {!isUser && onSpeak && (
                    <button
                        onClick={() =>
                            isSpeaking ? onStopSpeaking?.() : onSpeak(cleanTextForTTS(message.content))
                        }
                        className="play-audio-btn"
                        style={{
                            color: isSpeaking
                                ? modeConfig?.primaryColor || "var(--info)"
                                : "var(--text-muted)",
                            borderColor: isSpeaking
                                ? `${modeConfig?.primaryColor || "var(--info)"}50`
                                : "rgba(255,255,255,0.1)",
                        }}
                        aria-label={
                            isSpeaking
                                ? language === "hi"
                                    ? "बंद करें"
                                    : "Stop"
                                : language === "hi"
                                    ? "सुनें"
                                    : "Listen"
                        }
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                            {isSpeaking ? "volume_off" : "volume_up"}
                        </span>
                        <span>
                            {isSpeaking
                                ? language === "hi"
                                    ? "बंद करें"
                                    : "Stop"
                                : language === "hi"
                                    ? "🔊 सुनें"
                                    : "🔊 Play Audio"}
                        </span>
                    </button>
                )}
            </div>
        </motion.div>
    );
}
