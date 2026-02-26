// ===== JanSathi AI — CommPulse Dashboard =====
// Analytics dashboard showing usage stats, module breakdown, and trends

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    MessageSquare,
    Zap,
    ThumbsUp,
    ArrowLeft,
    RefreshCw,
    BarChart3,
    Globe,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import Link from "next/link";
import {
    ensureAdminSession,
    fetchDashboardStats,
    fetchTrends,
    type DashboardData,
    type TrendData,
} from "@/lib/apiClient";

// ── Module config for display ────────────────────────────────
const MODULE_DISPLAY: Record<
    string,
    { name: string; nameHi: string; color: string; icon: string }
> = {
    janseva: { name: "JanSeva", nameHi: "जनसेवा", color: "#2563EB", icon: "🏛️" },
    janshiksha: { name: "JanShiksha", nameHi: "जनशिक्षा", color: "#7C3AED", icon: "🎓" },
    jankrishi: { name: "JanKrishi", nameHi: "जनकृषि", color: "#059669", icon: "🌾" },
    janvyapar: { name: "JanVyapar", nameHi: "जनव्यापार", color: "#D97706", icon: "💹" },
    jankaushal: { name: "JanKaushal", nameHi: "जनकौशल", color: "#DC2626", icon: "🚀" },
};

