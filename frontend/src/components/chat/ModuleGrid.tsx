// ===== JanSathi AI — Module Grid (Voice-First Stitch Redesign) =====
// Glassmorphism cards with neon-border hover, inspired by Stitch designs.
// Voice-first: hero mic button centered above the module cards.

"use client";

import { motion } from "framer-motion";
import { ModeName } from "@/types/modules";
import { MODE_CONFIGS, ALL_MODES } from "@/lib/constants";
import { useModeStore } from "@/store/modeStore";

const MODE_MATERIAL_ICONS: Record<ModeName, string> = {
    janseva: "account_balance",
    janshiksha: "school",
    jankrishi: "agriculture",
    janvyapar: "storefront",
    jankaushal: "rocket_launch",
};

// Short descriptions for each module card
const MODE_SHORT_DESC: Record<ModeName, { en: string; hi: string }> = {
    janseva: { en: "Access government schemes and civic services.", hi: "सरकारी योजनाएं और नागरिक सेवाएं।" },
    janshiksha: { en: "Personalized learning paths and resources.", hi: "व्यक्तिगत शिक्षा और संसाधन।" },
    jankrishi: { en: "Crop advisory, weather, and market prices.", hi: "फसल सलाह, मौसम और बाजार भाव।" },
    janvyapar: { en: "Local marketplace for rural products.", hi: "ग्रामीण उत्पादों का बाज़ार।" },
    jankaushal: { en: "Vocational training and job matching.", hi: "व्यावसायिक प्रशिक्षण और नौकरी।" },
};

interface ModuleGridProps {
    onSelect: (mode: ModeName) => void;
}

export default function ModuleGrid({ onSelect }: ModuleGridProps) {
    const { language } = useModeStore();
    const isHi = language === "hi";
    const topRow = ALL_MODES.slice(0, 3); // JanSeva, JanShiksha, JanKrishi
    const bottomRow = ALL_MODES.slice(3);  // JanVyapar, JanKaushal

    return (
        <div className="flex flex-col w-full max-w-xl mx-auto px-4 lg:px-0">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-8">
                <span className="h-px w-8 bg-indigo-500/60" />
                <h3 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                    {isHi ? "शुरू करने के लिए एक मॉड्यूल चुनें" : "Choose a Module to Get Started"}
                </h3>
            </div>

            {/* 2x3 Grid for Module Cards (2 columns on left, 3 rows tall) */}
            <ul
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 w-full"
                role="group"
                aria-label={isHi ? "मॉड्यूल चुनें" : "Choose a module"}
            >
                {ALL_MODES.map((modeId, index) => {
                    // Make the 5th card (JanKaushal) span both columns on small screens if we want,
                    // but on a clean 2x3 grid, leaving an empty spot is also elegant.
                    // For now let's just let it flow naturally into the odd slot.
                    return (
                        <ModuleCard
                            key={modeId}
                            modeId={modeId}
                            index={index}
                            isHi={isHi}
                            onSelect={onSelect}
                            className="w-full flex"
                        />
                    );
                })}
            </ul>
        </div>
    );
}

import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

function ModuleCard({
    modeId,
    index,
    isHi,
    onSelect,
    className,
}: {
    modeId: ModeName;
    index: number;
    isHi: boolean;
    onSelect: (mode: ModeName) => void;
    className?: string;
}) {
    const config = MODE_CONFIGS[modeId];
    const icon = MODE_MATERIAL_ICONS[modeId];
    const desc = MODE_SHORT_DESC[modeId];

    return (
        <motion.li
            className={cn("module-grid-item list-none h-full", className)}
            onClick={() => onSelect(modeId)}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay: 0.3 + index * 0.08,
                duration: 0.35,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{ cursor: "pointer", width: "100%", height: "100%" }}
            role="button"
            aria-label={`${isHi ? config.nameHi : config.name}: ${isHi ? config.descriptionHi : config.description}`}
        >
            <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-[#1e1a38] p-1.5 md:p-2 transition-transform hover:scale-105 duration-300">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />

                <div
                    className="relative flex h-full flex-col justify-start gap-2.5 overflow-hidden rounded-[1rem] border-[0.75px] p-4 shadow-sm"
                    style={{
                        backgroundColor: config.surfaceColor,
                        borderColor: "rgba(255,255,255,0.05)"
                    }}
                >
                    <div className="relative flex flex-1 flex-col justify-start gap-1">
                        {/* Icon circle */}
                        <div
                            className="w-fit rounded-full border border-white/10 p-2.5 mb-1"
                            style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ color: config.primaryColor, fontSize: "24px" }}
                                aria-hidden="true"
                            >
                                {icon}
                            </span>
                        </div>

                        <div className="space-y-0.5">
                            {/* Name */}
                            <h3 className="pt-0.5 text-lg font-bold tracking-tight text-white mb-0.5 truncate">
                                {isHi ? config.nameHi : config.name}
                            </h3>

                            {/* Tagline */}
                            <p className="text-xs font-semibold opacity-85 truncate" style={{ color: config.primaryColor }}>
                                {isHi ? config.taglineHi : config.tagline}
                            </p>

                            {/* Short description */}
                            <p className="text-xs text-muted-foreground opacity-70 mt-1 leading-snug line-clamp-2">
                                {isHi ? desc.hi : desc.en}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.li>
    );
}

