"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    fetchProfile,
    updateProfile,
    fetchPreferences,
    updatePreferences,
    UserProfile,
    UserPreferences,
} from "@/lib/apiClient";

const FIELD_CONFIG = [
    { key: "name", label: "Full Name", labelHi: "पूरा नाम", type: "text" },
    { key: "village", label: "Village", labelHi: "गांव", type: "text" },
    { key: "district", label: "District", labelHi: "जिला", type: "text" },
    { key: "state", label: "State", labelHi: "राज्य", type: "text" },
    { key: "pincode", label: "Pincode", labelHi: "पिनकोड", type: "text" },
    { key: "age", label: "Age", labelHi: "उम्र", type: "number" },
    {
        key: "gender",
        label: "Gender",
        labelHi: "लिंग",
        type: "select",
        options: ["male", "female", "other"],
    },
    {
        key: "category",
        label: "Category",
        labelHi: "श्रेणी",
        type: "select",
        options: ["General", "SC", "ST", "OBC", "Minority"],
    },
    { key: "occupation", label: "Occupation", labelHi: "व्यवसाय", type: "text" },
] as const;

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [prefs, setPrefs] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [p, pr] = await Promise.all([fetchProfile(), fetchPreferences()]);
            setProfile(p);
            setPrefs(pr);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleEdit = (key: string, currentValue: string | number | null) => {
        setEditingField(key);
        setEditValue(currentValue?.toString() || "");
    };

    const handleSave = async (key: string) => {
        setSaving(true);
        try {
            const value = key === "age" ? (editValue ? parseInt(editValue) : null) : editValue || null;
            const updated = await updateProfile({ [key]: value } as Partial<UserProfile>);
            setProfile(updated);
            setEditingField(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handlePrefToggle = async (key: keyof UserPreferences, value: unknown) => {
        try {
            const updated = await updatePreferences({ [key]: value } as Partial<UserPreferences>);
            setPrefs(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Preference save failed");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full animate-pulse">
                <div className="h-48 rounded-2xl bg-white/5" />
                <div className="h-64 rounded-2xl bg-white/5" />
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <div className="glass-card p-8 rounded-2xl text-center max-w-md">
                    <span className="material-symbols-outlined text-red-400 text-4xl mb-4 block">error</span>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button onClick={loadData} className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const initials = (profile.name || profile.phone || "U").slice(0, 2).toUpperCase();

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
            {/* Profile Header Card */}
            <motion.div
                className="glass-card p-6 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex items-center gap-6 profile-header-flex">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold font-space shrink-0 shadow-lg shadow-blue-500/20 profile-avatar">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold font-space text-white truncate">
                            {profile.name || "No name set"}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {profile.phone || profile.email || "No contact info"}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${profile.role === "admin" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"}`}>
                                {profile.role}
                            </span>
                            <span className="text-xs text-gray-500">
                                Member since {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Profile Fields */}
            <motion.div
                className="glass-card p-6 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <h2 className="text-lg font-semibold font-space text-white mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400" style={{ fontSize: "20px" }}>person</span>
                    Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FIELD_CONFIG.map((field) => {
                        const value = profile[field.key as keyof UserProfile];
                        const isEditing = editingField === field.key;

                        return (
                            <div key={field.key} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium block mb-2">
                                    {field.label}
                                </label>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        {field.type === "select" ? (
                                            <select
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">—</option>
                                                {field.options.map((opt) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                                autoFocus
                                            />
                                        )}
                                        <button
                                            onClick={() => handleSave(field.key)}
                                            disabled={saving}
                                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check</span>
                                        </button>
                                        <button
                                            onClick={() => setEditingField(null)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="text-white text-sm">
                                            {value?.toString() || <span className="text-gray-500 italic">Not set</span>}
                                        </span>
                                        <button
                                            onClick={() => handleEdit(field.key, value as string | number | null)}
                                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-blue-400 transition-colors"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Preferences */}
            {prefs && (
                <motion.div
                    className="glass-card p-6 rounded-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <h2 className="text-lg font-semibold font-space text-white mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-violet-400" style={{ fontSize: "20px" }}>tune</span>
                        Preferences
                    </h2>
                    <div className="space-y-4">
                        {/* Voice toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 settings-item-row flex-wrap gap-3">
                            <div>
                                <div className="text-sm font-medium text-white">Voice Input</div>
                                <div className="text-xs text-gray-400 mt-1">Enable voice recognition for chat</div>
                            </div>
                            <button
                                onClick={() => handlePrefToggle("voiceEnabled", !prefs.voiceEnabled)}
                                className={`relative w-12 h-7 rounded-full transition-colors ${prefs.voiceEnabled ? "bg-blue-600" : "bg-white/10"}`}
                            >
                                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${prefs.voiceEnabled ? "translate-x-5" : ""}`} />
                            </button>
                        </div>

                        {/* Font size */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 settings-item-row flex-wrap gap-3">
                            <div>
                                <div className="text-sm font-medium text-white">Font Size</div>
                                <div className="text-xs text-gray-400 mt-1">Adjust text size throughout the app</div>
                            </div>
                            <div className="flex gap-1">
                                {["small", "normal", "large"].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => handlePrefToggle("fontSize", size)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${prefs.fontSize === size ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
                                    >
                                        {size.charAt(0).toUpperCase() + size.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 settings-item-row flex-wrap gap-3">
                            <div>
                                <div className="text-sm font-medium text-white">Language</div>
                                <div className="text-xs text-gray-400 mt-1">Default language for chat and UI</div>
                            </div>
                            <div className="flex gap-1">
                                {[{ value: "hi", label: "हिंदी" }, { value: "en", label: "English" }].map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => handlePrefToggle("language", value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${prefs.language === value ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Error toast */}
            {error && (
                <motion.div
                    className="fixed bottom-6 right-6 bg-red-500/90 text-white px-5 py-3 rounded-xl shadow-lg text-sm"
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