// ── Stat Card Component ──────────────────────────────────────
function StatCard({
    icon,
    label,
    value,
    subtitle,
    color,
    delay,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtitle?: string;
    color: string;
    delay: number;
}) {
    return (
        <motion.div
            className="p-4 rounded-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-primary)",
            }}
        >
            <div className="flex items-center gap-2 mb-2">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}20`, color }}
                >
                    {icon}
                </div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {label}
                </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {value}
            </p>
            {subtitle && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {subtitle}
                </p>
            )}
        </motion.div>
    );
}

// ── Module Bar Component ─────────────────────────────────────
function ModuleBar({
    name,
    icon,
    color,
    count,
    maxCount,
    delay,
}: {
    name: string;
    icon: string;
    color: string;
    count: number;
    maxCount: number;
    delay: number;
}) {
    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return (
        <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
        >
            <span className="text-lg w-8">{icon}</span>
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {name}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {count}
                    </span>
                </div>
                <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-elevated)" }}
                >
                    <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: delay + 0.2, duration: 0.6 }}
                        style={{ background: color }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

// ── Mini Chart (DAU) ─────────────────────────────────────────
function DailyChart({
    data,
}: {
    data: { date: string; count: number }[];
}) {
    const maxCount = Math.max(...data.map((d) => d.count), 1);
    return (
        <div className="flex items-end gap-1.5 h-24">
            {data.map((day, i) => {
                const height = (day.count / maxCount) * 100;
                const dateLabel = new Date(day.date).toLocaleDateString("en", {
                    weekday: "short",
                });
                return (
                    <motion.div
                        key={day.date}
                        className="flex-1 flex flex-col items-center gap-1"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        style={{ transformOrigin: "bottom" }}
                    >
                        <span
                            className="text-xs font-medium"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {day.count}
                        </span>
                        <div
                            className="w-full rounded-t-md"
                            style={{
                                height: `${Math.max(height, 8)}%`,
                                background:
                                    i === data.length - 1
                                        ? "var(--janseva-primary)"
                                        : "var(--bg-elevated)",
                                minHeight: "4px",
                            }}
                        />
                        <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)", fontSize: "10px" }}
                        >
                            {dateLabel}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ── Trend Card Component ─────────────────────────────────────
function TrendCard({
    label,
    value,
    suffix,
    isPositiveGood = true,
    delay,
}: {
    label: string;
    value: number;
    suffix: string;
    isPositiveGood?: boolean;
    delay: number;
}) {
    const isPositive = value > 0;
    const isGood = isPositiveGood ? isPositive : !isPositive;
    const color = value === 0 ? "var(--text-muted)" : isGood ? "#10B981" : "#EF4444";
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
        <motion.div
            className="p-3 rounded-xl text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-primary)",
            }}
        >
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                {label}
            </p>
            <div className="flex items-center justify-center gap-1">
                {value !== 0 && <Icon size={14} style={{ color }} />}
                <span className="text-lg font-bold" style={{ color }}>
                    {value > 0 ? "+" : ""}
                    {value}
                    {suffix}
                </span>
            </div>
        </motion.div>
    );
}

// ── Main Dashboard Page ──────────────────────────────────────
export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [trends, setTrends] = useState<TrendData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const isAdmin = await ensureAdminSession();
            if (!isAdmin) {
                setError("Admin authentication failed. Check NEXT_PUBLIC_ADMIN_SECRET.");
                setLoading(false);
                return;
            }

            const [statsData, trendsData] = await Promise.all([
                fetchDashboardStats(),
                fetchTrends(7).catch(() => null), // Trends are optional — don't block dashboard
            ]);

            setData(statsData);
            setTrends(trendsData);
        } catch (err) {
            console.error("Failed to fetch dashboard:", err);
            setError("Network error — is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const moduleEntries = data
        ? Object.entries(data.moduleUsage).sort(([, a], [, b]) => b - a)
        : [];
    const maxModuleCount = moduleEntries.length > 0 ? moduleEntries[0][1] : 1;
    const totalHi = data ? data.languageSplit.hi : 1;
    const totalEn = data ? data.languageSplit.en : 0;
    const totalLang = totalHi + totalEn;

    return (
        <div
            className="min-h-dvh"
            style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
        >
            {/* Header */}
            <header
                className="flex items-center justify-between px-4 py-3 sticky top-0 z-50"
                style={{
                    background: "rgba(15, 23, 42, 0.9)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid var(--border-primary)",
                }}
            >
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-1" title="Home">
                        <ArrowLeft size={20} style={{ color: "var(--text-secondary)" }} />
                    </Link>
                    <div>
                        <h1
                            className="text-lg font-bold flex items-center gap-2"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            <BarChart3 size={20} style={{ color: "#3B82F6" }} />
                            CommPulse Dashboard
                        </h1>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            सामुदायिक प्रभाव विश्लेषण
                        </p>
                    </div>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="p-2 rounded-lg"
                    style={{ background: "var(--bg-surface)" }}
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                        style={{ color: "var(--text-secondary)" }}
                    />
                </button>
            </header>

            {loading && !data ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <RefreshCw
                            size={32}
                            className="animate-spin mx-auto mb-3"
                            style={{ color: "var(--text-muted)" }}
                        />
                        <p style={{ color: "var(--text-muted)" }}>Loading analytics...</p>
                    </div>
                </div>
            ) : data ? (
                <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard
                            icon={<Users size={18} />}
                            label="Total Users"
                            value={data.totalUsers.toLocaleString()}
                            subtitle={`${data.activeUsersToday} active today`}
                            color="#3B82F6"
                            delay={0.1}
                        />
                        <StatCard
                            icon={<MessageSquare size={18} />}
                            label="Conversations"
                            value={data.totalConversations.toLocaleString()}
                            subtitle={`${data.resolvedRate}% resolved`}
                            color="#059669"
                            delay={0.15}
                        />
                        <StatCard
                            icon={<Zap size={18} />}
                            label="Avg Response"
                            value={`${(data.avgResponseTimeMs / 1000).toFixed(1)}s`}
                            subtitle="voice-to-answer"
                            color="#D97706"
                            delay={0.2}
                        />
                        <StatCard
                            icon={<ThumbsUp size={18} />}
                            label="Satisfaction"
                            value={`${data.satisfactionAvg}/5`}
                            subtitle="user rating"
                            color="#7C3AED"
                            delay={0.25}
                        />
                    </div>

                    {/* Trend Deltas */}
                    {trends && (
                        <div className="grid grid-cols-4 gap-2">
                            <TrendCard
                                label="Users"
                                value={trends.deltas.activeUsers}
                                suffix="%"
                                delay={0.28}
                            />
                            <TrendCard
                                label="Chats"
                                value={trends.deltas.conversations}
                                suffix="%"
                                delay={0.3}
                            />
                            <TrendCard
                                label="Rating"
                                value={trends.deltas.satisfaction}
                                suffix=""
                                delay={0.32}
                            />
                            <TrendCard
                                label="Resolved"
                                value={trends.deltas.resolvedRate}
                                suffix="pp"
                                delay={0.34}
                            />
                        </div>
                    )}

                    {/* Module Usage */}
                    <motion.div
                        className="p-4 rounded-xl"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-primary)",
                        }}
                    >
                        <h2
                            className="text-sm font-bold mb-3"
                            style={{ color: "var(--text-primary)" }}
                        >
                            📊 Module Usage Breakdown
                        </h2>
                        <div className="space-y-3">
                            {moduleEntries.map(([key, count], i) => {
                                const mod = MODULE_DISPLAY[key];
                                return mod ? (
                                    <ModuleBar
                                        key={key}
                                        name={mod.name}
                                        icon={mod.icon}
                                        color={mod.color}
                                        count={count}
                                        maxCount={maxModuleCount}
                                        delay={0.35 + i * 0.05}
                                    />
                                ) : null;
                            })}
                        </div>
                    </motion.div>

                    {/* Daily Active Users Chart */}
                    <motion.div
                        className="p-4 rounded-xl"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-primary)",
                        }}
                    >
                        <h2
                            className="text-sm font-bold mb-3"
                            style={{ color: "var(--text-primary)" }}
                        >
                            📈 Daily Active Users (Last 7 Days)
                        </h2>
                        <DailyChart data={data.dailyActiveUsers} />
                    </motion.div>

                    {/* Language Split */}
                    <motion.div
                        className="p-4 rounded-xl"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-primary)",
                        }}
                    >
                        <h2
                            className="text-sm font-bold mb-3 flex items-center gap-2"
                            style={{ color: "var(--text-primary)" }}
                        >
                            <Globe size={16} />
                            Language Distribution
                        </h2>
                        <div className="flex gap-2 mb-2">
                            <div
                                className="h-3 rounded-full"
                                style={{
                                    width: `${(totalHi / totalLang) * 100}%`,
                                    background: "#F59E0B",
                                }}
                            />
                            <div
                                className="h-3 rounded-full"
                                style={{
                                    width: `${(totalEn / totalLang) * 100}%`,
                                    background: "#3B82F6",
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-xs">
                            <span style={{ color: "#F59E0B" }}>
                                हिंदी {Math.round((totalHi / totalLang) * 100)}%
                            </span>
                            <span style={{ color: "#3B82F6" }}>
                                English {Math.round((totalEn / totalLang) * 100)}%
                            </span>
                        </div>
                    </motion.div>

                    {/* Top Intents */}
                    <motion.div
                        className="p-4 rounded-xl"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-primary)",
                        }}
                    >
                        <h2
                            className="text-sm font-bold mb-3"
                            style={{ color: "var(--text-primary)" }}
                        >
                            🎯 Top User Intents
                        </h2>
                        <div className="space-y-2">
                            {data.topIntents.slice(0, 5).map((item, i) => (
                                <div
                                    key={item.intent}
                                    className="flex items-center justify-between p-2 rounded-lg"
                                    style={{ background: "var(--bg-elevated)" }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{
                                                background: "var(--janseva-surface)",
                                                color: "var(--janseva-primary)",
                                            }}
                                        >
                                            {i + 1}
                                        </span>
                                        <span
                                            className="text-sm font-medium"
                                            style={{ color: "var(--text-primary)" }}
                                        >
                                            {item.intent.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                    <span
                                        className="text-xs px-2 py-0.5 rounded-full"
                                        style={{
                                            background: "var(--bg-surface)",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        {item.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <p
                        className="text-center text-xs pb-4"
                        style={{ color: "var(--text-muted)" }}
                    >
                        CommPulse — सामुदायिक प्रभाव मापक · Powered by JanSathi AI
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p style={{ color: "var(--text-muted)" }}>{error || "Failed to load data"}</p>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ background: "#3B82F6", color: "white" }}
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
