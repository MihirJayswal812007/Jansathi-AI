// ===== JanSathi AI — Client Layout Shell =====
// Client wrapper that provides AuthProvider (global session init) + AppShell.

"use client";

import AppShell from "@/components/common/AppShell";
import AuthProvider from "@/components/common/AuthProvider";

export default function ClientShell({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AppShell>{children}</AppShell>
        </AuthProvider>
    );
}

