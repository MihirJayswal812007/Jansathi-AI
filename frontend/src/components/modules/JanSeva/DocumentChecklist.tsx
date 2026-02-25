// ===== JanSeva Module — Document Checklist Component =====
// Interactive checklist for tracking required documents for scheme applications

"use client";

import { motion } from "framer-motion";
import { Check, Circle, Info, Camera } from "lucide-react";
import { useState } from "react";

interface DocumentItem {
    name: string;
    nameHi: string;
    description?: string;
    descriptionHi?: string;
    whereToGet: string;
    whereToGetHi: string;
    isOptional?: boolean;
}

interface DocumentChecklistProps {
    schemeName: string;
    schemeNameHi: string;
    documents: DocumentItem[];
    language: "hi" | "en";
    onComplete?: () => void;
}

const DEFAULT_DOCUMENTS: DocumentItem[] = [
    {
        name: "Aadhaar Card",
        nameHi: "आधार कार्ड",
        description: "12-digit unique ID issued by UIDAI",
        descriptionHi: "UIDAI द्वारा जारी 12 अंकों की विशिष्ट पहचान",
        whereToGet: "Nearest Aadhaar Enrollment Center or Post Office",
        whereToGetHi: "निकटतम आधार नामांकन केंद्र या डाकघर",
    },
    {
        name: "Income Certificate",
        nameHi: "आय प्रमाण पत्र",
        description: "Certificate showing annual family income",
        descriptionHi: "वार्षिक पारिवारिक आय दिखाने वाला प्रमाण पत्र",
        whereToGet: "Tehsildar / SDM Office or e-District portal",
        whereToGetHi: "तहसीलदार / एसडीएम कार्यालय या ई-डिस्ट्रिक्ट पोर्टल",
    },
    {
        name: "BPL / Ration Card",
        nameHi: "बीपीएल / राशन कार्ड",
        description: "Below Poverty Line card or food ration card",
        descriptionHi: "गरीबी रेखा से नीचे का कार्ड या खाद्य राशन कार्ड",
        whereToGet: "Food & Civil Supplies Dept or Block Office",
        whereToGetHi: "खाद्य एवं नागरिक आपूर्ति विभाग या ब्लॉक कार्यालय",
    },
    {
        name: "Bank Passbook",
        nameHi: "बैंक पासबुक",
        description: "Passbook with account number and IFSC code",
        descriptionHi: "खाता संख्या और IFSC कोड वाली पासबुक",
        whereToGet: "Your bank branch",
        whereToGetHi: "आपकी बैंक शाखा",
    },
    {
        name: "Passport Photo",
        nameHi: "पासपोर्ट साइज फोटो",
        description: "Recent passport size photographs (2-4 copies)",
        descriptionHi: "हाल की पासपोर्ट साइज फोटो (2-4 प्रतियां)",
        whereToGet: "Any photo studio or CSC center",
        whereToGetHi: "कोई भी फोटो स्टूडियो या CSC सेंटर",
        isOptional: true,
    },
];

export default function DocumentChecklist({
    schemeName,
    schemeNameHi,
    documents = DEFAULT_DOCUMENTS,
    language,
    onComplete,
}: DocumentChecklistProps) {
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
    const [expandedItem, setExpandedItem] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedItems(newChecked);

        // Check if all required documents are checked
        const requiredCount = documents.filter((d) => !d.isOptional).length;
        const checkedRequired = documents.filter(
            (d, i) => !d.isOptional && newChecked.has(i)
        ).length;
        if (checkedRequired === requiredCount && onComplete) {
            onComplete();
        }
    };

    const progress = Math.round(
        (checkedItems.size / documents.length) * 100
    );

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
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3
                        className="font-bold text-sm"
                        style={{ color: "var(--text-primary)" }}
                    >
                        📋{" "}
                        {language === "hi"
                            ? `${schemeNameHi} — दस्तावेज़ चेकलिस्ट`
                            : `${schemeName} — Document Checklist`}
                    </h3>
                    <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {language === "hi"
                            ? `${checkedItems.size}/${documents.length} दस्तावेज़ तैयार`
                            : `${checkedItems.size}/${documents.length} documents ready`}
                    </p>
                </div>
                <div
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                        background:
                            progress === 100
                                ? "rgba(16, 185, 129, 0.15)"
                                : "var(--janseva-surface)",
                        color: progress === 100 ? "var(--success)" : "var(--janseva-primary)",
                    }}
                >
                    {progress}%
                </div>
            </div>

            {/* Progress bar */}
            <div
                className="h-1.5 rounded-full mb-4 overflow-hidden"
                style={{ background: "var(--bg-elevated)" }}
            >
                <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    style={{
                        background:
                            progress === 100 ? "var(--success)" : "var(--janseva-primary)",
                    }}
                />
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
                {documents.map((doc, index) => (
                    <div key={index}>
                        <div
                            className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
                            style={{
                                background: checkedItems.has(index)
                                    ? "rgba(16, 185, 129, 0.08)"
                                    : "transparent",
                            }}
                            onClick={() => toggleItem(index)}
                        >
                            {/* Checkbox */}
                            <div
                                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                                style={{
                                    background: checkedItems.has(index)
                                        ? "var(--success)"
                                        : "var(--bg-elevated)",
                                    border: checkedItems.has(index)
                                        ? "none"
                                        : "2px solid var(--border-primary)",
                                }}
                            >
                                {checkedItems.has(index) ? (
                                    <Check size={14} color="#fff" />
                                ) : (
                                    <Circle size={14} style={{ color: "var(--text-muted)" }} />
                                )}
                            </div>

                            {/* Document name */}
                            <div className="flex-1">
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: checkedItems.has(index)
                                            ? "var(--success)"
                                            : "var(--text-primary)",
                                        textDecoration: checkedItems.has(index)
                                            ? "line-through"
                                            : "none",
                                    }}
                                >
                                    {language === "hi" ? doc.nameHi : doc.name}
                                </span>
                                {doc.isOptional && (
                                    <span
                                        className="text-xs ml-2"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        ({language === "hi" ? "वैकल्पिक" : "optional"})
                                    </span>
                                )}
                            </div>

                            {/* Info button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedItem(expandedItem === index ? null : index);
                                }}
                                className="p-1"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <Info size={16} />
                            </button>
                        </div>

                        {/* Expanded info */}
                        {expandedItem === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                className="ml-9 mt-1 p-2.5 rounded-lg text-xs"
                                style={{
                                    background: "var(--bg-elevated)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                <p>
                                    {language === "hi"
                                        ? doc.descriptionHi || doc.description
                                        : doc.description}
                                </p>
                                <p className="mt-1.5 font-medium" style={{ color: "var(--janseva-primary)" }}>
                                    📍{" "}
                                    {language === "hi"
                                        ? `कहां से मिलेगा: ${doc.whereToGetHi}`
                                        : `Where to get: ${doc.whereToGet}`}
                                </p>
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Scan document hint */}
            <div
                className="flex items-center gap-2 mt-4 p-3 rounded-lg text-xs"
                style={{
                    background: "var(--janseva-surface)",
                    color: "var(--janseva-primary)",
                }}
            >
                <Camera size={16} />
                <span>
                    {language === "hi"
                        ? "💡 दस्तावेज़ों की फोटो लेकर रखें — आवेदन के समय काम आएगी"
                        : "💡 Take photos of your documents — they'll be useful during application"}
                </span>
            </div>
        </motion.div>
    );
}
