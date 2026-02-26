// ===== JanSathi AI — Feedback Bar Component =====
// Thumbs up/down after AI responses. One-shot — hides after selection.

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { submitFeedback } from "@/lib/apiClient";

interface FeedbackBarProps {
    conversationId: string;
}

export default function FeedbackBar({ conversationId }: FeedbackBarProps) {
    const [state, setState] = useState<"idle" | "submitting" | "done">("idle");

    const handleFeedback = useCallback(
        async (satisfaction: number) => {
            if (state !== "idle") return;
            setState("submitting");
            try {
                await submitFeedback(conversationId, satisfaction);
            } catch {
                // Swallow — feedback is non-critical
            }
            setState("done");
        },
        [conversationId, state]
    );

    if (state === "done") {
        return (
            <motion.div
                className="flex items-center gap-1 py-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <Check size={12} style={{ color: "#10B981" }} />
                <span className="text-xs" style={{ color: "#10B981" }}>
                    Thanks!
                </span>
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            {state === "idle" && (
                <motion.div
                    className="flex items-center gap-2 py-1"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Helpful?
                    </span>
                    <button
                        onClick={() => handleFeedback(5)}
                        className="p-1 rounded-md hover:bg-white/5 transition-colors"
                        title="Helpful"
                        aria-label="Mark as helpful"
                        disabled={state !== "idle"}
                    >
                        <ThumbsUp size={14} style={{ color: "var(--text-muted)" }} />
                    </button>
                    <button
                        onClick={() => handleFeedback(1)}
                        className="p-1 rounded-md hover:bg-white/5 transition-colors"
                        title="Not helpful"
                        aria-label="Mark as not helpful"
                        disabled={state !== "idle"}
                    >
                        <ThumbsDown size={14} style={{ color: "var(--text-muted)" }} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
