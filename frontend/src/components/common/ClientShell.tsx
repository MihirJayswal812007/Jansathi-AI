// ===== JanSathi AI — Client Layout Shell =====
// Client wrapper that provides AuthProvider + conditional AppShell.
// Public pages (/, /about, /how-it-works) render without sidebar.
// App pages (/chat, /history, /dashboard, /profile) render with AppShell sidebar.

"use client";

import { usePathname } from "next/navigation";
import AppShell from "@/components/common/AppShell";
import AuthProvider from "@/components/common/AuthProvider";

// Routes that should render WITHOUT the sidebar (public/marketing pages)
const PUBLIC_ROUTES = ["/", "/about", "/how-it-works"];

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicPage = PUBLIC_ROUTES.includes(pathname);

    return (
        <AuthProvider>
            {isPublicPage ? children : <AppShell>{children}</AppShell>}
        </AuthProvider>
    );
}
