// ===== JanSathi AI — CommPulse Dashboard =====
// Analytics dashboard showing usage stats, module breakdown, and trends

"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────
interface DashboardData {
    totalUsers: number;
    activeUsersToday: number;
    totalConversations: number;
    avgResponseTimeMs: number;
    moduleUsage: Record<string, number>;
    languageSplit: { hi: number; en: number };
    topIntents: { intent: string; count: number }[];
    dailyActiveUsers: { date: string; count: number }[];
    satisfactionAvg: number;
    resolvedRate: number;
}

// ── Module display config ────────────────────────────────────
const MODULE_DISPLAY: Record<
    string,
    { name: string; color: string; icon: string }
> = {
    janseva: { name: "JanSeva", color: "#2563EB", icon: "🏛️" },
    janshiksha: { name: "JanShiksha", color: "#7C3AED", icon: "🎓" },
    jankrishi: { name: "JanKrishi", color: "#10B981", icon: "🌾" },
    janvyapar: { name: "JanVyapar", color: "#F59E0B", icon: "💼" },
    jankaushal: { name: "JanKaushal", color: "#EF4444", icon: "🛠️" },
};

// ── Main Dashboard Page ──────────────────────────────────────
export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
    const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || "";

    const ensureAdminSession = async (): Promise<boolean> => {
        try {
            // Step 1: Create or retrieve session
            await fetch(`${API_BASE}/api/auth/session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({}),
            });

            // Step 2: Promote to admin using secret
            if (ADMIN_SECRET) {
                const promoRes = await fetch(`${API_BASE}/api/auth/session`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ adminSecret: ADMIN_SECRET }),
                });
                const promoData = await promoRes.json();
                return promoData.promoted === true || promoData.session?.role === "admin";
            }
            return false;
        } catch {
            return false;
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Ensure we have an admin session before fetching
            const isAdmin = await ensureAdminSession();
            if (!isAdmin) {
                setError("Admin authentication failed. Check NEXT_PUBLIC_ADMIN_SECRET.");
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_BASE}/api/admin/dashboard`, { credentials: "include" });
            const json = await res.json();
            if (json.success && json.data) {
                setData(json.data);
            } else {
                setError(json.error?.message || "Failed to load dashboard data");
            }
        } catch (err) {
            console.error("Failed to fetch dashboard:", err);
            setError("Network error — is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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
                    onClick={fetchData}
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
                        <motion.div
                            className="p-4 rounded-xl"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-primary)",
                            }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: "#3B82F620", color: "#3B82F6" }}
                                >
                                    <Users size={18} />
                                </div>
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    Total Users
                                </span>
                            </div>
                            <p className="text-2xl font-bold">{data.totalUsers}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {data.activeUsersToday} active today
                            </p>
                        </motion.div>

                        <motion.div
                            className="p-4 rounded-xl"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            style={{
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-primary)",
                            }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: "#05966920", color: "#059669" }}
                                >
                                    <MessageSquare size={18} />
                                </div>
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    Conversations
                                </span>
                            </div>
                            <p className="text-2xl font-bold">{data.totalConversations}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {data.resolvedRate}% resolved
                            </p>
                        </motion.div>

                        <motion.div
                            className="p-4 rounded-xl"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-primary)",
                            }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: "#D9770620", color: "#D97706" }}
                                >
                                    <Zap size={18} />
                                </div>
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    Avg Response
                                </span>
                            </div>
                            <p className="text-2xl font-bold">
                                {(data.avgResponseTimeMs / 1000).toFixed(1)}s
                            </p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                voice-to-answer
                            </p>
                        </motion.div>

                        <motion.div
                            className="p-4 rounded-xl"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            style={{
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-primary)",
                            }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: "#7C3AED20", color: "#7C3AED" }}
                                >
                                    <ThumbsUp size={18} />
                                </div>
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    Satisfaction
                                </span>
                            </div>
                            <p className="text-2xl font-bold">{data.satisfactionAvg}/5</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                user rating
                            </p>
                        </motion.div>
                    </div>

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
                                if (!mod) return null;
                                const percentage =
                                    maxModuleCount > 0 ? (count / maxModuleCount) * 100 : 0;
                                return (
                                    <motion.div
                                        key={key}
                                        className="flex items-center gap-3"
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.35 + i * 0.05 }}
                                    >
                                        <span className="text-lg w-8">{mod.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span
                                                    className="text-sm font-medium"
                                                    style={{ color: "var(--text-primary)" }}
                                                >
                                                    {mod.name}
                                                </span>
                                                <span
                                                    className="text-xs"
                                                    style={{ color: "var(--text-muted)" }}
                                                >
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
                                                    animate={{
                                                        width: `${percentage}%`,
                                                    }}
                                                    transition={{
                                                        delay: 0.4 + i * 0.05,
                                                        duration: 0.6,
                                                    }}
                                                    style={{ background: mod.color }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Daily Active Users */}
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
                        <div className="flex items-end gap-1.5 h-24">
                            {data.dailyActiveUsers.map((day, i) => {
                                const maxDay = Math.max(
                                    ...data.dailyActiveUsers.map((d) => d.count),
                                    1
                                );
                                const height = (day.count / maxDay) * 100;
                                const dateLabel = new Date(day.date).toLocaleDateString(
                                    "en",
                                    { weekday: "short" }
                                );
                                return (
                                    <motion.div
                                        key={day.date}
                                        className="flex-1 flex flex-col items-center gap-1"
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ delay: 0.5 + i * 0.05 }}
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
                                                    i === data.dailyActiveUsers.length - 1
                                                        ? "#3B82F6"
                                                        : "var(--bg-elevated)",
                                                minHeight: "4px",
                                            }}
                                        />
                                        <span
                                            className="text-xs"
                                            style={{
                                                color: "var(--text-muted)",
                                                fontSize: "10px",
                                            }}
                                        >
                                            {dateLabel}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
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
                        onClick={fetchData}
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
