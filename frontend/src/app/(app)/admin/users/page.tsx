"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    fetchAdminUsers,
    updateUserRole,
    toggleUserActive,
    AdminUser,
} from "@/lib/apiClient";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => setSearchDebounced(search), 400);
        return () => clearTimeout(timeout);
    }, [search]);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchAdminUsers(page, searchDebounced || undefined);
            setUsers(result.data);
            setTotalPages(result.pagination.totalPages);
            setTotal(result.pagination.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [page, searchDebounced]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
        setActionLoading(userId);
        try {
            await updateUserRole(userId, newRole);
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update role");
        } finally {
            setActionLoading(null);
        }
    };

    const handleActiveToggle = async (userId: string, active: boolean) => {
        setActionLoading(userId);
        try {
            await toggleUserActive(userId, active);
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active } : u)));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to toggle status");
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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
                        <span className="material-symbols-outlined text-amber-400" style={{ fontSize: "24px" }}>admin_panel_settings</span>
                        User Management
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">{total} registered user{total !== 1 ? "s" : ""}</p>
                </div>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: "18px" }}>search</span>
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 w-72"
                    />
                </div>
            </motion.div>

            {/* Error */}
            {error && (
                <div className="glass-card p-4 rounded-xl border border-red-500/20 text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button onClick={() => { setError(null); loadUsers(); }} className="mt-2 text-xs text-blue-400 hover:underline">Retry</button>
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
                ) : users.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-gray-500 text-5xl mb-4 block">group_off</span>
                        <p className="text-gray-400">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Last Active</th>
                                    <th className="text-left px-5 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => {
                                    const initials = (user.name || user.phone || "U").slice(0, 2).toUpperCase();
                                    const isActionLoading = actionLoading === user.id;

                                    return (
                                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white">{user.name || "—"}</div>
                                                        <div className="text-xs text-gray-500">{user.phone || user.email || "—"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-400">
                                                {[user.district, user.state].filter(Boolean).join(", ") || "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value as "user" | "admin")}
                                                    disabled={isActionLoading}
                                                    className={`px-2 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer ${user.role === "admin" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"}`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleActiveToggle(user.id, !user.active)}
                                                    disabled={isActionLoading}
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${user.active ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" : "bg-red-500/15 text-red-400 hover:bg-red-500/25"}`}
                                                >
                                                    {user.active ? "Active" : "Inactive"}
                                                </button>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-400">
                                                {formatDate(user.lastActiveAt)}
                                            </td>
                                            <td className="px-5 py-4">
                                                {isActionLoading && (
                                                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                                )}
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
        </div>
    );
}
