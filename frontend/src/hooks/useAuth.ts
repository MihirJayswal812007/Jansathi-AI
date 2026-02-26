// ===== JanSathi AI — useAuth Hook =====
// Thin selector over the global Zustand auth state.
// All auth state lives in userStore — no local useState here.
// AuthProvider (in ClientShell) is responsible for initial session fetch.

"use client";

import { useCallback } from "react";
import { useUserStore } from "@/store/userStore";
import { logout as apiLogout, checkSession } from "@/lib/apiClient";

export interface AuthState {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    refresh: () => Promise<void>;
    handleLogout: () => Promise<void>;
}

export function useAuth(): AuthState {
    const isAuthenticated = useUserStore((s) => s.isAuthenticated);
    const isAdmin = useUserStore((s) => s.isAdmin);
    const isLoading = useUserStore((s) => s.isLoading);
    const setAuth = useUserStore((s) => s.setAuth);
    const clearAuth = useUserStore((s) => s.clearAuth);
    const setAuthLoading = useUserStore((s) => s.setAuthLoading);

    // Re-fetch session from server and sync global store
    const refresh = useCallback(async () => {
        setAuthLoading(true);
        try {
            const result = await checkSession();
            if (result.authenticated && result.session) {
                setAuth(result.session);
            } else {
                clearAuth();
            }
        } catch {
            clearAuth();
        }
    }, [setAuth, clearAuth, setAuthLoading]);

    // Logout: hit API, clear global store immediately
    const handleLogout = useCallback(async () => {
        clearAuth(); // optimistic — update UI immediately
        try {
            await apiLogout();
        } catch {
            // ignore — cookie is cleared server-side even on error
        }
    }, [clearAuth]);

    return { isAuthenticated, isAdmin, isLoading, refresh, handleLogout };
}
