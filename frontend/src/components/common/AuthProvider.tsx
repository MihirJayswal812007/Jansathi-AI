// ===== JanSathi AI — Auth Provider =====
// Mounted ONCE in ClientShell. Fetches session from server on app start
// and syncs result into global Zustand store. All components using
// useAuth() will reactively update when auth state changes.

"use client";

import { useEffect } from "react";
import { checkSession } from "@/lib/apiClient";
import { useUserStore } from "@/store/userStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const setAuth = useUserStore((s) => s.setAuth);
    const clearAuth = useUserStore((s) => s.clearAuth);

    useEffect(() => {
        // Single session check on app mount — populates global auth state
        checkSession()
            .then((result) => {
                if (result.authenticated && result.session) {
                    setAuth(result.session);
                } else {
                    clearAuth();
                }
            })
            .catch(() => {
                clearAuth();
            });
    }, [setAuth, clearAuth]);

    return <>{children}</>;
}
