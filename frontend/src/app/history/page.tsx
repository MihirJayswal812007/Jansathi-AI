// ===== JanSathi AI — Conversation History Page =====
// View past conversations. Protected by AuthGuard.

"use client";

import { useState } from "react";
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
} from "lucide-react";
import AuthGuard from "@/components/common/AuthGuard";
import { ErrorFallback } from "@/components/common/ErrorFallback";
import { EmptyState } from "@/components/common/EmptyState";
import { useConversations } from "@/hooks/useConversations";
import {
    fetchConversationDetail,
    type ConversationSummary,
    type ConversationDetail,
} from "@/lib/apiClient";

const MODE_LABELS: Record<string, { name: string; icon: string; color: string }> = {
    janseva: { name: "JanSeva", icon: "🏛️", color: "#3B82F6" },
    janshiksha: { name: "JanShiksha", icon: "📚", color: "#8B5CF6" },
    jankrishi: { name: "JanKrishi", icon: "🌾", color: "#10B981" },
    janvyapar: { name: "JanVyapar", icon: "💼", color: "#F59E0B" },
    jankaushal: { name: "JanKaushal", icon: "🛠️", color: "#EF4444" },
};

function ConversationCard({
    conv,
    expanded,
    detail,
    loadingDetail,
    onToggle,
}: {
    conv: ConversationSummary;
    expanded: boolean;
    detail: ConversationDetail | null;
    loadingDetail: boolean;
    onToggle: () => void;
}) {
    const mode = MODE_LABELS[conv.mode] || { name: conv.mode, icon: "💬", color: "#6B7280" };
    const date = new Date(conv.startedAt);
    const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    return (
        <motion.div
            className="rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-primary)",
            }}
        >
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-4 text-left"
                style={{ cursor: "pointer", background: "transparent", border: "none" }}
            >
                <span style={{ fontSize: "20px" }}>{mode.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: mode.color }}>
                            {mode.name}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {conv.messageCount} msgs
                        </span>
                        {conv.satisfaction && (
                            conv.satisfaction >= 4
                                ? <ThumbsUp size={12} style={{ color: "#10B981" }} />
                                : <ThumbsDown size={12} style={{ color: "#EF4444" }} />
                        )}
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {dateStr} · {timeStr}
                    </span>
                </div>
                {expanded ? (
                    <ChevronUp size={16} style={{ color: "var(--text-muted)" }} />
                ) : (
                    <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
                )}
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
                            {loadingDetail ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                                </div>
                            ) : detail?.messages?.length ? (
                                <div className="flex flex-col gap-2 pt-3">
                                    {detail.messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col"
                                            style={{
                                                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                                maxWidth: "85%",
                                            }}
                                        >
                                            <div
                                                className="px-3 py-2 rounded-xl text-sm"
                                                style={{
                                                    background: msg.role === "user"
                                                        ? `${mode.color}20`
                                                        : "var(--bg-elevated)",
                                                    color: "var(--text-primary)",
                                                    borderBottomRightRadius: msg.role === "user" ? "4px" : undefined,
                                                    borderBottomLeftRadius: msg.role === "assistant" ? "4px" : undefined,
                                                }}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>
                                    No messages found
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function HistoryPage() {
    const router = useRouter();
    const { conversations, page, totalPages, isLoading: loading, error, setPage, refetch } = useConversations();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [details, setDetails] = useState<Record<string, ConversationDetail>>({});
    const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

    const handleToggle = async (id: string) => {
        if (expandedId === id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(id);

        if (!details[id]) {
            setLoadingDetail(id);
            try {
                const detail = await fetchConversationDetail(id);
                setDetails((prev) => ({ ...prev, [id]: detail }));
            } catch {
                // Swallow — will show empty
            } finally {
                setLoadingDetail(null);
            }
        }
    };

    return (
        <AuthGuard>
            <div
                className="min-h-dvh px-4 py-6"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
            >
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => router.push("/")}
                            className="flex items-center gap-1 text-sm"
                            style={{ color: "var(--text-muted)" }}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <MessageSquare size={18} /> History
                        </h1>
                        <div style={{ width: "60px" }} /> {/* Spacer */}
                    </div>

                    {/* Error */}
                    {error && (
                        <ErrorFallback error={error} onRetry={refetch} />
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                        </div>
                    ) : conversations.length === 0 ? (
                        <EmptyState
                            icon={<MessageSquare size={28} />}
                            title="No conversations yet"
                            description="Start chatting to see your conversation history here."
                            ctaLabel="Start Chatting"
                            ctaHref="/chat"
                        />
                    ) : (
                        <>
                            <div className="flex flex-col gap-3">
                                {conversations.map((conv) => (
                                    <ConversationCard
                                        key={conv.id}
                                        conv={conv}
                                        expanded={expandedId === conv.id}
                                        detail={details[conv.id] || null}
                                        loadingDetail={loadingDetail === conv.id}
                                        onToggle={() => handleToggle(conv.id)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-6">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1.5 rounded-lg text-xs"
                                        style={{
                                            background: "var(--bg-surface)",
                                            color: page === 1 ? "var(--text-muted)" : "var(--text-primary)",
                                            opacity: page === 1 ? 0.5 : 1,
                                        }}
                                    >
                                        ← Prev
                                    </button>
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1.5 rounded-lg text-xs"
                                        style={{
                                            background: "var(--bg-surface)",
                                            color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)",
                                            opacity: page === totalPages ? 0.5 : 1,
                                        }}
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
