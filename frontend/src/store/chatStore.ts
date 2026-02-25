// ===== JanSathi AI — Chat State Store (Zustand) =====

import { create } from "zustand";
import { ChatMessage, ModeName } from "@/types/modules";

interface ChatState {
    messages: ChatMessage[];
    addMessage: (message: ChatMessage) => void;
    clearMessages: () => void;
    getMessagesByMode: (mode: ModeName) => ChatMessage[];
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],

    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),

    clearMessages: () => set({ messages: [] }),

    getMessagesByMode: (mode) =>
        get().messages.filter((m) => m.mode === mode),
}));
