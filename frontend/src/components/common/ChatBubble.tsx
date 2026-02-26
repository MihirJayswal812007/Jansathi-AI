// ===== JanSathi AI — Chat Bubble V2 (Stitch Design) =====
// Glassmorphic AI messages with module-accent left border
// User messages with dark card style · Material Symbols play audio button

"use client";

import { motion } from "framer-motion";
import { ChatMessage } from "@/types/modules";
import { MODE_CONFIGS } from "@/lib/constants";
import { cleanTextForTTS } from "@/lib/cleanTextForTTS";

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
                </div>
            )}

            {/* Message content */}
            <p
                className="whitespace-pre-wrap m-0"
                style={{ fontSize: "1rem", lineHeight: 1.6 }}
            >
                {message.content}
            </p>

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
