"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    fetchConversations,
    fetchConversationDetail,
    ConversationSummary,
    ConversationDetail,
} from "@/lib/apiClient";
import { MODE_CONFIGS } from "@/lib/constants";
import { ModeName } from "@/types/modules";

export default function HistoryPage() {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [filterMode, setFilterMode] = useState<string>("");
    const [selectedConvo, setSelectedConvo] = useState<ConversationDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchConversations(page);
            setConversations(result.data);
            setTotalPages(result.pagination.totalPages);
            setTotal(result.pagination.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load conversations");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const handleViewDetail = async (id: string) => {
        try {
            setDetailLoading(true);
            const detail = await fetchConversationDetail(id);
            setSelectedConvo(detail);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load conversation");
        } finally {
            setDetailLoading(false);
        }
    };

    const filteredConversations = filterMode
        ? conversations.filter((c) => c.mode === filterMode)
        : conversations;

    const getModuleConfig = (mode: string) => {
        return MODE_CONFIGS[mode as ModeName] || { name: mode, primaryColor: "#6366F1", icon: "💬" };
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    };

    if (loading && conversations.length === 0) {
        return (
            <div className="flex flex-col gap-4 p-6 max-w-4xl mx-auto w-full animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 rounded-2xl bg-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold font-space text-white">Conversation History</h1>
                    <p className="text-gray-400 text-sm mt-1">{total} conversation{total !== 1 ? "s" : ""} total</p>
                </div>

                {/* Module Filter */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilterMode("")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterMode ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
                    >
                        All
                    </button>
                    {Object.entries(MODE_CONFIGS).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setFilterMode(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterMode === key ? "text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
                            style={filterMode === key ? { background: config.primaryColor } : {}}
                        >
                            {config.icon} {config.name}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Error */}
            {error && (
                <div className="glass-card p-4 rounded-xl border border-red-500/20 text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button onClick={loadConversations} className="mt-2 text-xs text-blue-400 hover:underline">Retry</button>
                </div>
            )}

            {/* Empty state */}
            {!loading && filteredConversations.length === 0 && (
                <div className="glass-card p-12 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-gray-500 text-5xl mb-4 block">chat_bubble_outline</span>
                    <h2 className="text-xl font-semibold text-white mb-2">No conversations yet</h2>
                    <p className="text-gray-400 text-sm">Start chatting with any module to see your history here.</p>
                </div>
            )}

            {/* Conversation List */}
            <div className="flex flex-col gap-3">
                <AnimatePresence>
                    {filteredConversations.map((convo, idx) => {
                        const config = getModuleConfig(convo.mode);
                        return (
                            <motion.button
                                key={convo.id}
                                onClick={() => handleViewDetail(convo.id)}
                                className="glass-card p-5 rounded-xl text-left hover:bg-white/[0.06] transition-colors group"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                                        style={{ background: `${config.primaryColor}20` }}
                                    >
                                        {config.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-white">{config.name}</span>
                                            <span
                                                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                style={{ background: `${config.primaryColor}20`, color: config.primaryColor }}
                                            >
                                                {convo.mode}
                                            </span>
                                            {convo.resolved && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400">
                                                    Resolved
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <span>{formatDate(convo.startedAt)}</span>
                                            <span>{convo.messageCount} messages</span>
                                            {convo.satisfaction != null && (
                                                <span className="flex items-center gap-1">
                                                    {"★".repeat(convo.satisfaction)}{"☆".repeat(5 - convo.satisfaction)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-500 group-hover:text-blue-400 transition-colors" style={{ fontSize: "20px" }}>
                                        chevron_right
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                    >
                        ← Previous
                    </button>
                    <span className="text-xs text-gray-500">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Conversation Detail Slide-over */}
            <AnimatePresence>
                {(selectedConvo || detailLoading) && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/60 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setSelectedConvo(null); }}
                        />
                        <motion.div
                            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#0f0f1a] border-l border-white/10 z-50 flex flex-col"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            {/* Panel Header */}
                            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
                                <h3 className="text-lg font-semibold font-space text-white">Chat Transcript</h3>
                                <button
                                    onClick={() => setSelectedConvo(null)}
                                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {detailLoading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : selectedConvo?.messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                                ? "bg-blue-600 text-white rounded-br-md"
                                                : "bg-white/5 text-gray-200 rounded-bl-md border border-white/5"
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                            <p className="text-[10px] mt-2 opacity-50">
                                                {formatTime(msg.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
