"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { ReactNode, MouseEvent } from "react";

interface MagicCardProps {
    children: ReactNode;
    className?: string;
    gradientSize?: number;
    gradientColor?: string;
    gradientOpacity?: number;
}

export function MagicCard({
    children,
    className = "",
    gradientSize = 200,
    gradientColor = "rgba(59, 130, 246, 0.15)",
    gradientOpacity = 0,
}: MagicCardProps) {
    const mouseX = useMotionValue(-gradientSize);
    const mouseY = useMotionValue(-gradientSize);
    const gradientBg = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 80%)`;

    function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
    }

    function handleMouseLeave() {
        mouseX.set(-gradientSize);
        mouseY.set(-gradientSize);
    }

    return (
        <div
            className={`stat-card ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ position: "relative", overflow: "hidden" }}
        >
            <motion.div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: gradientBg,
                    opacity: gradientOpacity,
                    pointerEvents: "none",
                    borderRadius: "inherit",
                }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </div>
    );
}

export default MagicCard;
