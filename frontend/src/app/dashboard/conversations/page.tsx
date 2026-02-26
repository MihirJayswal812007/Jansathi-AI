// ===== JanSathi AI — Admin Conversations Page =====
// Browse and inspect all conversations. Admin only.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Loader2,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    ThumbsUp,
    ThumbsDown,
    Filter,
    User,
} from "lucide-react";
import AuthGuard from "@/components/common/AuthGuard";
import {
    fetchAdminConversations,
    fetchAdminConversationDetail,
    type AdminConversationSummary,
    type ConversationDetail,
} from "@/lib/apiClient";

const MODE_OPTIONS = [
    { value: "", label: "All Modes" },
    { value: "janseva", label: "🏛️ JanSeva" },
    { value: "janshiksha", label: "📚 JanShiksha" },
    { value: "jankrishi", label: "🌾 JanKrishi" },
    { value: "janvyapar", label: "💼 JanVyapar" },
    { value: "jankaushal", label: "🛠️ JanKaushal" },
];

const MODE_COLORS: Record<string, string> = {
    janseva: "#3B82F6",
    janshiksha: "#8B5CF6",
    jankrishi: "#10B981",
    janvyapar: "#F59E0B",
    jankaushal: "#EF4444",
};

function ConvRow({
    conv,
    expanded,
    detail,
    loadingDetail,
    onToggle,
}: {
    conv: AdminConversationSummary;
    expanded: boolean;
    detail: ConversationDetail | null;
    loadingDetail: boolean;
    onToggle: () => void;
}) {
    const date = new Date(conv.startedAt);
    const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const color = MODE_COLORS[conv.mode] || "#6B7280";

    return (
        <motion.div
            className="rounded-xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-primary)" }}
        >
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-3 text-left"
                style={{ cursor: "pointer", background: "transparent", border: "none" }}
            >
                <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: conv.resolved ? "#10B981" : color }}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold" style={{ color }}>
                            {conv.mode.toUpperCase()}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {conv.messageCount} msgs
                        </span>
                        {conv.userName && (
                            <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                                <User size={10} /> {conv.userName}
                            </span>
                        )}
                        {conv.satisfaction && (
                            conv.satisfaction >= 4
                                ? <ThumbsUp size={10} style={{ color: "#10B981" }} />
                                : <ThumbsDown size={10} style={{ color: "#EF4444" }} />
                        )}
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {dateStr} · {timeStr}
                    </span>
                </div>
                {expanded
                    ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} />
                    : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
                }
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3" style={{ borderTop: "1px solid var(--border-primary)" }}>
                            {loadingDetail ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 size={14} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                                </div>
                            ) : detail?.messages?.length ? (
                                <div className="flex flex-col gap-1.5 pt-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                    {detail.messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className="px-2.5 py-1.5 rounded-lg text-xs"
                                            style={{
                                                background: msg.role === "user" ? `${color}15` : "var(--bg-elevated)",
                                                color: "var(--text-primary)",
                                                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                                maxWidth: "85%",
                                            }}
                                        >
                                            <span className="font-semibold text-[10px]" style={{ color: "var(--text-muted)" }}>
                                                {msg.role === "user" ? "USER" : "AI"}
                                            </span>
                                            <p style={{ margin: "2px 0 0" }}>{msg.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs py-3 text-center" style={{ color: "var(--text-muted)" }}>
                                    No messages
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function AdminConversationsPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState<AdminConversationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [details, setDetails] = useState<Record<string, ConversationDetail>>({});
    const [loadingDetail, setLoadingDetail] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [modeFilter, setModeFilter] = useState("");
    const [resolvedFilter, setResolvedFilter] = useState("");

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchAdminConversations({
                page,
                mode: modeFilter || undefined,
                resolved: resolvedFilter || undefined,
            });
            setConversations(result.data);
            setTotalPages(result.pagination.totalPages);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [page, modeFilter, resolvedFilter]);

    const handleToggle = async (id: string) => {
        if (expandedId === id) { setExpandedId(null); return; }
        setExpandedId(id);
        if (!details[id]) {
            setLoadingDetail(id);
            try {
                const detail = await fetchAdminConversationDetail(id);
                setDetails((prev) => ({ ...prev, [id]: detail }));
            } catch { /* swallow */ } finally { setLoadingDetail(null); }
        }
    };

    return (
        <AuthGuard requireAdmin>
            <div className="min-h-dvh px-4 py-6" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
                            <ArrowLeft size={16} /> Dashboard
                        </button>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <MessageSquare size={18} /> Conversations
                        </h1>
                        <div style={{ width: "90px" }} />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                            <Filter size={12} />
                        </div>
                        <select
                            value={modeFilter}
                            onChange={(e) => { setModeFilter(e.target.value); setPage(1); }}
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{ background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}
                        >
                            {MODE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <select
                            value={resolvedFilter}
                            onChange={(e) => { setResolvedFilter(e.target.value); setPage(1); }}
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{ background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}
                        >
                            <option value="">All Status</option>
                            <option value="true">Resolved</option>
                            <option value="false">Open</option>
                        </select>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: "#EF444420", color: "#EF4444" }}>
                            {error}
                        </div>
                    )}

                    {/* List */}
                    {loading ? (
                        <div className="flex justify-center h-40 items-center">
                            <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-16">
                            <MessageSquare size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No conversations match filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-2">
                                {conversations.map((conv) => (
                                    <ConvRow
                                        key={conv.id}
                                        conv={conv}
                                        expanded={expandedId === conv.id}
                                        detail={details[conv.id] || null}
                                        loadingDetail={loadingDetail === conv.id}
                                        onToggle={() => handleToggle(conv.id)}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-4">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1 rounded-lg text-xs"
                                        style={{ background: "var(--bg-surface)", opacity: page === 1 ? 0.5 : 1 }}
                                    >
                                        ← Prev
                                    </button>
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{page}/{totalPages}</span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1 rounded-lg text-xs"
                                        style={{ background: "var(--bg-surface)", opacity: page === totalPages ? 0.5 : 1 }}
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
