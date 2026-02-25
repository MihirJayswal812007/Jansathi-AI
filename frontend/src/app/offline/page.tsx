// ===== JanSathi AI — Offline Page =====
// Displayed when the user is offline and the page isn't cached

"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
    return (
        <div
            className="min-h-dvh flex items-center justify-center px-6"
            style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
        >
            <div className="text-center max-w-sm">
                {/* Offline icon */}
                <div
                    className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ background: "rgba(239, 68, 68, 0.12)" }}
                >
                    <WifiOff size={36} style={{ color: "var(--error)" }} />
                </div>

                {/* Title */}
                <h1
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    आप ऑफलाइन हैं
                </h1>
                <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                    You are currently offline
                </p>

                {/* Message */}
                <p
                    className="text-sm mt-4 mb-6"
                    style={{ color: "var(--text-muted)" }}
                >
                    इंटरनेट कनेक्शन जांचें और दोबारा कोशिश करें।
                    <br />
                    Please check your connection and try again.
                </p>

                {/* Retry button */}
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl text-sm font-medium"
                    style={{
                        background: "var(--janseva-primary)",
                        color: "#fff",
                    }}
                >
                    <RefreshCw size={16} />
                    Retry / दोबारा कोशिश करें
                </button>

                {/* Home link */}
                <Link
                    href="/"
                    className="block mt-4 text-xs"
                    style={{ color: "var(--text-muted)" }}
                >
                    ↩ वापस होम पेज
                </Link>

                {/* Offline capabilities hint */}
                <div
                    className="mt-8 p-4 rounded-xl text-xs text-left"
                    style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-primary)",
                    }}
                >
                    <p className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                        📱 Offline मोड में उपलब्ध:
                    </p>
                    <ul className="space-y-1" style={{ color: "var(--text-secondary)" }}>
                        <li>• पिछली बातचीत देखें</li>
                        <li>• सहेजी हुई योजनाओं की जानकारी</li>
                        <li>• दस्तावेज़ चेकलिस्ट</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
