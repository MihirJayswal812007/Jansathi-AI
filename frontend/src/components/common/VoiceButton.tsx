// ===== JanSathi AI — Voice Power Orb Button =====
// Premium mic button with animated orb ring effect.
// Matches 21st.dev "Voice Powered Orb" aesthetic:
//   - Dark sphere center with mic icon
//   - Glowing purple/blue ring around edge (animated)
//   - Pulse waves when listening
//   - Ring rotates and breathes

"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

    const isActive = isListening || isProcessing;

    return (
        <div className="flex flex-col items-center gap-3">
            {/* ── Orb Container ────────────────────────────────────── */}
            <div className="voice-orb-container">
                {/* Outer rotating ring */}
                <div className={`voice-orb-ring ${isActive ? "active" : ""}`} />

                {/* Secondary counter-rotating ring */}
                <div className={`voice-orb-ring voice-orb-ring-2 ${isActive ? "active" : ""}`} />

                {/* Ambient glow (expands when listening) */}
                <div className={`voice-orb-glow ${isActive ? "active" : ""}`} />

                {/* Pulse waves (only when listening) */}
                <AnimatePresence>
                    {isListening && (
                        <>
                            <motion.div
                                className="voice-orb-pulse"
                                initial={{ scale: 1, opacity: 0.4 }}
                                animate={{ scale: 2.2, opacity: 0 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                            />
                            <motion.div
                                className="voice-orb-pulse"
                                initial={{ scale: 1, opacity: 0.3 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                            />
                        </>
                    )}
                </AnimatePresence>

                {/* Dark sphere (the button itself) */}
                <motion.button
                    onClick={onToggle}
                    disabled={disabled || isProcessing}
                    className={`voice-orb-sphere ${isActive ? "active" : ""}`}
                    style={
                        isActive && accentColor
                            ? { "--orb-accent": accentColor } as React.CSSProperties
                            : undefined
                    }
                    whileTap={{ scale: 0.92 }}
                    aria-label={isListening ? "Stop listening" : "Start speaking"}
                    aria-pressed={isListening}
                    role="switch"
                >
                    {isProcessing ? (
                        <Loader2 size={36} className="animate-spin" style={{ color: "rgba(255,255,255,0.8)" }} />
                    ) : isListening ? (
                        <div className="voice-waveform">
                            <span className="bar" />
                            <span className="bar" />
                            <span className="bar" />
                            <span className="bar" />
                            <span className="bar" />
                        </div>
                    ) : (
                        <Mic size={36} style={{ color: "rgba(255,255,255,0.85)" }} />
                    )}
                </motion.button>
            </div>

            <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}
                aria-live="polite">
                {statusText}
            </p>

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
