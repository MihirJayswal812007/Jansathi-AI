// ===== JanSathi AI — Welcome Screen =====
// Voice-first greeting + 3D robot + module grid.
// Displayed when no conversation is active.

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { useModeStore } from "@/store/modeStore";
import { InteractiveRobotSpline } from "@/components/ui/interactive-3d-robot";
import { BackgroundPaths } from "@/components/ui/background-paths";
import ModuleGrid from "./ModuleGrid";
import { ModeName } from "@/types/modules";
import { Mic, MicOff, Loader2 } from "lucide-react";

const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";

interface WelcomeScreenProps {
    onModuleSelect: (mode: ModeName) => void;
    onVoiceToggle?: () => void;
    isListening?: boolean;
    isProcessing?: boolean;
    interimTranscript?: string;
}

function getGreeting(language: "hi" | "en"): string {
    const hour = new Date().getHours();
    if (language === "hi") {
        if (hour < 12) return "सुप्रभात";
        if (hour < 17) return "नमस्कार";
        return "शुभ संध्या";
    }
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
}

export default function WelcomeScreen({
    onModuleSelect,
    onVoiceToggle,
    isListening = false,
    isProcessing = false,
    interimTranscript,
}: WelcomeScreenProps) {
    const user = useUserStore((s) => s.user);
    const { language } = useModeStore();

    const greeting = getGreeting(language);
    const userName = user?.userId ? "" : "";
    const subtitle =
        language === "hi"
            ? "आज मैं आपकी कैसे मदद कर सकता हूँ?"
            : "How can I help you today?";

    const micLabel = isProcessing
        ? language === "hi" ? "सोच रहा है..." : "Thinking..."
        : isListening
            ? language === "hi" ? "बोलिए..." : "Listening..."
            : language === "hi" ? "बोलने के लिए टैप करें" : "Tap to speak";

    return (
        <div className="welcome-screen">
            {/* Animated background paths */}
            <BackgroundPaths />

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.05),transparent_50%)] pointer-events-none" />

            <div className="welcome-screen-content">

                {/* LEFT SIDE: Greeting, Mic, Robot */}
                <div className="welcome-left">

                    {/* Greeting Header */}
                    <motion.div
                        className="welcome-greeting"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="welcome-greeting-title">
                            {greeting}{userName ? `, ${userName}` : ""}
                            <span className="inline-block animate-wave origin-bottom-right ml-2">👋</span>
                        </h1>
                        <p className="welcome-greeting-subtitle">
                            {subtitle}
                        </p>
                    </motion.div>

                    {/* Interactive Area: Mic & Robot Stack */}
                    <motion.div
                        className="welcome-interactive"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                    >
                        {/* Hero Mic Button */}
                        {onVoiceToggle && (
                            <div className="welcome-mic-area">
                                <button
                                    onClick={onVoiceToggle}
                                    disabled={isProcessing}
                                    aria-label={isListening ? "Stop listening" : "Start speaking"}
                                    aria-pressed={isListening}
                                    className={cn(
                                        "welcome-mic-btn",
                                        isListening
                                            ? "bg-indigo-500/25 border-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.4)]"
                                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105"
                                    )}
                                >
                                    {isProcessing ? (
                                        <Loader2 size={26} className="animate-spin text-white/80" />
                                    ) : isListening ? (
                                        <MicOff size={26} className="text-indigo-400" />
                                    ) : (
                                        <Mic size={26} className="text-white/80" />
                                    )}
                                </button>

                                <div className="welcome-mic-label">
                                    <p className="text-xs font-medium uppercase tracking-wider text-white/40 mb-1">
                                        {micLabel}
                                    </p>
                                    {isListening && interimTranscript && (
                                        <p className="text-sm text-white/70 italic max-w-[240px] truncate">
                                            &ldquo;{interimTranscript}&rdquo;
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3D Spline Robot — hidden on small mobile */}
                        <div className="welcome-robot">
                            <InteractiveRobotSpline
                                scene={ROBOT_SCENE_URL}
                                className="w-full h-full"
                            />
                            {/* Hide "Built with Spline" watermark */}
                            <div className="absolute bottom-0 left-0 w-full h-[60px] bg-[var(--bg-primary,#0a0a1a)] pointer-events-none z-10" />
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT SIDE: Module Grid */}
                <div className="welcome-right">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="w-full"
                    >
                        <ModuleGrid onSelect={onModuleSelect} />
                    </motion.div>
                </div>

            </div>
        </div>
    );
}

