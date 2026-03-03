// ===== JanSathi AI — Module Guide (Voice-First Stitch Redesign) =====
// Per-module landing page with:
// 1. Module icon + title + description
// 2. Voice mic hero (handled by parent ChatView)
// 3. Suggested question cards
// 4. Capability chips

"use client";

import { motion } from "framer-motion";
import { ModeConfig, ModeName } from "@/types/modules";

// Material icons for each suggested question per module
const MODULE_QUESTION_ICONS: Record<ModeName, string[]> = {
    janseva: ["verified", "description", "report", "track_changes"],
    janshiksha: ["eco", "quiz", "calculate"],
    jankrishi: ["local_florist", "store", "cloud"],
    janvyapar: ["sell", "price_check", "inventory"],
    jankaushal: ["work", "person_search", "record_voice_over"],
};

// Capability labels per module
const MODULE_CAPABILITIES: Record<ModeName, { en: string[]; hi: string[] }> = {
    janseva: {
        en: ["Scheme eligibility", "Document help", "Complaint filing", "Application tracking"],
        hi: ["योजना पात्रता", "दस्तावेज़ सहायता", "शिकायत दर्ज", "आवेदन ट्रैकिंग"],
    },
    janshiksha: {
        en: ["Concept explanations", "Practice quizzes", "Homework help", "Exam preparation"],
        hi: ["अवधारणा समझाएं", "अभ्यास प्रश्नोत्तरी", "होमवर्क मदद", "परीक्षा तैयारी"],
    },
    jankrishi: {
        en: ["Crop disease diagnosis", "Real-time mandi prices", "Weather forecasts", "Soil health tips"],
        hi: ["फसल रोग निदान", "मंडी भाव", "मौसम पूर्वानुमान", "मिट्टी स्वास्थ्य"],
    },
    janvyapar: {
        en: ["Product listing", "Smart pricing", "Digital catalog", "Market insights"],
        hi: ["उत्पाद सूची", "स्मार्ट मूल्य", "डिजिटल कैटलॉग", "बाज़ार जानकारी"],
    },
    jankaushal: {
        en: ["Resume builder", "Job search", "Mock interviews", "Skill assessment"],
        hi: ["रिज्यूमे बिल्डर", "नौकरी खोज", "मॉक इंटरव्यू", "कौशल मूल्यांकन"],
    },
};

// Voice CTA per module
const MODULE_MIC_CTA: Record<ModeName, { en: string; hi: string }> = {
    janseva: { en: "Tap to speak about government schemes", hi: "सरकारी योजनाओं के बारे में बोलें" },
    janshiksha: { en: "Ask me anything about studies", hi: "पढ़ाई के बारे में कुछ भी पूछें" },
    jankrishi: { en: "Ask about crops, weather, prices", hi: "फसल, मौसम, भाव के बारे में पूछें" },
    janvyapar: { en: "Ask about selling, pricing, catalogs", hi: "बिक्री, मूल्य, कैटलॉग के बारे में पूछें" },
    jankaushal: { en: "Ask about jobs, skills, career", hi: "नौकरी, कौशल, करियर के बारे में पूछें" },
};

interface ModuleGuideProps {
    config: ModeConfig;
    language: "en" | "hi";
    onSelectAction: (query: string) => void;
    micElement?: React.ReactNode;
}

export default function ModuleGuide({ config, language, onSelectAction, micElement }: ModuleGuideProps) {
    const isHi = language === "hi";
    const modeId = config.id as ModeName;
    const questionIcons = MODULE_QUESTION_ICONS[modeId] || [];
    const capabilities = MODULE_CAPABILITIES[modeId];
    const micCta = MODULE_MIC_CTA[modeId];

    return (
        <motion.div
            className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 gap-6"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
                "--module-color": config.primaryColor,
            } as React.CSSProperties}
        >
            {/* Module Header — Icon + Title + Description */}
            <div className="module-guide-header">
                <div className="module-guide-icon-wrap">
                    <div
                        className="module-guide-icon-glow"
                        style={{ background: config.gradient }}
                    />
                    <div
                        className="module-guide-icon-box glass-card"
                        style={{
                            boxShadow: `0 0 40px -10px ${config.primaryColor}80`,
                        }}
                    >
                        <span className="text-4xl" style={{ filter: `drop-shadow(0 0 15px ${config.primaryColor}80)` }}>
                            {config.icon}
                        </span>
                    </div>
                </div>
                <h2 className="module-guide-title">
                    {isHi ? config.nameHi : config.name}:{" "}
                    <span
                        className="module-guide-tagline"
                        style={{ backgroundImage: config.gradient }}
                    >
                        {isHi ? config.taglineHi : config.tagline}
                    </span>
                </h2>
                <p className="module-guide-desc">
                    {isHi ? config.descriptionHi : config.description}
                </p>
            </div>

            {/* Mic CTA text */}
            <p className="mic-hero-cta" style={{ color: "#fff" }}>
                {isHi ? micCta.hi : micCta.en}
            </p>

            {/* Voice Mic — rendered between text and cards */}
            {micElement && (
                <div className="flex flex-col items-center">
                    {micElement}
                </div>
            )}

            {/* Suggested Questions */}
            <div className="suggested-questions">
                {config.quickActions.map((action, idx) => (
                    <motion.button
                        key={idx}
                        className="suggested-q-card"
                        onClick={() => onSelectAction(action.query)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div
                            className="suggested-q-icon"
                            style={{ background: `${config.primaryColor}20` }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "18px", color: config.primaryColor }}
                            >
                                {questionIcons[idx] || "arrow_forward"}
                            </span>
                        </div>
                        <span className="suggested-q-text">
                            {isHi ? action.labelHi : action.label}
                        </span>
                    </motion.button>
                ))}
            </div>

            {/* Capability Chips */}
            {capabilities && (
                <div className="capability-chips">
                    {(isHi ? capabilities.hi : capabilities.en).map((cap, idx) => (
                        <span key={idx} className="capability-chip">
                            {cap}
                        </span>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

// Export the mic CTA map for use by ChatView
export { MODULE_MIC_CTA };
