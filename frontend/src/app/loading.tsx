// ===== JanSathi AI — Loading Indicator =====
// Shown during route transitions (Next.js Suspense boundary).

export default function Loading() {
    return (
        <div
            style={{
                minHeight: "100dvh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-primary)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                }}
            >
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        border: "3px solid var(--border-primary)",
                        borderTopColor: "#3B82F6",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}
