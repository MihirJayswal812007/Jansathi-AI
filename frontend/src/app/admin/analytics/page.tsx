// ===== JanSathi AI — Admin Analytics Page (Placeholder) =====
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AuthGuard from "@/components/common/AuthGuard";

export const dynamic = "force-dynamic";

export default function AdminAnalyticsPage() {
    return (
        <AuthGuard requireAdmin>
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
                        style={{ background: "#3B82F620", border: "1px solid #3B82F630" }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#3B82F6" }}>
                            analytics
                        </span>
                    </div>
                    <h1 className="text-xl font-bold mb-2">Analytics</h1>
                    <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                        Advanced analytics suite — coming in next sprint.
                    </p>
                    <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
                        Cohort analysis · Funnel tracking · Scheme adoption rates
                    </p>
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{
                            background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                            color: "white",
                        }}
                    >
                        Back to Dashboard
                    </Link>
                </motion.div>
            </div>
        </AuthGuard>
    );
}
