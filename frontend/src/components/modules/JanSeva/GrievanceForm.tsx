// ===== JanSeva Module — Grievance Form Component =====
// Simple voice-friendly complaint form for civic issues

"use client";

import { motion } from "framer-motion";
import { Send, AlertTriangle, MapPin } from "lucide-react";
import { useState } from "react";

interface GrievanceFormProps {
    language: "hi" | "en";
    onSubmit?: (data: GrievanceData) => void;
}

export interface GrievanceData {
    category: string;
    description: string;
    location: string;
}

const CATEGORIES = [
    { value: "roads", label: "Roads / सड़कें", icon: "🛣️" },
    { value: "water", label: "Water Supply / पानी", icon: "💧" },
    { value: "electricity", label: "Electricity / बिजली", icon: "⚡" },
    { value: "sanitation", label: "Sanitation / सफाई", icon: "🧹" },
    { value: "ration", label: "Ration Shop / राशन दुकान", icon: "🏪" },
    { value: "other", label: "Other / अन्य", icon: "📝" },
];

export default function GrievanceForm({
    language,
    onSubmit,
}: GrievanceFormProps) {
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!category || !description) return;
        setSubmitted(true);
        onSubmit?.({ category, description, location });
    };

    if (submitted) {
        return (
            <motion.div
                className="rounded-xl p-5 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--success)",
                }}
            >
                <div className="text-4xl mb-3">✅</div>
                <h3
                    className="font-bold text-base mb-1"
                    style={{ color: "var(--text-primary)" }}
                >
                    {language === "hi"
                        ? "शिकायत दर्ज हो गई!"
                        : "Complaint Registered!"}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {language === "hi"
                        ? "आपकी शिकायत संबंधित विभाग को भेज दी गई है। ट्रैकिंग नंबर: GRV-2024-" +
                        Math.floor(1000 + Math.random() * 9000)
                        : "Your complaint has been forwarded to the relevant department. Tracking: GRV-2024-" +
                        Math.floor(1000 + Math.random() * 9000)}
                </p>
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setCategory("");
                        setDescription("");
                        setLocation("");
                    }}
                    className="mt-3 text-xs px-4 py-2 rounded-lg"
                    style={{
                        background: "var(--janseva-surface)",
                        color: "var(--janseva-primary)",
                    }}
                >
                    {language === "hi" ? "नई शिकायत" : "New Complaint"}
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="rounded-xl p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-primary)",
            }}
        >
            <h3
                className="font-bold text-sm flex items-center gap-2 mb-3"
                style={{ color: "var(--text-primary)" }}
            >
                <AlertTriangle size={16} style={{ color: "var(--warning)" }} />
                {language === "hi" ? "शिकायत दर्ज करें" : "File a Complaint"}
            </h3>

            {/* Category selection */}
            <label
                className="text-xs font-medium mb-1.5 block"
                style={{ color: "var(--text-muted)" }}
            >
                {language === "hi" ? "समस्या का प्रकार" : "Issue Type"}
            </label>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className="text-xs p-2 rounded-lg text-center transition-colors"
                        style={{
                            background:
                                category === cat.value
                                    ? "var(--janseva-surface)"
                                    : "var(--bg-elevated)",
                            color:
                                category === cat.value
                                    ? "var(--janseva-primary)"
                                    : "var(--text-secondary)",
                            border:
                                category === cat.value
                                    ? "1px solid var(--janseva-primary)"
                                    : "1px solid transparent",
                        }}
                    >
                        <span className="text-lg block">{cat.icon}</span>
                        <span className="mt-0.5 block leading-tight">{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Description */}
            <label
                className="text-xs font-medium mb-1.5 block"
                style={{ color: "var(--text-muted)" }}
            >
                {language === "hi" ? "समस्या का विवरण" : "Describe the Issue"}
            </label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                    language === "hi"
                        ? "अपनी समस्या के बारे में बताएं..."
                        : "Describe your issue..."
                }
                className="w-full text-sm p-3 rounded-lg mb-3 resize-none"
                rows={3}
                style={{
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-primary)",
                    outline: "none",
                }}
            />

            {/* Location */}
            <label
                className="text-xs font-medium mb-1.5 flex items-center gap-1"
                style={{ color: "var(--text-muted)" }}
            >
                <MapPin size={12} />
                {language === "hi" ? "स्थान (वैकल्पिक)" : "Location (optional)"}
            </label>
            <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={
                    language === "hi"
                        ? "गांव / मोहल्ला / वार्ड नंबर"
                        : "Village / Area / Ward Number"
                }
                className="w-full text-sm p-3 rounded-lg mb-4"
                style={{
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-primary)",
                    outline: "none",
                }}
            />

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={!category || !description}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-opacity"
                style={{
                    background: "var(--janseva-primary)",
                    color: "#fff",
                    opacity: !category || !description ? 0.5 : 1,
                }}
            >
                <Send size={16} />
                {language === "hi" ? "शिकायत भेजें" : "Submit Complaint"}
            </button>
        </motion.div>
    );
}
