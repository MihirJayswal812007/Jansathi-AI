// ===== JanSathi AI — API Client =====
// Centralized API functions for auth, chat, admin, and analytics endpoints.

import { ChatMessage, ModeName } from "@/types/modules";

// When NEXT_PUBLIC_API_URL is set, requests go to the external backend.
// When empty (default), requests go to same-origin Next.js API routes.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// ── Chat API ────────────────────────────────────────────────

interface ChatAPIRequest {
    message: string;
    mode: ModeName | null;
    conversationHistory: { role: "user" | "assistant"; content: string }[];
    language: "hi" | "en";
    conversationId?: string;
}

interface ChatAPIResponse {
    content: string;
    mode: ModeName;
    confidence: number;
    intent?: string;
    conversationId?: string;
    error?: string;
}

export async function sendChatMessage(
    message: string,
    mode: ModeName | null,
    history: ChatMessage[],
    language: "hi" | "en",
    conversationId?: string
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
            ...(conversationId ? { conversationId } : {}),
        } as ChatAPIRequest),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

/** Submit satisfaction rating for a conversation. */
export async function submitFeedback(
    conversationId: string,
    satisfaction: number
): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/chat/${conversationId}/feedback`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ satisfaction }),
    });
    if (!res.ok) throw new Error(`Feedback error: ${res.status}`);
    return res.json();
}

// ── Auth API ────────────────────────────────────────────────

export interface SessionInfo {
    id: string;
    token: string;
    userId: string | null;
    role: string;
    language: string;
}

/** Check whether we have an active session. */
export async function checkSession(): Promise<{
    authenticated: boolean;
    session?: SessionInfo;
}> {
    try {
        const res = await fetch(`${API_BASE}/api/auth/session`, {
            credentials: "include",
        });
        const json = await res.json();
        return {
            authenticated: json.authenticated ?? false,
            session: json.session,
        };
    } catch {
        return { authenticated: false };
    }
}

/** Request an OTP for phone number or email. */
export async function requestOTP(identifier: string): Promise<{
    success: boolean;
    message: string;
    expiresInSeconds?: number;
    devOtp?: string;
}> {
    const res = await fetch(`${API_BASE}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier }),
    });
    return res.json();
}

/** Verify an OTP code. */
export async function verifyOTP(
    identifier: string,
    code: string
): Promise<{
    success: boolean;
    message: string;
    session?: SessionInfo;
}> {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, code }),
    });
    return res.json();
}

/** Logout and clear cookie. */
export async function logout(): Promise<void> {
    await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
    });
}

// ── User API ─────────────────────────────────────────────────────

export interface UserProfile {
    id: string;
    phone: string | null;
    email: string | null;
    name: string | null;
    role: string;
    language: string;
    village: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
    age: number | null;
    gender: string | null;
    category: string | null;
    occupation: string | null;
    createdAt: string;
    lastActiveAt: string;
}

export interface UserPreferences {
    favoriteModules: string[];
    voiceEnabled: boolean;
    fontSize: string;
    language: string;
}

/** Fetch current user's profile. */
export async function fetchProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Profile API error: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Failed to load profile");
    return json.data;
}

/** Update current user's profile fields. */
export async function updateProfile(
    data: Partial<Pick<UserProfile, "name" | "language" | "village" | "district" | "state" | "pincode" | "age" | "gender" | "category" | "occupation">>
): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Profile update error: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Failed to update profile");
    return json.data;
}

/** Fetch current user's preferences. */
export async function fetchPreferences(): Promise<UserPreferences> {
    const res = await fetch(`${API_BASE}/api/user/preferences`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Preferences API error: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Failed to load preferences");
    return json.data;
}

/** Update current user's preferences. */
export async function updatePreferences(
    data: Partial<UserPreferences>
): Promise<UserPreferences> {
    const res = await fetch(`${API_BASE}/api/user/preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Preferences update error: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Failed to update preferences");
    return json.data;
}

// ── Admin API ───────────────────────────────────────────────

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
