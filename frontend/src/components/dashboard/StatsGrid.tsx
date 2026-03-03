// ===== JanSathi AI — Dashboard Stats Grid =====
// 2×2 grid of glassmorphic stat cards with Framer Motion stagger.

"use client";

import { motion } from "framer-motion";
import { Users, MessageSquare, Zap, ThumbsUp } from "lucide-react";
import type { DashboardData } from "@/lib/apiClient";

interface StatsGridProps {
    data: DashboardData;
}

const STATS = [
    {
        key: "users",
        icon: Users,
        color: "#3B82F6",
        label: "Total Users",
        getValue: (d: DashboardData) => d.totalUsers.toLocaleString(),
        getSub: (d: DashboardData) => `${d.activeUsersToday} active today`,
    },
    {
        key: "conversations",
        icon: MessageSquare,
        color: "#10B981",
        label: "Conversations",
        getValue: (d: DashboardData) => d.totalConversations.toLocaleString(),
        getSub: (d: DashboardData) => `${d.resolvedRate}% resolved`,
    },
    {
        key: "response",
        icon: Zap,
        color: "#F59E0B",
        label: "Avg Response",
        getValue: (d: DashboardData) => `${(d.avgResponseTimeMs / 1000).toFixed(1)}s`,
        getSub: () => "voice-to-answer",
    },
    {
        key: "satisfaction",
        icon: ThumbsUp,
        color: "#8B5CF6",
        label: "Satisfaction",
        getValue: (d: DashboardData) => `${d.satisfactionAvg}/5`,
        getSub: () => "user rating",
    },
];

export default function StatsGrid({ data }: StatsGridProps) {
    return (
        <div className="dashboard-stats-grid">
            {STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <motion.div
                        key={stat.key}
                        className="stat-card"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                    >
                        <div className="stat-card-header">
                            <div
                                className="stat-card-icon-wrap"
                                style={{ background: `${stat.color}15`, color: stat.color }}
                            >
                                <Icon size={20} />
                            </div>
                            <span className="stat-card-label">{stat.label}</span>
                        </div>
                        <p className="stat-card-value">{stat.getValue(data)}</p>
                        <p className="stat-card-sub">{stat.getSub(data)}</p>
                    </motion.div>
                );
            })}
        </div>
    );
}
