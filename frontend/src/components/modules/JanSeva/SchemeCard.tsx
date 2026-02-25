// ===== JanSeva Module — Scheme Card Component =====
// Displays a government scheme with eligibility, benefits, and action button

"use client";

import { motion } from "framer-motion";
import { CheckCircle, FileText, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export interface SchemeInfo {
    id: string;
    name: string;
    nameHi: string;
    category: string;
    description: string;
    descriptionHi: string;
    benefits: string;
    documents: string[];
    applicationProcess: string[];
    website: string;
    eligibility?: Record<string, unknown>;
}

interface SchemeCardProps {
    scheme: SchemeInfo;
    language: "hi" | "en";
    isEligible?: boolean;
    onApply?: (scheme: SchemeInfo) => void;
    onCheckDocuments?: (scheme: SchemeInfo) => void;
}

export default function SchemeCard({
    scheme,
    language,
    isEligible,
    onApply,
    onCheckDocuments,
}: SchemeCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            className="rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: "var(--bg-surface)",
                border: `1px solid ${isEligible ? "var(--success)" : "var(--border-primary)"}`,
            }}
        >
            {/* Header */}
            <div
                className="p-4 cursor-pointer flex items-start justify-between gap-3"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                                background: "var(--janseva-surface)",
                                color: "var(--janseva-primary)",
                            }}
                        >
                            {scheme.category}
                        </span>
                        {isEligible !== undefined && (
                            <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                                style={{
                                    background: isEligible
                                        ? "rgba(16, 185, 129, 0.15)"
                                        : "rgba(239, 68, 68, 0.15)",
                                    color: isEligible ? "var(--success)" : "var(--error)",
                                }}
                            >
                                <CheckCircle size={10} />
                                {isEligible
                                    ? language === "hi"
                                        ? "पात्र"
                                        : "Eligible"
                                    : language === "hi"
                                        ? "अपात्र"
                                        : "Not Eligible"}
                            </span>
                        )}
                    </div>
                    <h3
                        className="font-bold text-base"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {language === "hi" ? scheme.nameHi : scheme.name}
                    </h3>
                    <p
                        className="text-sm mt-1"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {language === "hi" ? scheme.descriptionHi : scheme.description}
                    </p>
                    <p
                        className="text-sm font-semibold mt-2"
                        style={{ color: "var(--janseva-primary)" }}
                    >
                        💰 {scheme.benefits}
                    </p>
                </div>
                <button
                    className="p-1 rounded-full"
                    style={{ color: "var(--text-muted)" }}
                >
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-4 pb-4"
                    style={{ borderTop: "1px solid var(--border-primary)" }}
                >
                    {/* Documents Required */}
                    <div className="mt-3">
                        <h4
                            className="text-xs font-semibold uppercase tracking-wide mb-2"
                            style={{ color: "var(--text-muted)" }}
                        >
                            📋{" "}
                            {language === "hi" ? "ज़रूरी दस्तावेज़" : "Required Documents"}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {scheme.documents.map((doc) => (
                                <span
                                    key={doc}
                                    className="text-xs px-2 py-1 rounded-lg"
                                    style={{
                                        background: "var(--bg-elevated)",
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    {doc}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Application Process */}
                    <div className="mt-3">
                        <h4
                            className="text-xs font-semibold uppercase tracking-wide mb-2"
                            style={{ color: "var(--text-muted)" }}
                        >
                            📝{" "}
                            {language === "hi" ? "आवेदन प्रक्रिया" : "Application Process"}
                        </h4>
                        <ol className="text-sm space-y-1">
                            {scheme.applicationProcess.map((step, i) => (
                                <li
                                    key={i}
                                    className="flex gap-2"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    <span
                                        className="font-bold min-w-[20px]"
                                        style={{ color: "var(--janseva-primary)" }}
                                    >
                                        {i + 1}.
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4">
                        {onCheckDocuments && (
                            <button
                                onClick={() => onCheckDocuments(scheme)}
                                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium"
                                style={{
                                    background: "var(--janseva-surface)",
                                    color: "var(--janseva-primary)",
                                }}
                            >
                                <FileText size={14} />
                                {language === "hi" ? "दस्तावेज़ जांचें" : "Check Documents"}
                            </button>
                        )}
                        {scheme.website && (
                            <a
                                href={scheme.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium"
                                style={{
                                    background: "var(--janseva-primary)",
                                    color: "#fff",
                                }}
                            >
                                <ExternalLink size={14} />
                                {language === "hi" ? "आधिकारिक वेबसाइट" : "Official Website"}
                            </a>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
