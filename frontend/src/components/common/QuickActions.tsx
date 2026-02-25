// ===== JanSathi AI — Quick Actions Component =====

"use client";

import { motion } from "framer-motion";
import { ModeName } from "@/types/modules";
import { MODE_CONFIGS } from "@/lib/constants";
import { useModeStore } from "@/store/modeStore";

interface QuickActionsProps {
    mode: ModeName;
    onActionSelect: (query: string) => void;
}

export default function QuickActions({
    mode,
    onActionSelect,
}: QuickActionsProps) {
    const { language } = useModeStore();
    const config = MODE_CONFIGS[mode];

    return (
        <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
            {config.quickActions.map((action, index) => (
                <motion.button
                    key={index}
                    className="chip"
                    onClick={() => onActionSelect(action.query)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                        borderColor: `${config.primaryColor}30`,
                    }}
                >
                    {language === "hi" ? action.labelHi : action.label}
                </motion.button>
            ))}
        </div>
    );
}
