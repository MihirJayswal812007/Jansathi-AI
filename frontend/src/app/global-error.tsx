// ===== JanSathi AI — Global Error Boundary =====
// Last-resort error handler when root layout itself crashes.
// Cannot use layout.tsx styles — renders minimal standalone HTML.

"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="hi">
            <body
                style={{
                    margin: 0,
                    minHeight: "100dvh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0A0F1C",
                    color: "#E2E8F0",
                    fontFamily: "system-ui, sans-serif",
                    padding: "24px",
                }}
            >
                <div style={{ maxWidth: "400px", textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>💥</div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
                        Critical Error
                    </h1>
                    <p style={{ color: "#94A3B8", fontSize: "0.875rem", marginBottom: "24px" }}>
                        The application encountered a critical error and needs to reload.
                    </p>
                    {error.digest && (
                        <p style={{ color: "#64748B", fontSize: "0.7rem", marginBottom: "16px", fontFamily: "monospace" }}>
                            Digest: {error.digest}
                        </p>
                    )}
                    <button
                        onClick={reset}
                        style={{
                            padding: "12px 24px",
                            borderRadius: "12px",
                            border: "none",
                            background: "#3B82F6",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "1rem",
                            cursor: "pointer",
                        }}
                    >
                        Reload Application
                    </button>
                </div>
            </body>
        </html>
    );
}
