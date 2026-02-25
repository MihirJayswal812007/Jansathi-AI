// ===== JanSathi AI — Voice Button Component =====
// Enhanced with waveform animation, bilingual status, and pulse ring

"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceButtonProps {
    isListening: boolean;
    isProcessing: boolean;
    onToggle: () => void;
    disabled?: boolean;
    accentColor?: string;
    language?: "hi" | "en";
    interimTranscript?: string;
}

export default function VoiceButton({
    isListening,
    isProcessing,
    onToggle,
    disabled = false,
    accentColor,
    language = "hi",
    interimTranscript,
}: VoiceButtonProps) {
    const statusText = isProcessing
        ? language === "hi" ? "सुन रहा है..." : "Processing..."
        : isListening
            ? language === "hi" ? "बोलिए... रुकने के लिए टैप करें" : "Listening... Tap to stop"
            : language === "hi" ? "बोलने के लिए टैप करें" : "Tap to speak";

    return (
        <div className="flex flex-col items-center gap-3">
            <motion.button
                onClick={onToggle}
                disabled={disabled || isProcessing}
                className={`voice-btn ${isListening ? "listening" : ""}`}
                style={
                    isListening && accentColor
                        ? {
                            background: accentColor,
                            color: "white",
                            boxShadow: `0 0 0 0 ${accentColor}50`,
                        }
                        : undefined
                }
                whileTap={{ scale: 0.9 }}
                aria-label={isListening ? "Stop listening" : "Start speaking"}
                aria-pressed={isListening}
                role="switch"
            >
                {isProcessing ? (
                    <Loader2 size={32} className="animate-spin" />
                ) : isListening ? (
                    /* Waveform animation when listening */
                    <div className="voice-waveform" style={{ color: "white" }}>
                        <span className="bar" />
                        <span className="bar" />
                        <span className="bar" />
                        <span className="bar" />
                        <span className="bar" />
                    </div>
                ) : (
                    <Mic size={32} />
                )}
            </motion.button>

            <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}
                aria-live="polite">
                {statusText}
            </p>

            {/* Interim transcript preview */}
            {isListening && interimTranscript && (
                <motion.p
                    className="interim-transcript text-center max-w-xs"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    aria-live="polite"
                >
                    &ldquo;{interimTranscript}&rdquo;
                </motion.p>
            )}
        </div>
    );
}
