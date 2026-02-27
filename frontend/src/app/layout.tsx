import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientShell from "@/components/common/ClientShell";

export const metadata: Metadata = {
  title: "JanSathi AI — Your Digital Companion",
  description:
    "Voice-first super-app for rural India. Government schemes, agriculture advisory, education, market access, and career guidance — all in one platform.",
  keywords: [
    "JanSathi",
    "rural India",
    "government schemes",
    "agriculture",
    "voice assistant",
    "education",
  ],
  authors: [{ name: "JanSathi AI Team" }],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <head>
        {/* V2 Typography: Space Grotesk (display) + Inter (body) + Devanagari */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols Outlined — for premium icon rendering */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <ClientShell>
          <main id="main-content">
            {children}
          </main>
        </ClientShell>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('[SW] Registered:', reg.scope))
                    .catch(err => console.log('[SW] Registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
