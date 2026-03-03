// ===== JanSathi AI — Mobile Bottom Navigation Bar =====
// Fixed bottom tab bar for <640px screens. 48px touch targets (WCAG).

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModeStore } from "@/store/modeStore";
import { useAuth } from "@/hooks/useAuth";

const TABS = [
    { href: "/chat", label: "Chat", labelHi: "चैट", icon: "chat" },
    { href: "/history", label: "History", labelHi: "इतिहास", icon: "history", auth: true },
    { href: "/dashboard", label: "Dashboard", labelHi: "डैशबोर्ड", icon: "dashboard", admin: true },
    { href: "/profile", label: "Profile", labelHi: "प्रोफ़ाइल", icon: "person", auth: true },
] as const;

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { language } = useModeStore();
    const { isAuthenticated, isAdmin } = useAuth();

    const visibleTabs = TABS.filter((tab) => {
        if ("admin" in tab && tab.admin) return isAuthenticated && isAdmin;
        if ("auth" in tab && tab.auth) return isAuthenticated;
        return true;
    });

    return (
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
            {visibleTabs.map((tab) => {
                const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`mobile-bottom-nav-item${active ? " active" : ""}`}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                            {tab.icon}
                        </span>
                        <span className="mobile-bottom-nav-label">
                            {language === "hi" ? tab.labelHi : tab.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
