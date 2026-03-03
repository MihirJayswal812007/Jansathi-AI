// ===== JanSathi AI — Iridescent Orb (CSS + Framer Motion) =====
// Pure CSS/Framer Motion animated orb — NO WebGL/Three.js.
// Inspired by Axora's centered iridescent sphere.

"use client";

import { motion } from "framer-motion";

interface IridescentOrbProps {
    size?: number;
    isActive?: boolean;
    onClick?: () => void;
}

export default function IridescentOrb({
    size = 160,
    isActive = false,
    onClick,
}: IridescentOrbProps) {
    return (
        <div
            className="iridescent-orb-wrapper"
            style={{ width: size * 1.8, height: size * 1.8 }}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-label={onClick ? "Start conversation" : undefined}
        >
            {/* Ambient glow */}
            <div
                className={`iridescent-orb-glow${isActive ? " active" : ""}`}
                style={{ width: size * 1.6, height: size * 1.6 }}
            />

            {/* Outer rotating ring 1 */}
            <motion.div
                className={`iridescent-orb-ring${isActive ? " active" : ""}`}
                style={{ width: size * 1.3, height: size * 1.3 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />

            {/* Outer rotating ring 2 (counter) */}
            <motion.div
                className={`iridescent-orb-ring ring-2${isActive ? " active" : ""}`}
                style={{ width: size * 1.15, height: size * 1.15 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />

            {/* Core sphere */}
            <motion.div
                className={`iridescent-orb-core${isActive ? " active" : ""}`}
                style={{ width: size, height: size }}
                animate={
                    isActive
                        ? { scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }
                        : { scale: [1, 1.03, 1] }
                }
                transition={{
                    duration: isActive ? 2 : 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                {/* Inner gradient shimmer */}
                <div className="iridescent-orb-shimmer" />
            </motion.div>

            {/* Pulse rings when active */}
            {isActive && (
                <>
                    <motion.div
                        className="iridescent-orb-pulse"
                        style={{ width: size, height: size }}
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                        className="iridescent-orb-pulse"
                        style={{ width: size, height: size }}
                        initial={{ scale: 1, opacity: 0.3 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                    />
                </>
            )}
        </div>
    );
}
