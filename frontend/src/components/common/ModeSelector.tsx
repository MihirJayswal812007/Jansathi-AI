// ===== JanSathi AI — Mode Selector V2 (Stitch Bento Grid) =====
// Bento-box layout: first two cards span 3 cols, bottom three span 2 cols
// Glassmorphic cards with color-coded left borders · Material Symbols icons
// Enhanced with 21st.dev GlowingEffect for interactive border glow

"use client";

import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ModeName } from "@/types/modules";
import { MODE_CONFIGS, ALL_MODES } from "@/lib/constants";
import { useModeStore } from "@/store/modeStore";
import { GlowingEffect } from "@/components/ui/glowing-effect";

// Material Symbols icon mapping per module
const MODE_MATERIAL_ICONS: Record<ModeName, string> = {
    janseva: "account_balance",
    janshiksha: "school",
    jankrishi: "potted_plant",
    janvyapar: "trending_up",
    jankaushal: "rocket_launch",
};

interface ModeSelectorProps {
    onModeSelect?: (mode: ModeName) => void;
}

export default function ModeSelector({ onModeSelect }: ModeSelectorProps) {
    const { activeMode, setActiveMode, language } = useModeStore();
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSelect = useCallback(
        (mode: ModeName) => {
            setActiveMode(mode);
            onModeSelect?.(mode);
        },
        [setActiveMode, onModeSelect]
    );

    // Keyboard navigation — arrow keys to move between modes
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, currentIndex: number) => {
            let nextIndex: number | null = null;

            switch (e.key) {
                case "ArrowRight":
                case "ArrowDown":
                    nextIndex = (currentIndex + 1) % ALL_MODES.length;
                    break;
                case "ArrowLeft":
                case "ArrowUp":
                    nextIndex = (currentIndex - 1 + ALL_MODES.length) % ALL_MODES.length;
                    break;
                case "Home":
                    nextIndex = 0;
                    break;
                case "End":
                    nextIndex = ALL_MODES.length - 1;
                    break;
                default:
                    return;
            }

            e.preventDefault();
            handleSelect(ALL_MODES[nextIndex]);

            const buttons =
                containerRef.current?.querySelectorAll<HTMLButtonElement>(
                    "[role='radio']"
                );
            buttons?.[nextIndex]?.focus();
        },
        [handleSelect]
    );

    return (
        <div
            ref={containerRef}
            className="mode-cards-grid"
            role="radiogroup"
            aria-label={language === "hi" ? "मॉड्यूल चुनें" : "Select module"}
        >
            {ALL_MODES.map((modeId, index) => {
                const config = MODE_CONFIGS[modeId];
                const isActive = activeMode === modeId;
                const materialIcon = MODE_MATERIAL_ICONS[modeId];

                return (
                    <motion.button
                        key={modeId}
                        data-mode={modeId}
                        onClick={() => handleSelect(modeId)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`mode-card relative ${isActive ? "active" : ""}`}
                        style={
                            isActive
                                ? {
                                    borderColor: config.primaryColor,
                                    background: config.surfaceColor,
                                }
                                : undefined
                        }
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        role="radio"
                        aria-checked={isActive}
                        aria-label={`${language === "hi" ? config.nameHi : config.name}: ${language === "hi" ? config.taglineHi : config.tagline}`}
                        tabIndex={isActive || (!activeMode && index === 0) ? 0 : -1}
                    >
                        {/* 21st.dev Glowing Effect — mouse-tracking border glow */}
                        <GlowingEffect
                            spread={40}
                            glow
                            disabled={false}
                            proximity={64}
                            inactiveZone={0.01}
                            borderWidth={3}
                        />

                        {/* Icon with module-colored background */}
                        <div
                            className="mode-icon-wrap relative z-10"
                            style={{
                                background: `${config.primaryColor}20`,
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    color: config.primaryColor,
                                    fontSize: "28px",
                                }}
                                aria-hidden="true"
                            >
                                {materialIcon}
                            </span>
                        </div>

                        {/* Name */}
                        <span
                            className="mode-name relative z-10"
                            style={isActive ? { color: config.primaryColor } : undefined}
                        >
                            {language === "hi" ? config.nameHi : config.name}
                        </span>

                        {/* Tagline */}
                        <span className="mode-tagline relative z-10">
                            {language === "hi" ? config.taglineHi : config.tagline}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
