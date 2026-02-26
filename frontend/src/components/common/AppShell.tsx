// ===== JanSathi AI — App Shell with Sidebar =====
// Desktop: fixed left sidebar (240px, collapsible). Tablet: 64px icons. Mobile: hidden.

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
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
    const [collapsed, setCollapsed] = useState(false);

    // Persist sidebar state across page loads
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved === "true") setCollapsed(true);
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem("sidebar-collapsed", String(next));
            return next;
        });
    };

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
            {/* Sidebar */}
            <aside
                className={`sidebar${collapsed ? " sidebar--collapsed" : ""}`}
                aria-label="Main navigation"
            >
                {/* Logo + collapse toggle */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span
                            className="material-symbols-outlined"
                            style={{ color: "#2563EB", fontSize: "20px" }}
                        >
                            auto_awesome
                        </span>
                    </div>
                    {!collapsed && (
                        <span className="sidebar-brand font-display">{APP_NAME}</span>
                    )}
                    <button
                        className="sidebar-collapse-btn"
                        onClick={toggleCollapsed}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <span className="material-symbols-outlined">
                            {collapsed ? "chevron_right" : "chevron_left"}
                        </span>
                    </button>
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
                            {!collapsed && (
                                <span className="sidebar-label">
                                    {language === "hi" ? item.labelHi : item.label}
                                </span>
                            )}
                            {item.auth === "admin" && !collapsed && (
                                <span className="sidebar-admin-badge">Admin</span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="sidebar-footer">
                    {!collapsed && (
                        <div className="sidebar-lang">
                            <LanguageSwitcher />
                        </div>
                    )}

                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="sidebar-item sidebar-logout"
                            title={language === "hi" ? "लॉग आउट" : "Logout"}
                        >
                            <span className="material-symbols-outlined sidebar-icon">
                                logout
                            </span>
                            {!collapsed && (
                                <span className="sidebar-label">
                                    {language === "hi" ? "लॉग आउट" : "Logout"}
                                </span>
                            )}
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
                            {!collapsed && (
                                <span className="sidebar-label">
                                    {language === "hi" ? "लॉग इन" : "Login"}
                                </span>
                            )}
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main content area — shifts with sidebar */}
            <div className={`app-main${collapsed ? " app-main--sidebar-collapsed" : ""}`}>
                {children}
            </div>
        </div>
    );
}
