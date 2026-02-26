// ===== JanSathi AI — App Shell with Sidebar =====
// Desktop: fixed left sidebar (240px). Tablet: collapsed (64px icons). 
// Mobile: hidden (navigation via MobileMenu hamburger).

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useModeStore } from "@/store/modeStore";
import LanguageSwitcher from "./LanguageSwitcher";
import { APP_NAME } from "@/lib/constants";

interface NavItem {
    href: string;
    label: string;
    labelHi: string;
    icon: string;
    auth: "any" | "auth" | "admin";
}

const NAV_ITEMS: NavItem[] = [
    { href: "/", label: "Chat", labelHi: "चैट", icon: "chat", auth: "any" },
    { href: "/history", label: "History", labelHi: "इतिहास", icon: "history", auth: "auth" },
    { href: "/dashboard", label: "Dashboard", labelHi: "डैशबोर्ड", icon: "dashboard", auth: "admin" },
    { href: "/profile", label: "Profile", labelHi: "प्रोफ़ाइल", icon: "person", auth: "auth" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, isAdmin, handleLogout } = useAuth();
    const { language } = useModeStore();

    // Filter nav items based on auth state
    const visibleItems = NAV_ITEMS.filter((item) => {
        if (item.auth === "any") return true;
        if (item.auth === "auth") return isAuthenticated;
        if (item.auth === "admin") return isAuthenticated && isAdmin;
        return false;
    });

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <div className="app-shell">
            {/* Sidebar — hidden on mobile via CSS */}
            <aside className="sidebar" aria-label="Main navigation">
                {/* Logo area */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span
                            className="material-symbols-outlined"
                            style={{ color: "#2563EB", fontSize: "20px" }}
                        >
                            auto_awesome
                        </span>
                    </div>
                    <span className="sidebar-brand font-display">{APP_NAME}</span>
                </div>

                {/* Nav items */}
                <nav className="sidebar-nav">
                    {visibleItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-item${isActive(item.href) ? " active" : ""}`}
                            title={language === "hi" ? item.labelHi : item.label}
                        >
                            <span className="material-symbols-outlined sidebar-icon">
                                {item.icon}
                            </span>
                            <span className="sidebar-label">
                                {language === "hi" ? item.labelHi : item.label}
                            </span>
                            {item.auth === "admin" && (
                                <span className="sidebar-admin-badge">Admin</span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="sidebar-footer">
                    <div className="sidebar-lang">
                        <LanguageSwitcher />
                    </div>

                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="sidebar-item sidebar-logout"
                            title={language === "hi" ? "लॉग आउट" : "Logout"}
                        >
                            <span className="material-symbols-outlined sidebar-icon">
                                logout
                            </span>
                            <span className="sidebar-label">
                                {language === "hi" ? "लॉग आउट" : "Logout"}
                            </span>
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className={`sidebar-item${pathname === "/login" ? " active" : ""}`}
                            title={language === "hi" ? "लॉग इन" : "Login"}
                        >
                            <span className="material-symbols-outlined sidebar-icon">
                                login
                            </span>
                            <span className="sidebar-label">
                                {language === "hi" ? "लॉग इन" : "Login"}
                            </span>
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main content area */}
            <div className="app-main">
                {children}
            </div>
        </div>
    );
}
