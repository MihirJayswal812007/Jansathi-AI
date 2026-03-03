// ===== JanSathi AI — App Layout Shell (v2) =====
// Wraps Sidebar + MobileBottomNav around the main content area.
// Used by the (app) route group layout so sidebar persists between chat/dashboard.

"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import { useUserStore } from "@/store/userStore";

const FONT_SIZE_MAP: Record<string, string> = {
    small: "14px",
    normal: "16px",
    large: "18px",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const fontSize = useUserStore((s) => s.fontSize);

    // Apply font size preference globally
    useEffect(() => {
        const size = FONT_SIZE_MAP[fontSize] || "16px";
        document.documentElement.style.fontSize = size;
    }, [fontSize]);

    // Persist sidebar state
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-v2-collapsed");
        if (saved === "true") setCollapsed(true);
    }, []);

    const toggleCollapsed = useCallback(() => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem("sidebar-v2-collapsed", String(next));
            return next;
        });
    }, []);

    return (
        <div className="app-layout-v2">
            <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
            <main className={`app-layout-v2-main${collapsed ? " sidebar-collapsed" : ""}`}>
                {children}
            </main>
            <MobileBottomNav />
        </div>
    );
}
