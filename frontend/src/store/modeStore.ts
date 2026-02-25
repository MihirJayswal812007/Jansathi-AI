// ===== JanSathi AI — Mode State Store (Zustand) =====

import { create } from "zustand";
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

export const useModeStore = create<ModeState>((set) => ({
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
}));
