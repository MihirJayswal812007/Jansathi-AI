import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Performance: Production standalone output ──────────────
  // Standalone mode bundles only the necessary files for production.
  // Enabled for Render/Docker deployment, skipped in local dev.
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  reactStrictMode: true,
  poweredByHeader: false,

  // ── Bundle optimization ───────────────────────────────────
  // Tree-shake barrel exports — cuts import resolution time significantly
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
    ],
  },

  // Externalize heavy 3D packages in server-side (SSR) — prevents
  // webpack from bundling Three.js during SSR compilation
  serverExternalPackages: ["three", "@react-three/fiber", "@react-three/drei", "gsap"],

  // ── API Rewrites (Fixes cross-origin cookie blocking) ───────
  // Proxies /api/* to the external backend so the browser treats
  // the session and CSRF cookies as first-party cookies.
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;
    if (backendUrl) {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },

  // ── Security headers ──────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=(self)" },
        ],
      },
    ];
  },

  // ── Dev server ────────────────────────────────────────────
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
