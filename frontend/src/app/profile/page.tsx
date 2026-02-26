// ===== JanSathi AI — User Profile Page =====
// View and edit profile + preferences. Protected by AuthGuard.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    User,
    MapPin,
    Phone,
    Mail,
    Save,
    ArrowLeft,
    Loader2,
    Check,
    Briefcase,
} from "lucide-react";
import AuthGuard from "@/components/common/AuthGuard";
import {
    fetchProfile,
    updateProfile,
    type UserProfile,
} from "@/lib/apiClient";

type EditableField = keyof Pick<
    UserProfile,
    "name" | "village" | "district" | "state" | "pincode" | "age" | "gender" | "category" | "occupation"
>;

const FIELD_CONFIG: {
    key: EditableField;
    label: string;
    labelHi: string;
    type: "text" | "number" | "select";
    options?: string[];
    section: "identity" | "location" | "demographics";
}[] = [
        { key: "name", label: "Full Name", labelHi: "पूरा नाम", type: "text", section: "identity" },
        { key: "village", label: "Village / Town", labelHi: "गाँव / शहर", type: "text", section: "location" },
        { key: "district", label: "District", labelHi: "जिला", type: "text", section: "location" },
        { key: "state", label: "State", labelHi: "राज्य", type: "text", section: "location" },
        { key: "pincode", label: "Pincode", labelHi: "पिनकोड", type: "text", section: "location" },
        { key: "age", label: "Age", labelHi: "उम्र", type: "number", section: "demographics" },
        { key: "gender", label: "Gender", labelHi: "लिंग", type: "select", options: ["male", "female", "other"], section: "demographics" },
        { key: "category", label: "Category", labelHi: "श्रेणी", type: "text", section: "demographics" },
        { key: "occupation", label: "Occupation", labelHi: "व्यवसाय", type: "text", section: "demographics" },
    ];

function ProfileField({
    label,
    value,
    editing,
    type,
    options,
    onChange,
}: {
    label: string;
    value: string;
    editing: boolean;
    type: "text" | "number" | "select";
    options?: string[];
    onChange: (val: string) => void;
}) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: "var(--border-primary)" }}>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {label}
            </span>
            {editing ? (
                type === "select" ? (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="text-sm text-right px-2 py-1 rounded-lg outline-none"
                        style={{
                            background: "var(--bg-elevated)",
                            color: "var(--text-primary)",
                            border: "1px solid #3B82F6",
                        }}
                    >
                        <option value="">—</option>
                        {options?.map((o) => (
                            <option key={o} value={o}>
                                {o.charAt(0).toUpperCase() + o.slice(1)}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="text-sm text-right px-2 py-1 rounded-lg outline-none w-40"
                        style={{
                            background: "var(--bg-elevated)",
                            color: "var(--text-primary)",
                            border: "1px solid #3B82F6",
                        }}
                    />
                )
            ) : (
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {value || "—"}
                </span>
            )}
        </div>
    );
}

function SectionCard({
    title,
    icon,
    children,
    delay,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    delay: number;
}) {
    return (
        <motion.div
            className="p-4 rounded-2xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-primary)",
            }}
        >
            <div className="flex items-center gap-2 mb-3">
                {icon}
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {title}
                </h3>
            </div>
            {children}
        </motion.div>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [draft, setDraft] = useState<Record<string, string>>({});
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchProfile();
                setProfile(data);
                setDraft(
                    Object.fromEntries(
                        FIELD_CONFIG.map((f) => [f.key, String(data[f.key] ?? "")])
                    )
                );
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load profile");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            // Build only changed fields
            const changes: Record<string, unknown> = {};
            for (const field of FIELD_CONFIG) {
                const newVal = draft[field.key];
                const oldVal = String(profile?.[field.key] ?? "");
                if (newVal !== oldVal && newVal !== "") {
                    changes[field.key] = field.type === "number" ? Number(newVal) : newVal;
                }
            }

            if (Object.keys(changes).length === 0) {
                setEditing(false);
                return;
            }

            const updated = await updateProfile(changes);
            setProfile(updated);
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        { key: "identity" as const, title: "Identity", icon: <User size={16} style={{ color: "#3B82F6" }} /> },
        { key: "location" as const, title: "Location", icon: <MapPin size={16} style={{ color: "#10B981" }} /> },
        { key: "demographics" as const, title: "Demographics", icon: <Briefcase size={16} style={{ color: "#8B5CF6" }} /> },
    ];

    return (
        <AuthGuard>
            <div
                className="min-h-dvh px-4 py-6"
                style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
            >
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => router.push("/")}
                            className="flex items-center gap-1 text-sm"
                            style={{ color: "var(--text-muted)" }}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        {!editing ? (
                            <button
                                onClick={() => setEditing(true)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{
                                    background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                                    color: "white",
                                }}
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        // Reset draft
                                        if (profile) {
                                            setDraft(
                                                Object.fromEntries(
                                                    FIELD_CONFIG.map((f) => [f.key, String(profile[f.key] ?? "")])
                                                )
                                            );
                                        }
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs"
                                    style={{ color: "var(--text-muted)", background: "var(--bg-surface)" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                                    style={{
                                        background: "#10B981",
                                        color: "white",
                                        opacity: saving ? 0.5 : 1,
                                    }}
                                >
                                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                    Save
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Avatar + Name */}
                    <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3"
                            style={{
                                background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                            }}
                        >
                            <span className="text-3xl text-white font-bold">
                                {profile?.name?.[0]?.toUpperCase() || "?"}
                            </span>
                        </div>
                        <h1 className="text-xl font-bold">{profile?.name || "User"}</h1>
                        <div className="flex items-center justify-center gap-3 mt-1">
                            {profile?.phone && (
                                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                                    <Phone size={12} /> {profile.phone}
                                </span>
                            )}
                            {profile?.email && (
                                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                                    <Mail size={12} /> {profile.email}
                                </span>
                            )}
                        </div>
                    </motion.div>

                    {/* Success toast */}
                    {saved && (
                        <motion.div
                            className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: "#10B98120", color: "#10B981", border: "1px solid #10B98140" }}
                        >
                            <Check size={16} /> Profile updated successfully
                        </motion.div>
                    )}

                    {/* Error */}
                    {error && (
                        <div
                            className="p-3 rounded-xl mb-4 text-sm"
                            style={{ background: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                        </div>
                    ) : profile ? (
                        <div className="flex flex-col gap-4">
                            {sections.map((section, i) => (
                                <SectionCard key={section.key} title={section.title} icon={section.icon} delay={0.1 + i * 0.08}>
                                    {FIELD_CONFIG.filter((f) => f.section === section.key).map((field) => (
                                        <ProfileField
                                            key={field.key}
                                            label={field.label}
                                            value={draft[field.key] || ""}
                                            editing={editing}
                                            type={field.type}
                                            options={field.options}
                                            onChange={(val) => setDraft((d) => ({ ...d, [field.key]: val }))}
                                        />
                                    ))}
                                </SectionCard>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </AuthGuard>
    );
}
