// ===== JanSathi AI — Concentric Rings Orb (Talk9 Style) =====
// Used for listening/voice active states. Multiple concentric rings
// with staggered rotation + scale animations.

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface ConcentricRingsOrbProps {
    isListening: boolean;
    isProcessing: boolean;
    onToggle: () => void;
    disabled?: boolean;
    accentColor?: string;
    language?: "hi" | "en";
    interimTranscript?: string;
}

export default function ConcentricRingsOrb({
    isListening,
    isProcessing,
    onToggle,
    disabled = false,
    accentColor = "#818CF8",
    language = "hi",
    interimTranscript,
}: ConcentricRingsOrbProps) {
    const isActive = isListening || isProcessing;

    const statusText = isProcessing
        ? language === "hi" ? "सोच रहा है..." : "Thinking..."
        : isListening
            ? language === "hi" ? "बोलिए..." : "Listening..."
            : language === "hi" ? "बोलने के लिए टैप करें" : "Tap to speak";

    return (
        <div className="concentric-orb-wrapper">
            {/* Ring layers */}
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className={`concentric-ring${isActive ? " active" : ""}`}
                    style={{
                        width: 120 + i * 32,
                        height: 120 + i * 32,
                        borderColor: isActive
                            ? accentColor
                            : "rgba(255,255,255,0.06)",
                        opacity: isActive ? 0.6 - i * 0.12 : 0.15 - i * 0.03,
                    }}
                    animate={
                        isActive
                            ? {
                                rotate: i % 2 === 0 ? 360 : -360,
                                scale: [1, 1.02 + i * 0.01, 1],
                            }
                            : { rotate: 0, scale: 1 }
                    }
                    transition={
                        isActive
                            ? {
                                rotate: {
                                    duration: 6 + i * 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                },
                                scale: {
                                    duration: 2 + i * 0.3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                },
                            }
                            : { duration: 0.4 }
                    }
                />
            ))}

            {/* Core button */}
            <motion.button
                className={`concentric-core${isActive ? " active" : ""}`}
                onClick={onToggle}
                disabled={disabled || isProcessing}
                whileTap={{ scale: 0.9 }}
                style={
                    isActive
                        ? ({ "--ring-accent": accentColor } as React.CSSProperties)
                        : undefined
                }
                aria-label={isListening ? "Stop listening" : "Start speaking"}
                aria-pressed={isListening}
            >
                {isProcessing ? (
                    <Loader2 size={32} className="animate-spin" style={{ color: "rgba(255,255,255,0.8)" }} />
                ) : isListening ? (
                    <div className="concentric-waveform">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <motion.span
                                key={i}
                                className="concentric-bar"
                                animate={{ scaleY: [0.4, 1, 0.4] }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.1,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <Mic size={32} style={{ color: "rgba(255,255,255,0.85)" }} />
                )}
            </motion.button>

            {/* Status text */}
            <p
                className="concentric-status"
                aria-live="polite"
            >
                {statusText}
            </p>

            {/* Interim transcript */}
            <AnimatePresence>
                {isListening && interimTranscript && (
                    <motion.p
                        className="concentric-transcript"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        aria-live="polite"
                    >
                        &ldquo;{interimTranscript}&rdquo;
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
