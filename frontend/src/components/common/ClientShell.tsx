// ===== JanSathi AI — Client Layout Shell =====
// Client wrapper that provides AppShell for sidebar navigation.

"use client";

import AppShell from "@/components/common/AppShell";

export default function ClientShell({ children }: { children: React.ReactNode }) {
    return <AppShell>{children}</AppShell>;
}
