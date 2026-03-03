"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    fetchAdminConversations,
    fetchAdminConversationDetail,
    AdminConversationSummary,
    ConversationDetail,
} from "@/lib/apiClient";
import { MODE_CONFIGS } from "@/lib/constants";
import { ModeName } from "@/types/modules";

export default function AdminConversationsPage() {
    const [conversations, setConversations] = useState<AdminConversationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [filterMode, setFilterMode] = useState<string>("");
    const [filterResolved, setFilterResolved] = useState<string>("");
    const [selectedConvo, setSelectedConvo] = useState<ConversationDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchAdminConversations({
                page,
                mode: filterMode || undefined,
                resolved: filterResolved || undefined,
            });
            setConversations(result.data);
            setTotalPages(result.pagination.totalPages);
            setTotal(result.pagination.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load conversations");
        } finally {
            setLoading(false);
        }
    }, [page, filterMode, filterResolved]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const handleViewDetail = async (id: string) => {
        try {
            setDetailLoading(true);
            const detail = await fetchAdminConversationDetail(id);
            setSelectedConvo(detail);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load conversation");
        } finally {
            setDetailLoading(false);
        }
    };

    const getModuleConfig = (mode: string) => {
        return MODE_CONFIGS[mode as ModeName] || { name: mode, primaryColor: "#6366F1", icon: "💬" };
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
            {/* Header */}
            <motion.div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-2xl font-bold font-space text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-violet-400" style={{ fontSize: "24px" }}>forum</span>
                        Conversation Monitor
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">{total} conversation{total !== 1 ? "s" : ""} total</p>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                className="flex flex-wrap gap-3 items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <span className="text-xs text-gray-500 uppercase font-medium">Module:</span>
                <div className="flex gap-1.5 flex-wrap">
                    <button
                        onClick={() => { setFilterMode(""); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterMode ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
                    >
                        All
                    </button>
                    {(Object.keys(MODE_CONFIGS) as ModeName[]).map((mode) => {
                        const config = MODE_CONFIGS[mode];
                        return (
                            <button
                                key={mode}
                                onClick={() => { setFilterMode(mode); setPage(1); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterMode === mode ? "text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
                                style={filterMode === mode ? { background: config.primaryColor } : {}}
                            >
                                {config.icon} {config.name}
                            </button>
                        );
                    })}
                </div>

                <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />

                <span className="text-xs text-gray-500 uppercase font-medium">Status:</span>
                <div className="flex gap-1.5">
                    {[
                        { value: "", label: "All" },
                        { value: "true", label: "Resolved" },
                        { value: "false", label: "Unresolved" },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { setFilterResolved(opt.value); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterResolved === opt.value ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
                        >
                            {opt.label}
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

            {/* Table */}
            <motion.div
                className="glass-card rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {loading ? (
                    <div className="p-8 space-y-4 animate-pulse">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-14 rounded-xl bg-white/5" />
                        ))}
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-gray-500 text-5xl mb-4 block">chat_bubble_outline</span>
                        <p className="text-gray-400">No conversations found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Module</th>
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Messages</th>
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider" />
                                </tr>
                            </thead>
                            <tbody>
                                {conversations.map((convo) => {
                                    const config = getModuleConfig(convo.mode);
                                    return (
                                        <tr key={convo.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => handleViewDetail(convo.id)}>
                                            <td className="px-5 py-4 text-sm text-white">{convo.userName || "Anonymous"}</td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                                                    style={{ background: `${config.primaryColor}20`, color: config.primaryColor }}
                                                >
                                                    {config.icon} {config.name}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-amber-400">
                                                {convo.satisfaction != null
                                                    ? "★".repeat(convo.satisfaction) + "☆".repeat(5 - convo.satisfaction)
                                                    : <span className="text-gray-600">—</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${convo.resolved ? "bg-emerald-500/15 text-emerald-400" : "bg-gray-500/15 text-gray-400"}`}>
                                                    {convo.resolved ? "Resolved" : "Open"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-400">{convo.messageCount}</td>
                                            <td className="px-5 py-4 text-xs text-gray-400">{formatDate(convo.startedAt)}</td>
                                            <td className="px-5 py-4">
                                                <span className="material-symbols-outlined text-gray-500 hover:text-blue-400 transition-colors" style={{ fontSize: "18px" }}>
                                                    visibility
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 text-sm"
                    >
                        ← Previous
                    </button>
                    <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 text-sm"
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
                            onClick={() => setSelectedConvo(null)}
                        />
                        <motion.div
                            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#0f0f1a] border-l border-white/10 z-50 flex flex-col"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-lg font-semibold font-space text-white">Chat Transcript</h3>
                                    {selectedConvo && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {getModuleConfig(selectedConvo.mode).icon} {getModuleConfig(selectedConvo.mode).name}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedConvo(null)}
                                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
                                </button>
                            </div>

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
                                            <p className="text-[10px] mt-2 opacity-50">{formatTime(msg.timestamp)}</p>
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
