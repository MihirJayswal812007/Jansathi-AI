// ===== JanSathi AI — Next.js Edge Middleware =====
// Server-side RBAC enforcement for /admin/* routes.
// This runs BEFORE any page component — no client-side spoofing possible.
// Reads the session cookie and validates role via backend API.

import { NextRequest, NextResponse } from "next/server";

// Routes that require the admin role
const ADMIN_PATTERNS = [/^\/admin(\/.*)?$/];

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
        return NextResponse.redirect(url, { status: 308 }); // 308 = Permanent Redirect
    }

    // ── Check if route needs admin protection ────────────────
    const isAdminRoute = ADMIN_PATTERNS.some((pattern) =>
        pattern.test(pathname)
    );
    if (!isAdminRoute) return NextResponse.next();

    // ── Validate session via backend ─────────────────────────
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

    try {
        const sessionRes = await fetch(`${backendUrl}/api/auth/session`, {
            headers: {
                // Forward cookies from the incoming request
                cookie: req.headers.get("cookie") || "",
            },
            // Edge middleware must not cache auth calls
            cache: "no-store",
        });

        if (!sessionRes.ok) {
            // Not authenticated → redirect to login
            const loginUrl = req.nextUrl.clone();
            loginUrl.pathname = "/login";
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        const data = await sessionRes.json();

        // Check admin role
        if (!data?.session?.role || data.session.role !== "admin") {
            // Authenticated but not admin → send to chat
            const chatUrl = req.nextUrl.clone();
            chatUrl.pathname = "/chat";
            chatUrl.searchParams.set(
                "reason",
                "admin_access_required"
            );
            return NextResponse.redirect(chatUrl);
        }

        // Admin verified — allow through
        return NextResponse.next();
    } catch {
        // Backend unreachable → fail closed (redirect to login)
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("redirect", pathname);
        loginUrl.searchParams.set("error", "session_check_failed");
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: [
        // Match all /admin routes AND legacy /dashboard routes
        "/admin/:path*",
        "/dashboard",
        "/dashboard/:path*",
    ],
};
