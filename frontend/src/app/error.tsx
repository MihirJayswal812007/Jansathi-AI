// ===== JanSathi AI — Error Boundary =====
// Catches runtime errors in page components. Shows recovery UI.

"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[JanSathi Error Boundary]", error);
    }, [error]);

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
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}>
                    Something went wrong
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "24px", lineHeight: 1.5 }}>
                    An unexpected error occurred. You can try again or go back to the home page.
                </p>
                {error.digest && (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginBottom: "16px", fontFamily: "monospace" }}>
                        Error ID: {error.digest}
                    </p>
                )}
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <button
                        onClick={reset}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "12px",
                            border: "none",
                            background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            cursor: "pointer",
                        }}
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        style={{
                            padding: "10px 20px",
                            borderRadius: "12px",
                            background: "var(--bg-elevated)",
                            color: "var(--text-primary)",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            textDecoration: "none",
                            display: "inline-block",
                        }}
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
