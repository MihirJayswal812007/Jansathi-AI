// ===== JanKrishi Module — Crop Diagnosis Component =====
// Displays crop disease diagnosis with treatment recommendations

"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Leaf, Shield, Phone } from "lucide-react";

export interface DiagnosisResult {
    cropName: string;
    cropNameHi: string;
    diseaseName: string;
    diseaseNameHi: string;
    urgency: "high" | "medium" | "low";
    symptoms: string[];
    treatment: {
        chemical: string;
        organic: string;
    };
    prevention: string;
}

interface CropDiagnosisProps {
    diagnosis: DiagnosisResult;
    language: "hi" | "en";
}

const urgencyConfig = {
    high: { color: "#EF4444", bg: "rgba(239,68,68,0.12)", label: "Urgent", labelHi: "अत्यावश्यक" },
    medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Moderate", labelHi: "मध्यम" },
    low: { color: "#10B981", bg: "rgba(16,185,129,0.12)", label: "Low Risk", labelHi: "कम खतरा" },
};

export default function CropDiagnosis({
    diagnosis,
    language,
}: CropDiagnosisProps) {
    const urgency = urgencyConfig[diagnosis.urgency];

    return (
        <motion.div
            className="rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: "var(--bg-surface)",
                border: `1px solid ${urgency.color}40`,
            }}
        >
            {/* Urgency banner */}
            <div
                className="px-4 py-2 flex items-center gap-2 text-sm font-bold"
                style={{ background: urgency.bg, color: urgency.color }}
            >
                <AlertTriangle size={16} />
                {language === "hi"
                    ? `⚠️ ${urgency.labelHi} — तुरंत कार्रवाई करें!`
                    : `⚠️ ${urgency.label} — Take action now!`}
            </div>

            <div className="p-4">
                {/* Disease name */}
                <h3 className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>
                    🌾 {language === "hi" ? diagnosis.diseaseNameHi : diagnosis.diseaseName}
                </h3>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                    {language === "hi" ? diagnosis.cropNameHi : diagnosis.cropName}
                </p>

                {/* Symptoms */}
                <div className="mb-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                        {language === "hi" ? "लक्षण" : "Symptoms"}
                    </h4>
                    <ul className="text-sm space-y-1">
                        {diagnosis.symptoms.map((s, i) => (
                            <li key={i} style={{ color: "var(--text-secondary)" }}>
                                • {s}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Treatments */}
                <div className="grid grid-cols-1 gap-2 mb-3">
                    {/* Chemical */}
                    <div className="p-3 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Shield size={14} style={{ color: "var(--jankrishi-primary)" }} />
                            <span className="text-xs font-semibold" style={{ color: "var(--jankrishi-primary)" }}>
                                {language === "hi" ? "💊 रासायनिक उपचार" : "💊 Chemical Treatment"}
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {diagnosis.treatment.chemical}
                        </p>
                    </div>

                    {/* Organic */}
                    <div className="p-3 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Leaf size={14} style={{ color: "#10B981" }} />
                            <span className="text-xs font-semibold" style={{ color: "#10B981" }}>
                                {language === "hi" ? "🌿 जैविक उपचार" : "🌿 Organic Treatment"}
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {diagnosis.treatment.organic}
                        </p>
                    </div>
                </div>

                {/* Prevention */}
                <div className="p-3 rounded-lg mb-3" style={{ background: "rgba(5, 150, 105, 0.08)" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--jankrishi-primary)" }}>
                        🛡️ {language === "hi" ? "रोकथाम" : "Prevention"}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {diagnosis.prevention}
                    </p>
                </div>

                {/* KVK helpline */}
                <div
                    className="flex items-center gap-2 p-2.5 rounded-lg text-xs"
                    style={{ background: "var(--jankrishi-surface)", color: "var(--jankrishi-primary)" }}
                >
                    <Phone size={14} />
                    <span>
                        {language === "hi"
                            ? "📞 कृषि विज्ञान केंद्र हेल्पलाइन: 1551 (किसान कॉल सेंटर)"
                            : "📞 KVK Helpline: 1551 (Kisan Call Center)"}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
