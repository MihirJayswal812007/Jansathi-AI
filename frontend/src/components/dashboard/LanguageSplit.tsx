// ===== JanSathi AI — Language Split =====
// Hindi/English split bar with percentage labels.

"use client";

import { motion } from "framer-motion";

interface LanguageSplitProps {
    languageSplit: { hi: number; en: number };
}

export default function LanguageSplit({ languageSplit }: LanguageSplitProps) {
    const total = languageSplit.hi + languageSplit.en || 1;
    const hiPct = Math.round((languageSplit.hi / total) * 100);
    const enPct = Math.round((languageSplit.en / total) * 100);

    return (
        <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
        >
            <h3 className="dashboard-section-title">
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    language
                </span>
                Language Distribution
            </h3>
            <div className="dashboard-lang-bar">
                <motion.div
                    className="dashboard-lang-fill hindi"
                    initial={{ width: 0 }}
                    animate={{ width: `${hiPct}%` }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                />
                <motion.div
                    className="dashboard-lang-fill english"
                    initial={{ width: 0 }}
                    animate={{ width: `${enPct}%` }}
                    transition={{ delay: 0.75, duration: 0.6 }}
                />
            </div>
            <div className="dashboard-lang-labels">
                <span className="dashboard-lang-label hindi">हिंदी {hiPct}%</span>
                <span className="dashboard-lang-label english">English {enPct}%</span>
            </div>
        </motion.div>
    );
}
