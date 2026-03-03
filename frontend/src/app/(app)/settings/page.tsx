"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    fetchPreferences,
    updatePreferences,
    UserPreferences,
    logout,
} from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useModeStore } from "@/store/modeStore";

const FONT_SIZE_MAP: Record<string, string> = {
    small: "14px",
    normal: "16px",
    large: "18px",
};

export default function SettingsPage() {
    const router = useRouter();
    const [prefs, setPrefs] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState<string | null>(null);

    // Store setters — so changes propagate live across the app
    const setStoreLanguage = useUserStore((s) => s.setLanguage);
    const setStoreVoice = useUserStore((s) => s.setVoiceEnabled);
    const setStoreFontSize = useUserStore((s) => s.setFontSize);
    const setModeLanguage = useModeStore((s) => s.setLanguage);

    const loadPrefs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchPreferences();
            setPrefs(data);
            // Sync store from server on load
            if (data.language === "hi" || data.language === "en") {
                setStoreLanguage(data.language);
                setModeLanguage(data.language);
            }
            setStoreVoice(data.voiceEnabled);
            if (data.fontSize === "small" || data.fontSize === "normal" || data.fontSize === "large") {
                setStoreFontSize(data.fontSize);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load settings");
        } finally {
            setLoading(false);
        }
    }, [setStoreLanguage, setModeLanguage, setStoreVoice, setStoreFontSize]);

    useEffect(() => {
        loadPrefs();
    }, [loadPrefs]);

    // Apply font size to document whenever prefs change
    useEffect(() => {
        if (prefs?.fontSize && FONT_SIZE_MAP[prefs.fontSize]) {
            document.documentElement.style.fontSize = FONT_SIZE_MAP[prefs.fontSize];
        }
        return () => {
            // Reset on unmount isn't needed; font stays applied
        };
    }, [prefs?.fontSize]);

    const handleUpdate = async (key: keyof UserPreferences, value: unknown) => {
        setSaving(key);
        try {
            const updated = await updatePreferences({ [key]: value } as Partial<UserPreferences>);
            setPrefs(updated);

            // Sync changes to Zustand stores so the rest of the app updates live
            if (key === "language" && (value === "hi" || value === "en")) {
                setStoreLanguage(value);
                setModeLanguage(value);
            }
            if (key === "voiceEnabled") {
                setStoreVoice(value as boolean);
            }
            if (key === "fontSize" && (value === "small" || value === "normal" || value === "large")) {
                setStoreFontSize(value);
                document.documentElement.style.fontSize = FONT_SIZE_MAP[value];
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSaving(null);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl bg-white/5" />
                ))}
            </div>
        );
    }

    if (error && !prefs) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <div className="glass-card p-8 rounded-2xl text-center max-w-md">
                    <span className="material-symbols-outlined text-red-400 text-4xl mb-4 block">error</span>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button onClick={loadPrefs} className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!prefs) return null;

    const sections = [
        {
            icon: "mic",
            iconColor: "text-blue-400",
            title: "Voice & Audio",
            items: [
                {
                    label: "Voice Input",
                    desc: "Enable voice recognition for hands-free interaction",
                    type: "toggle" as const,
                    value: prefs.voiceEnabled,
                    prefKey: "voiceEnabled" as keyof UserPreferences,
                    onChange: () => handleUpdate("voiceEnabled", !prefs.voiceEnabled),
                },
            ],
        },
        {
            icon: "text_fields",
            iconColor: "text-violet-400",
            title: "Display",
            items: [
                {
                    label: "Font Size",
                    desc: "Adjust text readability across the app",
                    type: "segment" as const,
                    value: prefs.fontSize,
                    prefKey: "fontSize" as keyof UserPreferences,
                    options: ["small", "normal", "large"],
                    onChange: (v: string) => handleUpdate("fontSize", v),
                },
                {
                    label: "Language",
                    desc: "Default UI and chat language — changes sidebar, chat, and labels",
                    type: "segment" as const,
                    value: prefs.language,
                    prefKey: "language" as keyof UserPreferences,
                    options: [
                        { value: "hi", label: "हिंदी" },
                        { value: "en", label: "English" },
                    ],
                    onChange: (v: string) => handleUpdate("language", v),
                },
            ],
        },
        {
            icon: "shield",
            iconColor: "text-emerald-400",
            title: "Privacy & Data",
            items: [
                {
                    label: "Your Data",
                    desc: "Your conversations are stored securely and only accessible to you",
                    type: "info" as const,
                    prefKey: "voiceEnabled" as keyof UserPreferences, // unused for info
                },
            ],
        },
    ];

    return (
        <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold font-space text-white">Settings</h1>
                <p className="text-gray-400 text-sm mt-1">Customize your JanSathi experience</p>
            </motion.div>

            {sections.map((section, si) => (
                <motion.div
                    key={section.title}
                    className="glass-card p-6 rounded-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: si * 0.08 }}
                >
                    <h2 className="text-base font-semibold font-space text-white mb-4 flex items-center gap-2">
                        <span className={`material-symbols-outlined ${section.iconColor}`} style={{ fontSize: "20px" }}>{section.icon}</span>
                        {section.title}
                    </h2>
                    <div className="space-y-4">
                        {section.items.map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 settings-item-row flex-wrap gap-3">
                                <div className="flex-1 min-w-0 mr-4">
                                    <div className="text-sm font-medium text-white">{item.label}</div>
                                    <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
                                </div>
                                {item.type === "toggle" && (
                                    <button
                                        onClick={item.onChange as () => void}
                                        disabled={saving === item.prefKey}
                                        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${item.value ? "bg-blue-600" : "bg-white/10"}`}
                                    >
                                        <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${item.value ? "translate-x-5" : ""}`} />
                                    </button>
                                )}
                                {item.type === "segment" && (
                                    <div className="flex gap-1 shrink-0">
                                        {(item.options as (string | { value: string; label: string })[]).map((opt) => {
                                            const val = typeof opt === "string" ? opt : opt.value;
                                            const label = typeof opt === "string" ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt.label;
                                            return (
                                                <button
                                                    key={val}
                                                    onClick={() => (item.onChange as (v: string) => void)(val)}
                                                    disabled={saving === item.prefKey}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${item.value === val
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                                                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                                                        } disabled:opacity-50`}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {item.type === "info" && (
                                    <span className="material-symbols-outlined text-emerald-400 shrink-0" style={{ fontSize: "20px" }}>verified_user</span>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}

            {/* Account section */}
            <motion.div
                className="glass-card p-6 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-base font-semibold font-space text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400" style={{ fontSize: "20px" }}>logout</span>
                    Account
                </h2>
                <button
                    onClick={handleLogout}
                    className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
                >
                    Sign Out
                </button>
            </motion.div>

            {/* Success feedback */}
            {saving === null && !error && prefs && (
                <div className="fixed bottom-6 right-6 pointer-events-none" />
            )}

            {/* Error toast */}
            {error && (
                <motion.div
                    className="fixed bottom-6 right-6 bg-red-500/90 text-white px-5 py-3 rounded-xl shadow-lg text-sm cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setError(null)}
                >
                    {error}
                </motion.div>
            )}
        </div>
    );
}
