// ===== JanSathi AI — Settings Page (Placeholder) =====
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AuthGuard from "@/components/common/AuthGuard";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
    return (
        <AuthGuard>
            <div
                className="min-h-dvh flex items-center justify-center px-4"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
            >
                <motion.div
                    className="text-center max-w-sm"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-primary)" }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--text-muted)" }}>
                            settings
                        </span>
                    </div>
                    <h1 className="text-xl font-bold mb-2">Settings</h1>
                    <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                        Account settings and preferences — coming soon.
                    </p>
                    <Link
                        href="/chat"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{
                            background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                            color: "white",
                        }}
                    >
                        Back to Chat
                    </Link>
                </motion.div>
            </div>
        </AuthGuard>
    );
}
