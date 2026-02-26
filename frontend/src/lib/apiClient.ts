// ===== JanSathi AI — API Client =====
// Centralized API functions for chat, admin, and analytics endpoints.

import { ChatMessage, ModeName } from "@/types/modules";

// When NEXT_PUBLIC_API_URL is set, requests go to the external backend.
// When empty (default), requests go to same-origin Next.js API routes.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || "";

// ── Chat API ────────────────────────────────────────────────

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

// ── Admin API ───────────────────────────────────────────────

/** Ensure we have an admin session via cookie. Returns true if admin. */
export async function ensureAdminSession(): Promise<boolean> {
    try {
        // Step 1: Create or retrieve session
        await fetch(`${API_BASE}/api/auth/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({}),
        });

        // Step 2: Promote to admin using secret
        if (ADMIN_SECRET) {
            const promoRes = await fetch(`${API_BASE}/api/auth/session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ adminSecret: ADMIN_SECRET }),
            });
            const promoData = await promoRes.json();
            return promoData.promoted === true || promoData.session?.role === "admin";
        }
        return false;
    } catch {
        return false;
    }
}

/** Dashboard stats from the admin endpoint. */
export interface DashboardData {
    totalUsers: number;
    activeUsersToday: number;
    totalConversations: number;
    avgResponseTimeMs: number;
    moduleUsage: Record<string, number>;
    languageSplit: { hi: number; en: number };
    topIntents: { intent: string; count: number }[];
    dailyActiveUsers: { date: string; count: number }[];
    satisfactionAvg: number;
    resolvedRate: number;
}

export async function fetchDashboardStats(): Promise<DashboardData> {
    const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
        credentials: "include",
    });

    if (!res.ok) throw new Error(`Dashboard API error: ${res.status}`);

    const json = await res.json();
    if (!json.success || !json.data) {
        throw new Error(json.error?.message || "Failed to load dashboard");
    }
    return json.data;
}

/** Trend data from the admin trends endpoint. */
export interface TrendData {
    snapshots: Array<{
        date: string;
        activeUsers: number;
        newConversations: number;
        satisfactionAvg: number;
        resolvedRate: number;
        moduleUsage: Record<string, number>;
    }>;
    deltas: {
        activeUsers: number;
        conversations: number;
        satisfaction: number;
        resolvedRate: number;
    };
}

export async function fetchTrends(days = 7): Promise<TrendData> {
    const res = await fetch(`${API_BASE}/api/admin/trends?days=${days}`, {
        credentials: "include",
    });

    if (!res.ok) throw new Error(`Trends API error: ${res.status}`);

    const json = await res.json();
    if (!json.success || !json.data) {
        throw new Error(json.error?.message || "Failed to load trends");
    }
    return json.data;
}
