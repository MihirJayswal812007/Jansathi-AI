// ===== JanSathi AI — Chat Input Bar =====
// Text input + Send button + Voice toggle.
// Fixed to bottom of chat view.

"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useModeStore } from "@/store/modeStore";

interface ChatInputProps {
    onSend: (message: string) => void;
    onVoiceToggle: () => void;
    isListening: boolean;
    isProcessing: boolean;
    disabled?: boolean;
    accentColor?: string;
}

export default function ChatInput({
    onSend,
    onVoiceToggle,
    isListening,
    isProcessing,
    disabled = false,
    accentColor,
}: ChatInputProps) {
    const [text, setText] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { language } = useModeStore();

    const placeholder =
        language === "hi"
            ? "अपना सवाल लिखें..."
            : "Type your question...";

    const handleSubmit = useCallback(() => {
        const trimmed = text.trim();
        if (!trimmed || disabled || isProcessing) return;
        onSend(trimmed);
        setText("");
        // Reset textarea height
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
        }
    }, [text, disabled, isProcessing, onSend]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        // Auto-resize textarea
        const el = e.target;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 120) + "px";
    };

    return (
        <div className="chat-input-bar">
            {/* Voice button (compact) */}
            <motion.button
                className={`chat-input-voice${isListening ? " listening" : ""}`}
                onClick={onVoiceToggle}
                disabled={isProcessing}
                whileTap={{ scale: 0.9 }}
                style={isListening && accentColor ? { borderColor: accentColor, color: accentColor } : undefined}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                    {isListening ? "mic" : "mic_none"}
                </span>
            </motion.button>

            {/* Text input */}
            <textarea
                ref={inputRef}
                className="chat-input-textarea"
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={1}
                disabled={disabled || isProcessing}
                aria-label={language === "hi" ? "संदेश लिखें" : "Type a message"}
            />

            {/* Send button */}
            <motion.button
                className="chat-input-send"
                onClick={handleSubmit}
                disabled={!text.trim() || disabled || isProcessing}
                whileTap={{ scale: 0.9 }}
                style={
                    text.trim() && accentColor
                        ? { background: accentColor }
                        : undefined
                }
                aria-label={language === "hi" ? "भेजें" : "Send"}
            >
                <Send size={18} />
            </motion.button>
        </div>
    );
}
