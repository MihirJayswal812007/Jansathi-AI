// ===== JanSathi AI — Chat State Store (Zustand) =====
// Persists messages and conversationId so chat survives page refresh.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatMessage, ModeName } from "@/types/modules";

interface ChatState {
    messages: ChatMessage[];
    conversationId: string | null;
    addMessage: (message: ChatMessage) => void;
    setConversationId: (id: string) => void;
    clearMessages: () => void;
    getMessagesByMode: (mode: ModeName) => ChatMessage[];
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            messages: [],
            conversationId: null,

            addMessage: (message) =>
                set((state) => ({
                    messages: [...state.messages, message],
                })),

            setConversationId: (id) => set({ conversationId: id }),

            clearMessages: () => set({ messages: [], conversationId: null }),

            getMessagesByMode: (mode) =>
                get().messages.filter((m) => m.mode === mode),
        }),
        {
            name: "jansathi-chat",
            partialize: (state) => ({
                messages: state.messages,
                conversationId: state.conversationId,
            }),
        }
    )
);
