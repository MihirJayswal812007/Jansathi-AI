"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
    error?: Error | string;
    onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
    const message = typeof error === "string" ? error : error?.message || "Something went wrong";

    return (
        <div className="error-fallback" role="alert">
            <div className="error-fallback-icon">
                <AlertCircle size={24} />
            </div>
            <h3 className="font-display" style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                Oops! Something went wrong
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "400px" }}>
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="landing-btn landing-btn-secondary"
                    style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
            )}
        </div>
    );
}

export default ErrorFallback;
