// ===== JanSathi AI — Mobile Menu (Slide-Over) =====
// Hamburger menu for <640px screens. Focus-trapped, backdrop-dismiss.

"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    language: string;
    isAuthenticated: boolean;
    isAdmin?: boolean;
    onLogout: () => void;
    onHomeClick: () => void;
}

interface NavItem {
    href?: string;
    label: string;
    labelHi: string;
    icon: string;
    onClick?: () => void;
    show: boolean;
}

export default function MobileMenu({
    isOpen,
    onClose,
    language,
    isAuthenticated,
    isAdmin = false,
    onLogout,
    onHomeClick,
}: MobileMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const firstFocusRef = useRef<HTMLButtonElement>(null);

    // Focus trap + escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            // Focus trap
            if (e.key === "Tab" && menuRef.current) {
                const focusable = menuRef.current.querySelectorAll<HTMLElement>(
                    'button, a, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        // Focus the close button when menu opens
        setTimeout(() => firstFocusRef.current?.focus(), 100);

        // Prevent body scroll
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    const navItems: NavItem[] = [
        {
            label: "Home",
            labelHi: "होम",
            icon: "home",
            onClick: () => { onHomeClick(); onClose(); },
            show: true,
        },
        {
            href: "/history",
            label: "History",
            labelHi: "इतिहास",
            icon: "history",
            show: isAuthenticated,
        },
        {
            href: "/dashboard",
            label: "Dashboard",
            labelHi: "डैशबोर्ड",
            icon: "dashboard",
            show: isAuthenticated && isAdmin,
        },
        {
            href: "/profile",
            label: "Profile",
            labelHi: "प्रोफ़ाइल",
            icon: "person",
            show: isAuthenticated,
        },
        {
            href: "/login",
            label: "Login",
            labelHi: "लॉग इन",
            icon: "login",
            show: !isAuthenticated,
        },
    ];

    const handleNavClick = useCallback((item: NavItem) => {
        if (item.onClick) {
            item.onClick();
        }
        onClose();
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.6)",
                            zIndex: 60,
                        }}
                        aria-hidden="true"
                    />

                    {/* Menu panel */}
                    <motion.div
                        ref={menuRef}
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={language === "hi" ? "नेविगेशन मेनू" : "Navigation menu"}
                        style={{
                            position: "fixed",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: "280px",
                            maxWidth: "85vw",
                            background: "var(--bg-primary)",
                            borderLeft: "1px solid var(--border-primary)",
                            zIndex: 70,
                            display: "flex",
                            flexDirection: "column",
                            padding: "0",
                        }}
                    >
                        {/* Menu header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "16px 20px",
                                borderBottom: "1px solid var(--border-primary)",
                            }}
                        >
                            <span
                                className="font-display"
                                style={{ fontWeight: 700, fontSize: "1.1rem" }}
                            >
                                {language === "hi" ? "मेनू" : "Menu"}
                            </span>
                            <button
                                ref={firstFocusRef}
                                onClick={onClose}
                                aria-label={language === "hi" ? "मेनू बंद करें" : "Close menu"}
                                style={{
                                    padding: "8px",
                                    borderRadius: "var(--radius-sm)",
                                    border: "none",
                                    background: "var(--bg-surface)",
                                    color: "var(--text-secondary)",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                                    close
                                </span>
                            </button>
                        </div>

                        {/* Nav items */}
                        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
                            {navItems
                                .filter((item) => item.show)
                                .map((item) => {
                                    const content = (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "14px",
                                                padding: "14px 16px",
                                                borderRadius: "var(--radius-md)",
                                                color: "var(--text-secondary)",
                                                textDecoration: "none",
                                                transition: "all 0.15s ease",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "var(--bg-surface)";
                                                e.currentTarget.style.color = "var(--text-primary)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "transparent";
                                                e.currentTarget.style.color = "var(--text-secondary)";
                                            }}
                                        >
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ fontSize: "22px" }}
                                            >
                                                {item.icon}
                                            </span>
                                            <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                                                {language === "hi" ? item.labelHi : item.label}
                                            </span>
                                        </div>
                                    );

                                    if (item.href) {
                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                onClick={() => handleNavClick(item)}
                                                style={{ textDecoration: "none" }}
                                            >
                                                {content}
                                            </Link>
                                        );
                                    }

                                    return (
                                        <button
                                            key={item.label}
                                            onClick={() => handleNavClick(item)}
                                            style={{
                                                width: "100%",
                                                border: "none",
                                                background: "transparent",
                                                textAlign: "left",
                                            }}
                                        >
                                            {content}
                                        </button>
                                    );
                                })}

                            {/* Logout button (separated) */}
                            {isAuthenticated && (
                                <button
                                    onClick={() => { onLogout(); onClose(); }}
                                    style={{
                                        width: "100%",
                                        border: "none",
                                        background: "transparent",
                                        textAlign: "left",
                                        marginTop: "8px",
                                        borderTop: "1px solid var(--border-primary)",
                                        paddingTop: "12px",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "14px",
                                            padding: "14px 16px",
                                            borderRadius: "var(--radius-md)",
                                            color: "#EF4444",
                                            cursor: "pointer",
                                            transition: "all 0.15s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                                            logout
                                        </span>
                                        <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                                            {language === "hi" ? "लॉग आउट" : "Logout"}
                                        </span>
                                    </div>
                                </button>
                            )}
                        </nav>

                        {/* Bottom: Language toggle */}
                        <div
                            style={{
                                padding: "16px 20px",
                                borderTop: "1px solid var(--border-primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                {language === "hi" ? "भाषा" : "Language"}
                            </span>
                            <LanguageSwitcher />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
