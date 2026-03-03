// ===== JanSathi AI — Not Found Page =====
// Custom 404 page. Uses glassmorphism design system.

"use client";

import Link from "next/link";

export default function NotFound() {
    return (
        <div
            style={{
                minHeight: "100dvh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
            }}
        >
            <div
                style={{
                    maxWidth: "400px",
                    width: "100%",
                    textAlign: "center",
                    padding: "32px 24px",
                    borderRadius: "20px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-primary)",
                }}
            >
                <div style={{ fontSize: "64px", marginBottom: "8px" }}>🔍</div>
                <h1 style={{ fontSize: "3rem", fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                    404
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "24px" }}>
                    This page doesn&apos;t exist. It may have been moved or deleted.
                </p>
                <button
                    onClick={() => window.history.back()}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 24px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
                    Go Back
                </button>
            </div>
        </div>
    );
}
