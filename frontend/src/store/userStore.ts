// ===== JanSathi AI — User Preferences Store =====
// Zustand store with localStorage persistence for session and preferences.

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "hi" | "en";

interface UserState {
    language: Language;
    voiceEnabled: boolean;
    soundEnabled: boolean;
    sessionId: string | null;
    isAdmin: boolean;

    // Actions
    setLanguage: (lang: Language) => void;
    toggleVoice: () => void;
    toggleSound: () => void;
    setSession: (id: string, isAdmin?: boolean) => void;
    clearSession: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            language: "hi",
            voiceEnabled: true,
            soundEnabled: true,
            sessionId: null,
            isAdmin: false,

            setLanguage: (language) => set({ language }),
            toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
            toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
            setSession: (id, isAdmin = false) => set({ sessionId: id, isAdmin }),
            clearSession: () => set({ sessionId: null, isAdmin: false }),
        }),
        {
            name: "jansathi-user",
        }
    )
);
