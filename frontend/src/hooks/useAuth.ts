// ===== JanSathi AI — Auth Hook =====
// Manages authentication state, syncs with userStore.

"use client";

import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { checkSession, logout as apiLogout, type SessionInfo } from "@/lib/apiClient";

interface AuthState {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    user: SessionInfo | null;
    refresh: () => Promise<void>;
    handleLogout: () => Promise<void>;
}

export function useAuth(): AuthState {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<SessionInfo | null>(null);
    const { setSession, clearSession } = useUserStore();

    const refresh = useCallback(async () => {
        try {
            const result = await checkSession();
            if (result.authenticated && result.session) {
                setUser(result.session);
                setSession(result.session.id, result.session.role === "admin");
            } else {
                setUser(null);
                clearSession();
            }
        } catch {
            setUser(null);
            clearSession();
        } finally {
            setIsLoading(false);
        }
    }, [setSession, clearSession]);

    const handleLogout = useCallback(async () => {
        await apiLogout();
        setUser(null);
        clearSession();
    }, [clearSession]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        isAuthenticated: !!user?.userId,
        isAdmin: user?.role === "admin",
        isLoading,
        user,
        refresh,
        handleLogout,
    };
}
