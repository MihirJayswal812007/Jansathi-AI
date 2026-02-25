// ===== JanSathi AI — Module Panel =====
// Dynamically renders module-specific widgets based on the active mode.
// Only renders STANDALONE widgets here. Data-bound components (SchemeCard,
// CropDiagnosis, MandiPrices, ProductShowcase) are rendered inside ChatBubble
// when the AI returns structured response data.

"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ModeName } from "@/types/modules";

// JanShiksha (Education) — standalone widgets
import ConceptExplainer from "@/components/modules/JanShiksha/ConceptExplainer";
import QuizBot from "@/components/modules/JanShiksha/QuizBot";

// JanKrishi (Agriculture) — standalone widget
import WeatherWidget from "@/components/modules/JanKrishi/WeatherWidget";

// JanKaushal (Career) — standalone widgets
import ResumeMaker from "@/components/modules/JanKaushal/ResumeMaker";
import CareerCompass from "@/components/modules/JanKaushal/CareerCompass";
import InterviewCoach from "@/components/modules/JanKaushal/InterviewCoach";

interface ModulePanelProps {
    mode: ModeName | null;
    onAskQuestion: (question: string) => void;
    language: "hi" | "en";
}

export default function ModulePanel({ mode, onAskQuestion, language }: ModulePanelProps) {
    if (!mode) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="module-panel"
                style={{
                    maxHeight: "320px",
                    overflowY: "auto",
                    borderTop: "1px solid var(--border-primary)",
                    background: "var(--bg-primary)",
                }}
            >
                {/* JanSeva — data-bound components only, nothing standalone to show here
                    SchemeCard, DocumentChecklist, GrievanceForm all need server data.
                    Quick Actions already provides the entry points for this module. */}
                {mode === "janseva" && (
                    <div style={{ padding: "16px", textAlign: "center" }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                            {language === "hi"
                                ? "🏛️ ऊपर दिए गए Quick Actions से शुरू करें, या अपना सवाल पूछें!"
                                : "🏛️ Use Quick Actions above, or ask your question!"}
                        </p>
                    </div>
                )}

                {mode === "janshiksha" && (
                    <div>
                        <ConceptExplainer onAskQuestion={onAskQuestion} />
                        <QuizBot />
                    </div>
                )}

                {mode === "jankrishi" && (
                    <div>
                        <WeatherWidget onAskQuestion={onAskQuestion} />
                    </div>
                )}

                {/* JanVyapar — ProductShowcase needs server data (product object).
                    Quick Actions already provides entry points. */}
                {mode === "janvyapar" && (
                    <div style={{ padding: "16px", textAlign: "center" }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                            {language === "hi"
                                ? "💹 ऊपर दिए गए Quick Actions से शुरू करें, या अपना सवाल पूछें!"
                                : "💹 Use Quick Actions above, or ask your question!"}
                        </p>
                    </div>
                )}

                {mode === "jankaushal" && (
                    <div>
                        <ResumeMaker onAskQuestion={onAskQuestion} />
                        <CareerCompass onAskQuestion={onAskQuestion} />
                        <InterviewCoach onAskQuestion={onAskQuestion} />
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
