// ===== JanSathi AI — CommPulse Dashboard (v2) =====
// Modular dashboard using useDashboard hook and sub-components.
// Now lives under the (app) route group for shared sidebar.

"use client";

import { motion } from "framer-motion";
import { RefreshCw, BarChart3 } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ModuleUsageChart from "@/components/dashboard/ModuleUsageChart";
import ActivityChart from "@/components/dashboard/ActivityChart";
import LanguageSplit from "@/components/dashboard/LanguageSplit";

export default function DashboardPage() {
    const { stats, isLoading, error, refetch } = useDashboard(7);

    return (
        <div className="dashboard-v2">
            {/* Header */}
            <header className="dashboard-v2-header">
                <div className="dashboard-v2-title-area">
                    <BarChart3 size={22} style={{ color: "#818CF8" }} />
                    <div>
                        <h1 className="dashboard-v2-title">CommPulse</h1>
                        <p className="dashboard-v2-subtitle">
                            सामुदायिक प्रभाव विश्लेषण
                        </p>
                    </div>
                </div>
                <button
                    onClick={refetch}
                    disabled={isLoading}
                    className="dashboard-v2-refresh"
                    aria-label="Refresh data"
                >
                    <RefreshCw
                        size={16}
                        className={isLoading ? "animate-spin" : ""}
                    />
                </button>
            </header>

            {/* Content */}
            {isLoading && !stats ? (
                <div className="dashboard-v2-loading">
                    <RefreshCw size={32} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                    <p style={{ color: "var(--text-muted)" }}>Loading analytics...</p>
                </div>
            ) : error ? (
                <div className="dashboard-v2-error">
                    <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--error)" }}>
                        error_outline
                    </span>
                    <p style={{ color: "var(--text-muted)" }}>{error}</p>
                    <button onClick={refetch} className="dashboard-v2-retry-btn">
                        Try Again
                    </button>
                </div>
            ) : stats ? (
                <motion.div
                    className="dashboard-v2-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <StatsGrid data={stats} />
                    <ModuleUsageChart moduleUsage={stats.moduleUsage} />
                    <ActivityChart dailyActiveUsers={stats.dailyActiveUsers} />
                    <LanguageSplit languageSplit={stats.languageSplit} />

                    {/* Footer */}
                    <p className="dashboard-v2-footer">
                        CommPulse — सामुदायिक प्रभाव मापक · Powered by JanSathi AI
                    </p>
                </motion.div>
            ) : null}
        </div>
    );
}
