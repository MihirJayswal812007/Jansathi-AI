// ===== JanSathi AI — API Client =====
// Centralized API functions for auth, chat, admin, and analytics endpoints.

import { ChatMessage, ModeName } from "@/types/modules";

// When NEXT_PUBLIC_API_URL is set, requests go to the external backend.
// When empty (default), requests go to same-origin Next.js API routes.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// ── CSRF Token Helper ───────────────────────────────────────

/** Read the jansathi_csrf cookie so we can send it as x-csrf-token header. */
function getCSRFToken(): string {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/(?:^|;\s*)jansathi_csrf=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "";
}

/** Build headers for state-changing requests (POST, PATCH, PUT, DELETE). */
function mutationHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const csrf = getCSRFToken();
    if (csrf) headers["x-csrf-token"] = csrf;
    return headers;
}

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
        headers: mutationHeaders(),
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
        headers: mutationHeaders(),
        credentials: "include",
        body: JSON.stringify({ satisfaction }),
    });
    if (!res.ok) throw new Error(`Feedback error: ${res.status}`);
    return res.json();
}

// ── Conversation History API ────────────────────────────────

export interface ConversationSummary {
    id: string;
    mode: string;
    satisfaction: number | null;
    resolved: boolean;
    startedAt: string;
    endedAt: string | null;
    messageCount: number;
}

export interface ConversationDetail {
    id: string;
    mode: string;
    messages: Array<{ role: string; content: string; timestamp: string }>;
}

/** Fetch paginated list of user's conversations. */
export async function fetchConversations(
    page = 1
): Promise<{ data: ConversationSummary[]; pagination: { page: number; total: number; totalPages: number } }> {
    const res = await fetch(`${API_BASE}/api/user/conversations?page=${page}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Conversations API error: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Failed to load conversations");
    return { data: json.data, pagination: json.pagination };
}

/** Fetch a single conversation with all messages. */
export async function fetchConversationDetail(id: string): Promise<ConversationDetail> {
    const res = await fetch(`${API_BASE}/api/user/conversations/${id}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Conversation detail error: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Failed to load conversation");
    return json.data;
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
        headers: mutationHeaders(),
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
        headers: mutationHeaders(),
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

// ── Admin Conversation API ──────────────────────────────────

export interface AdminConversationSummary {
    id: string;
    mode: string;
    satisfaction: number | null;
    resolved: boolean;
    startedAt: string;
    endedAt: string | null;
    messageCount: number;
    userName: string | null;
}

/** Fetch admin conversation list with optional filters. */
export async function fetchAdminConversations(
    filters: { mode?: string; resolved?: string; page?: number } = {}
): Promise<{ data: AdminConversationSummary[]; pagination: { page: number; total: number; totalPages: number } }> {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.mode) params.set("mode", filters.mode);
    if (filters.resolved) params.set("resolved", filters.resolved);

    const res = await fetch(`${API_BASE}/api/admin/conversations?${params}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Admin conversations error: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Failed to load conversations");
    return { data: json.data, pagination: json.pagination };
}

/** Fetch a single conversation detail (admin). */
export async function fetchAdminConversationDetail(id: string): Promise<ConversationDetail> {
    const res = await fetch(`${API_BASE}/api/admin/conversations/${id}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Admin conversation detail error: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Failed to load conversation");
    return json.data;
}

// ── Admin User Management API ───────────────────────────────

export interface AdminUser {
    id: string;
    phone: string | null;
    email: string | null;
    name: string | null;
    role: string;
    active: boolean;
    language: string;
    village: string | null;
    district: string | null;
    state: string | null;
    lastActiveAt: string;
    createdAt: string;
    _count?: { conversations: number };
}

/** Fetch paginated list of all users (admin). */
export async function fetchAdminUsers(
    page = 1,
    search?: string
): Promise<{ data: AdminUser[]; pagination: { page: number; total: number; totalPages: number } }> {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);

    const res = await fetch(`${API_BASE}/api/admin/users?${params}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Admin users error: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Failed to load users");
    return { data: json.data, pagination: json.pagination };
}

/** Change a user's role (admin). */
export async function updateUserRole(
    userId: string,
    role: "user" | "admin"
): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: mutationHeaders(),
        credentials: "include",
        body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error(`Role update error: ${res.status}`);
    return res.json();
}

/** Toggle a user's active status (admin). */
export async function toggleUserActive(
    userId: string,
    active: boolean
): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/active`, {
        method: "PATCH",
        headers: mutationHeaders(),
        credentials: "include",
        body: JSON.stringify({ active }),
    });
    if (!res.ok) throw new Error(`Active toggle error: ${res.status}`);
    return res.json();
}

// ── Mandi Prices API ────────────────────────────────────────

export interface MandiResult {
    crop: string;
    entries: Array<{
        state: string;
        district: string;
        market: string;
        variety: string;
        minPrice: number;
        maxPrice: number;
        modalPrice: number;
    }>;
}

/** Fetch mandi prices by crop, state, or mandi name. */
export async function fetchMandiPrices(
    params: { crop?: string; state?: string; mandi?: string }
): Promise<{ results: MandiResult | MandiResult[] | null; availableCrops?: string[] }> {
    const searchParams = new URLSearchParams();
    if (params.crop) searchParams.set("crop", params.crop);
    if (params.state) searchParams.set("state", params.state);
    if (params.mandi) searchParams.set("mandi", params.mandi);

    const res = await fetch(`${API_BASE}/api/mandi?${searchParams}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Mandi API error: ${res.status}`);
    const json = await res.json();
    return { results: json.results || null, availableCrops: json.availableCrops };
}

// ── Weather API ─────────────────────────────────────────────

export interface WeatherForecast {
    current: { temp: number; humidity: number; description: string; icon: string };
    daily: Array<{
        date: string;
        tempMin: number;
        tempMax: number;
        humidity: number;
        description: string;
        icon: string;
    }>;
}

/** Fetch weather forecast by city name or coordinates. */
export async function fetchWeather(
    params: { city?: string; lat?: number; lng?: number }
): Promise<{ city: string; forecast: WeatherForecast }> {
    const searchParams = new URLSearchParams();
    if (params.city) searchParams.set("city", params.city);
    if (params.lat != null) searchParams.set("lat", String(params.lat));
    if (params.lng != null) searchParams.set("lng", String(params.lng));

    const res = await fetch(`${API_BASE}/api/weather?${searchParams}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    const json = await res.json();
    return { city: json.city, forecast: json.forecast };
}
