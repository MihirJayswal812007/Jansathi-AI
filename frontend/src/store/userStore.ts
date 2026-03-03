// ===== JanSathi AI — User Store =====
// Zustand store. Only UI preferences are persisted to localStorage.
// Auth state (isAuthenticated, user) is ephemeral — always fetched fresh from server.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SessionInfo } from "@/lib/apiClient";

type Language = "hi" | "en";

// ── Persisted slice — UI preferences only ────────────────────
type FontSize = "small" | "normal" | "large";

interface PersistedState {
    language: Language;
    voiceEnabled: boolean;
    soundEnabled: boolean;
    fontSize: FontSize;
}

// ── Ephemeral slice — server-derived auth state ───────────────
// These fields are intentionally NOT in the persist partialize list.
// They reset to defaults on every page load, then populated by AuthProvider.
interface AuthState {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    user: SessionInfo | null;
}

// ── Actions ───────────────────────────────────────────────────
interface Actions {
    setLanguage: (lang: Language) => void;
    toggleVoice: () => void;
    toggleSound: () => void;
    setFontSize: (size: FontSize) => void;
    setVoiceEnabled: (enabled: boolean) => void;
    // Auth actions
    setAuth: (user: SessionInfo) => void;
    clearAuth: () => void;
    setAuthLoading: (loading: boolean) => void;
}

type UserState = PersistedState & AuthState & Actions;

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            // ── Persisted prefs ──────────────────────────────
            language: "hi",
            voiceEnabled: true,
            soundEnabled: true,
            fontSize: "normal" as FontSize,

            // ── Ephemeral auth (reset on every page load) ────
            isAuthenticated: false,
            isAdmin: false,
            isLoading: true, // true until AuthProvider resolves
            user: null,

            // ── Pref actions ─────────────────────────────────
            setLanguage: (language) => set({ language }),
            toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
            toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
            setFontSize: (fontSize) => set({ fontSize }),
            setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),

            // ── Auth actions ──────────────────────────────────
            setAuth: (user) =>
                set({
                    isAuthenticated: !!user.userId,
                    isAdmin: user.role === "admin",
                    user,
                    isLoading: false,
                }),
            clearAuth: () =>
                set({
                    isAuthenticated: false,
                    isAdmin: false,
                    user: null,
                    isLoading: false,
                }),
            setAuthLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: "jansathi-user",
            storage: createJSONStorage(() => localStorage),
            // Only persist UI preferences — auth state is always server-fetched
            partialize: (state) => ({
                language: state.language,
                voiceEnabled: state.voiceEnabled,
                soundEnabled: state.soundEnabled,
                fontSize: state.fontSize,
            }),
        }
    )
);
