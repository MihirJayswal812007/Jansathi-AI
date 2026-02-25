// ===== JanSathi AI — API Client =====
// Points to either the same-origin API (monolith) or external backend (split)

import { ChatMessage, ModeName } from "@/types/modules";

// When NEXT_PUBLIC_API_URL is set, requests go to the external backend.
// When empty (default), requests go to same-origin Next.js API routes.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface ChatAPIRequest {
    message: string;
    mode: ModeName | null;
    conversationHistory: { role: "user" | "assistant"; content: string }[];
    language: "hi" | "en";
}

interface ChatAPIResponse {
    content: string;
    mode: ModeName;
    confidence: number;
    intent?: string;
    error?: string;
}

export async function sendChatMessage(
    message: string,
    mode: ModeName | null,
    history: ChatMessage[],
    language: "hi" | "en"
): Promise<ChatAPIResponse> {
    const conversationHistory = history.slice(-6).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
    }));

    const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            message,
            mode,
            conversationHistory,
            language,
        } as ChatAPIRequest),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}
