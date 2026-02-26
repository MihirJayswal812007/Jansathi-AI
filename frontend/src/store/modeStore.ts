// ===== JanSathi AI — Mode State Store (Zustand) =====
// Persists language preference only. Transient state (mode, listening, processing) resets on refresh.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language, ModeName } from "@/types/modules";

interface ModeState {
    activeMode: ModeName | null;
    language: Language;
    isListening: boolean;
    isProcessing: boolean;
    setActiveMode: (mode: ModeName | null) => void;
    setLanguage: (lang: Language) => void;
    setIsListening: (listening: boolean) => void;
    setIsProcessing: (processing: boolean) => void;
    toggleLanguage: () => void;
}

export const useModeStore = create<ModeState>()(
    persist(
        (set) => ({
            activeMode: null,
            language: "hi",
            isListening: false,
            isProcessing: false,
            setActiveMode: (mode) => set({ activeMode: mode }),
            setLanguage: (lang) => set({ language: lang }),
            setIsListening: (listening) => set({ isListening: listening }),
            setIsProcessing: (processing) => set({ isProcessing: processing }),
            toggleLanguage: () =>
                set((state) => ({ language: state.language === "hi" ? "en" : "hi" })),
        }),
        {
            name: "jansathi-mode",
            partialize: (state) => ({ language: state.language }),
        }
    )
);
