// ===== JanSathi AI — (app) Route Group Layout =====
// Shared layout for /chat, /dashboard, /history, /profile, /settings.
// AppLayout (sidebar + bottom nav) persists across these routes without re-mounting.

"use client";

import AppLayout from "@/components/layout/AppLayout";
import AuthProvider from "@/components/common/AuthProvider";

export default function AppGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <AppLayout>{children}</AppLayout>
        </AuthProvider>
    );
}
