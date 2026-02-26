// ===== JanSathi AI — Auth Guard Component =====
// Client-side route protection. Redirects to /login if not authenticated.
// Backend RBAC middleware is the real security gate; this is UX-only.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
    children: React.ReactNode;
    /** If true, requires admin role in addition to authentication. */
    requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            const redirectTo = typeof window !== "undefined" ? window.location.pathname : "/";
            router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`);
        }
    }, [isAuthenticated, isLoading, router]);

    // Loading state
    if (isLoading) {
        return (
            <div
                className="min-h-dvh flex items-center justify-center"
                style={{ background: "var(--bg-primary)" }}
            >
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Loader2
                        size={32}
                        className="animate-spin mx-auto mb-3"
                        style={{ color: "var(--text-muted)" }}
                    />
                    <p style={{ color: "var(--text-muted)" }}>Checking session...</p>
                </motion.div>
            </div>
        );
    }

    // Not authenticated → redirect is in useEffect, show nothing briefly
    if (!isAuthenticated) {
        return null;
    }

    // Admin required but user is not admin
    if (requireAdmin && !isAdmin) {
        return (
            <div
                className="min-h-dvh flex items-center justify-center px-4"
                style={{ background: "var(--bg-primary)" }}
            >
                <motion.div
                    className="text-center max-w-sm"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: "#EF444420" }}
                    >
                        <Shield size={28} style={{ color: "#EF4444" }} />
                    </div>
                    <h2
                        className="text-xl font-bold mb-2"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Access Denied
                    </h2>
                    <p
                        className="text-sm mb-4"
                        style={{ color: "var(--text-muted)" }}
                    >
                        This page requires administrator privileges.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{
                            background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                            color: "white",
                        }}
                    >
                        Go Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}
