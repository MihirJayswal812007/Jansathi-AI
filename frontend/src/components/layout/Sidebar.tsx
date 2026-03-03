// ===== JanSathi AI — Axora-Inspired Collapsible Dark Sidebar =====
// Desktop: 240px expanded, 64px collapsed. Tablet: 64px. Mobile: hidden.

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useModeStore } from "@/store/modeStore";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { APP_NAME } from "@/lib/constants";

interface NavItem {
    href: string;
    label: string;
    labelHi: string;
    icon: string;
    auth: "any" | "auth" | "admin";
}

const NAV_ITEMS: NavItem[] = [
    { href: "/chat", label: "Chat", labelHi: "चैट", icon: "chat", auth: "any" },
    { href: "/dashboard", label: "Dashboard", labelHi: "डैशबोर्ड", icon: "dashboard", auth: "admin" },
    { href: "/history", label: "History", labelHi: "इतिहास", icon: "history", auth: "auth" },
    { href: "/profile", label: "Profile", labelHi: "प्रोफ़ाइल", icon: "person", auth: "auth" },
    { href: "/settings", label: "Settings", labelHi: "सेटिंग्स", icon: "settings", auth: "auth" },
    { href: "/help", label: "Help", labelHi: "सहायता", icon: "help", auth: "auth" },
    { href: "/admin/users", label: "Users", labelHi: "उपयोगकर्ता", icon: "group", auth: "admin" },
    { href: "/admin/conversations", label: "Conversations", labelHi: "वार्तालाप", icon: "forum", auth: "admin" },
];

interface SidebarProps {
    collapsed: boolean;
    onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const { isAuthenticated, isAdmin, handleLogout } = useAuth();
    const { language } = useModeStore();

    // Keyboard shortcut: Ctrl+B to toggle sidebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "b") {
                e.preventDefault();
                onToggleCollapse();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onToggleCollapse]);

    // Filter nav items based on auth state
    const visibleItems = NAV_ITEMS.filter((item) => {
        if (item.auth === "any") return true;
        if (item.auth === "auth") return isAuthenticated;
        if (item.auth === "admin") return isAuthenticated && isAdmin;
        return false;
    });

    const isActive = (href: string) => {
        if (href === "/chat") return pathname === href || pathname === "/chat";
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <aside
            className={`sidebar-v2${collapsed ? " sidebar-v2--collapsed" : ""}`}
            aria-label="Main navigation"
        >
            {/* Logo + collapse toggle */}
            <div className="sidebar-v2-header">
                <Link href="/" className="sidebar-v2-logo-link">
                    <div className="sidebar-v2-logo">
                        <span
                            className="material-symbols-outlined"
                            style={{ color: "#818CF8", fontSize: "22px" }}
                        >
                            auto_awesome
                        </span>
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                className="sidebar-v2-brand"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {APP_NAME}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
                <button
                    className="sidebar-v2-toggle"
                    onClick={onToggleCollapse}
                    title={collapsed ? "Expand (Ctrl+B)" : "Collapse (Ctrl+B)"}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-expanded={!collapsed}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                        {collapsed ? "chevron_right" : "chevron_left"}
                    </span>
                </button>
            </div>

            {/* Nav items */}
            <nav className="sidebar-v2-nav">
                {visibleItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-v2-item${active ? " active" : ""}`}
                            title={language === "hi" ? item.labelHi : item.label}
                        >
                            {/* Active indicator bar */}
                            {active && (
                                <motion.div
                                    className="sidebar-v2-active-bar"
                                    layoutId="sidebar-active"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="material-symbols-outlined sidebar-v2-icon">
                                {item.icon}
                            </span>
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        className="sidebar-v2-label"
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -8 }}
                                        transition={{ duration: 0.12 }}
                                    >
                                        {language === "hi" ? item.labelHi : item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="sidebar-v2-footer">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            className="sidebar-v2-lang"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <LanguageSwitcher />
                        </motion.div>
                    )}
                </AnimatePresence>

                {isAuthenticated ? (
                    <button
                        onClick={handleLogout}
                        className="sidebar-v2-item sidebar-v2-logout"
                        title={language === "hi" ? "लॉग आउट" : "Logout"}
                    >
                        <span className="material-symbols-outlined sidebar-v2-icon">
                            logout
                        </span>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    className="sidebar-v2-label"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {language === "hi" ? "लॉग आउट" : "Logout"}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                ) : (
                    <Link
                        href="/login"
                        className={`sidebar-v2-item${pathname === "/login" ? " active" : ""}`}
                        title={language === "hi" ? "लॉग इन" : "Login"}
                    >
                        <span className="material-symbols-outlined sidebar-v2-icon">
                            login
                        </span>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    className="sidebar-v2-label"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {language === "hi" ? "लॉग इन" : "Login"}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                )}
            </div>
        </aside>
    );
}
