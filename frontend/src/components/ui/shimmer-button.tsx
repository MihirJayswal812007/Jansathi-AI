"use client";

import type { ReactNode, CSSProperties } from "react";

interface ShimmerButtonProps {
    children: ReactNode;
    className?: string;
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    onClick?: () => void;
    style?: CSSProperties;
}

export function ShimmerButton({
    children,
    className = "",
    shimmerColor = "rgba(255, 255, 255, 0.2)",
    shimmerSize = "0.1em",
    borderRadius = "9999px",
    shimmerDuration = "2s",
    background = "linear-gradient(135deg, #3B82F6, #8B5CF6)",
    onClick,
    style,
}: ShimmerButtonProps) {
    return (
        <button
            className={`shimmer-btn ${className}`}
            onClick={onClick}
            style={{
                borderRadius,
                background,
                ...style,
            }}
        >
            <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                {children}
            </span>
        </button>
    );
}

export default ShimmerButton;
