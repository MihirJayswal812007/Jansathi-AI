// ===== JanSathi AI — Module Usage Chart =====
// Horizontal bar chart showing module usage breakdown.

"use client";

import { motion } from "framer-motion";
import { MODE_CONFIGS } from "@/lib/constants";

interface ModuleUsageChartProps {
    moduleUsage: Record<string, number>;
}

const MODULE_ICONS: Record<string, string> = {
    janseva: "🏛️",
    janshiksha: "🎓",
    jankrishi: "🌾",
    janvyapar: "💼",
    jankaushal: "🛠️",
};

export default function ModuleUsageChart({ moduleUsage }: ModuleUsageChartProps) {
    const entries = Object.entries(moduleUsage).sort(([, a], [, b]) => b - a);
    const maxCount = entries.length > 0 ? entries[0][1] : 1;

    return (
        <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
        >
            <h3 className="dashboard-section-title">
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    bar_chart
                </span>
                Module Usage
            </h3>
            <div className="dashboard-module-bars">
                {entries.map(([key, count], i) => {
                    const config = MODE_CONFIGS[key as keyof typeof MODE_CONFIGS];
                    if (!config) return null;
                    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                        <motion.div
                            key={key}
                            className="dashboard-module-row"
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.06 }}
                        >
                            <span className="dashboard-module-icon">
                                {MODULE_ICONS[key] || "📦"}
                            </span>
                            <div className="dashboard-module-info">
                                <div className="dashboard-module-label-row">
                                    <span className="dashboard-module-name">{config.name}</span>
                                    <span className="dashboard-module-count">{count}</span>
                                </div>
                                <div className="dashboard-bar-track">
                                    <motion.div
                                        className="dashboard-bar-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ delay: 0.5 + i * 0.06, duration: 0.6 }}
                                        style={{ background: config.primaryColor }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
