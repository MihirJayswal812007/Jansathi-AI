# JanSathi AI — Full Project Roadmap 🗺️

> **Current Status:** Phase 1 (MVP Frontend & AI Integration) is **Complete**. 
> We are now moving into Phase 2: Production Backend & Real Data.

---

## 🏗️ Phase 1: MVP Core (✅ COMPLETED)

We have successfully built the foundation, integrated the AI, and created the core UI components using an in-memory database for rapid prototyping.

- [x] **Sprint 1: Foundation & Design System**
  - Next.js 15 + Tailwind CSS + Framer Motion scaffolding
  - 5-pillar design system (colour psychology for JanSeva, JanShiksha, etc.)
  - Voice UI hooks & Mode Selector
  - Basic Chat Interface & PWA Manifest
- [x] **Sprint 2: AI Brain & Intent Routing**
  - Groq Llama 3.3 70B integration (Free, rapid inference)
  - Intent router (auto-switches modes based on context)
  - Module personas (system prompts)
  - JSON knowledge bases (schemes, crops) injected into context
- [x] **Sprint 3: Module-Specific UI Components**
  - **JanSeva**: `SchemeCard`, `DocumentChecklist`, `GrievanceForm`
  - **JanKrishi**: `CropDiagnosis`, `MandiPrices`
  - **JanVyapar**: `ProductShowcase`
- [x] **Sprint 4: CommPulse Dashboard & PWA**
  - CommPulse stats dashboard (DAU, intents, language split)
  - Rate limiting & API error handling middleware
  - Service Worker (`sw.js`) for offline caching & fallback page
  - In-memory database models (User, Conversation, Analytics)

---

## 🗄️ Database Recommendation for Phase 2

**Recommendation: PostgreSQL (via Supabase or Vercel Postgres) + Prisma ORM**

*Why not MongoDB?*
JanSathi's data is highly relational. A `User` has many `Conversations`, a `Conversation` has many `Messages`, and every interaction generates an `AnalyticsEvent`. PostgreSQL handles these relationships and complex aggregations (needed for the CommPulse dashboard) much faster and more reliably than a NoSQL database.

*Why Supabase / Vercel Postgres?*
They offer generous free tiers perfect for hackathons, built-in connection pooling for serverless environments (Next.js), and seamless integration.

---

## 🚀 Phase 2: Production Backend (✅ SPRINT 5 COMPLETE)

This is where we are right now. We have successfully swapped our in-memory `db.ts` for a real PostgreSQL database on Supabase.

- [x] **Sprint 5: Database Migration (PostgreSQL)**
  - Initialize Prisma ORM (`npx prisma init`)
  - Translate `db.ts` interfaces into Prisma Schema (`schema.prisma`)
  - Provision free PostgreSQL database (Supabase/Vercel)
  - Write migration script to seed initial demo data
  - Update API routes to use Prisma Client instead of in-memory DB
- [x] **Sprint 6: User Authentication & Backend Hardening**
  - Session-based auth with httpOnly cookies
  - Structured JSON logger + config service
  - Conversation persistence to Supabase
  - Middleware pipeline rewrite (rate limiting, CORS, bilingual errors)
- [x] **Sprint 7: Live Data APIs (Free, No Signup)**
  - Open-Meteo weather (no API key) — 40+ Indian cities, 7-day forecast, farming advisories
  - Mandi price dataset — 20 crops × 30+ mandis, Hindi/English search
  - Chat context integration — JanKrishi auto-detects weather/price queries

---

## 🌟 Phase 3: Polish & Hackathon Demo (⏳ FUTURE)

- [x] **Sprint 8: Voice & Accessibility Polish**
  - Auto-read AI responses in voice mode (SpeechSynthesis)
  - Web Audio API sound effects (no audio files)
  - Waveform voice animation, pulse ring CSS
  - ARIA live regions, radiogroup, keyboard shortcuts (Ctrl+Shift+V, Escape)
  - Skip-to-content, focus management, prefers-reduced-motion
- [ ] **Sprint 9: SMS Fallback (Stretch Goal)**
  - Set up Twilio WhatsApp/SMS webhook
  - Allow users to text the AI if they don't have a smartphone
- [x] **Sprint 10: Final Deployment & Video**
  - `next.config.ts`: standalone output, security headers, microphone permission
  - `vercel.json`: Mumbai region (`bom1`), 30s chat timeout
  - `.env.example`: safe onboarding template
  - `next build` verified — exit 0

---

## 🔄 V2: Architecture Split (⏳ NEXT)

- [ ] **Sprint 11: Backend Extraction**
  - Initialize `backend/` with Express + TypeScript
  - Migrate all `/api/*` routes → Express controllers
  - Move Prisma, services, knowledge bases to backend
  - Deploy to Render (free tier)
  - Update frontend `apiClient.ts` → `NEXT_PUBLIC_API_URL`
  - Delete `frontend/src/app/api/`
- [ ] **Sprint 12: Stitch MCP UI/UX Redesign**
  - Frontend is now a pure UI shell — safe for Stitch
  - Redesign with premium animations, layouts
  - Add module-specific visual components (WeatherWidget, SchemeCard)
