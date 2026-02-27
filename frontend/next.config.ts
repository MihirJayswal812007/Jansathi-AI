import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Performance: Dev compilation ──────────────────────────
  // Remove output: "standalone" — it forces full server bundling on every build.
  // Only enable for production Dockerized deployments.
  // output: "standalone",  // <-- uncomment for production Docker deploy

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
