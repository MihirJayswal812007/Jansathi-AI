// ===== JanSathi AI — Next.js Edge Middleware =====
// Server-side RBAC enforcement for /admin/* routes.
// Reads session cookie, validates role via backend GET /api/auth/session.

import { NextRequest, NextResponse } from "next/server";

// Old dashboard redirect (moved to /admin/dashboard)
const LEGACY_REDIRECTS: Record<string, string> = {
    "/dashboard": "/admin/dashboard",
    "/dashboard/conversations": "/admin/dashboard/conversations",
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── Legacy redirect: /dashboard → /admin/dashboard ──────
    if (LEGACY_REDIRECTS[pathname]) {
        const url = req.nextUrl.clone();
        url.pathname = LEGACY_REDIRECTS[pathname];
        return NextResponse.redirect(url, { status: 308 });
    }

    // ── Only protect /admin/* routes ────────────────────────
    if (!pathname.startsWith("/admin")) return NextResponse.next();

    // ── Validate session via backend ────────────────────────
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

    try {
        const sessionRes = await fetch(`${backendUrl}/api/auth/session`, {
            method: "GET",
            headers: {
                cookie: req.headers.get("cookie") || "",
            },
            cache: "no-store",
        });

        // Network/server error → fail closed
        if (!sessionRes.ok) {
            return redirectToLogin(req, pathname, "session_check_failed");
        }

        const data = await sessionRes.json();

        // Backend returns { authenticated: false } when no valid session
        if (!data?.authenticated || !data?.session) {
            return redirectToLogin(req, pathname);
        }

        // Check admin role
        const role = data.session.role || data.session.user?.role;
        if (role !== "admin") {
            const chatUrl = req.nextUrl.clone();
            chatUrl.pathname = "/chat";
            chatUrl.searchParams.set("reason", "admin_access_required");
            return NextResponse.redirect(chatUrl);
        }

        // Admin ✓
        return NextResponse.next();
    } catch {
        // Backend unreachable → fail closed
        return redirectToLogin(req, pathname, "session_check_failed");
    }
}

function redirectToLogin(req: NextRequest, redirect: string, error?: string) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", redirect);
    if (error) loginUrl.searchParams.set("error", error);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard",
        "/dashboard/:path*",
    ],
};
