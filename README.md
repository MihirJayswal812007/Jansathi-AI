<div align="center">

<img src="./frontend/public/icons/icon-192.png" alt="JanSathi AI Logo" width="96" height="96"/>

# JanSathi AI

### Your AI Gateway to Government Services

**A bilingual, voice-first AI assistant designed for every Indian citizen — from rural fields to city offices.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-jansathi--frontend.onrender.com-blue?style=for-the-badge&logo=render)](https://jansathi-frontend.onrender.com)
[![Backend](https://img.shields.io/badge/Backend-API%20Live-green?style=for-the-badge&logo=render)](https://jansathi-backend-xfez.onrender.com/api/health)
[![Next.js](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon%20PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Groq](https://img.shields.io/badge/Groq%20AI-FF6C37?style=for-the-badge)](https://groq.com/)

</div>

---

## 🌐 Live Application

| Service | URL |
|---|---|
| **Frontend** | [https://jansathi-frontend.onrender.com](https://jansathi-frontend.onrender.com) |
| **Backend API** | [https://jansathi-backend-xfez.onrender.com/api/health](https://jansathi-backend-xfez.onrender.com/api/health) |

> **Demo credentials:** Phone `9876543210` (Admin) · Phone `8976543210` (User) — OTP sent via system

---

## 📸 Screenshots

### 🏠 Landing Page

![Landing Page](./frontend/public/screenshots/landing.png)

> **"Your AI Gateway to Government Services"** — A cinematic full-screen hero with animated gradient text, RAG-powered intelligence badge, and a single clear CTA. Built to make a strong first impression in under 3 seconds, even on a slow mobile connection.

---

### 🔐 Login — Passwordless & Frictionless

![Login Page](./frontend/public/screenshots/login.png)

> **No passwords. No barriers.** Citizens log in with just a phone number or email using OTP verification. The glassmorphism card on a deep-blue animated background communicates trust while keeping the experience simple for first-time users in rural India.

---

### 🤖 Chat — The AI Core

![Chat Interface](./frontend/public/screenshots/chat.png)

> **Bilingual by design.** The chat interface greets users in Hindi (*सुप्रभात 👋*) with a 3D animated robot companion and a mic button for voice input. Five color-coded specialist modules — JanSeva, JanShiksha, JanKrishi, JanVyapar, JanKaushal — are always one tap away, routing the AI to the right domain instantly.

---

### 🌐 Government Portals — 28 Portals, One Screen

![Government Portals](./frontend/public/screenshots/portals.png)

> **The definitive directory of Indian government services.** A searchable, filterable card grid of 28 official portals — from MyScheme to JanSamarth — categorized by domain (Schemes & Benefits, Identity, Civic Services, Agriculture, Finance, Health). Every card has real-time search, external link safety (`noopener noreferrer`), and a clean "Visit Portal ↗" CTA.

---

### 📱 Mobile Responsive

![Mobile View](./frontend/public/screenshots/mobile.png)

> **Designed mobile-first.** Navigation collapses to a bottom tab bar. All cards reflow to single column. Typography scales gracefully. Tested across 375px (iPhone SE) to 768px (tablet). India's primary internet device is the phone — JanSathi is built for that reality.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎙️ **Voice-First Input** | Tap the microphone, speak — no typing needed; designed for users with low literacy |
| 🌏 **Bilingual (Hindi + English)** | Full UI and AI responses in both languages; toggle live in the sidebar |
| 🤖 **AI-Powered Conversations** | Groq-hosted LLaMA 3 with RAG for accurate, context-aware government guidance |
| 🏛️ **5 Specialist Modules** | JanSeva, JanShiksha, JanKrishi, JanVyapar, JanKaushal — each with domain-tuned prompts |
| 🔍 **28 Government Portals** | Curated, searchable directory of official government websites with category filters |
| 🔐 **Passwordless Auth** | OTP-based login — no passwords to forget, inclusive for low-tech users |
| 📊 **Admin Dashboard** | Full user management, conversation analytics, and system health monitoring |
| 💾 **Chat History** | All conversations persisted to Neon PostgreSQL, accessible across sessions |
| 📱 **Mobile-Optimized** | Responsive across all screen sizes with a native-feel bottom nav on mobile |
| ⚡ **Sub-second Responses** | Groq inference delivers AI responses in ~300ms — no waiting spinners |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser / Mobile)                 │
│                                                             │
│   Next.js 15 App Router  ·  React 19  ·  Zustand State      │
│   Framer Motion  ·  Tailwind CSS v4  ·  Lucide Icons        │
└─────────────────────────────┬───────────────────────────────┘
                              │ REST API (JSON)
                              │ HTTPS
┌─────────────────────────────▼───────────────────────────────┐
│                   BACKEND (Express + TypeScript)             │
│                                                             │
│   Auth Layer (OTP)  ·  CSRF Protection  ·  Rate Limiting    │
│   Chat Router  ·  Admin Router  ·  Health Check             │
│   Prisma ORM  ·  Session Management                         │
└─────────┬───────────────────────────────┬───────────────────┘
          │                               │
          │ Database                      │ AI Inference
          │                               │
┌─────────▼──────────┐        ┌───────────▼───────────────────┐
│  Neon PostgreSQL   │        │  Groq API (LLaMA 3 · 70B)     │
│  (Serverless)      │        │  RAG + Domain Prompting        │
│  Users, Sessions,  │        │  Sub-300ms inference           │
│  Chat History      │        └───────────────────────────────┘
└────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 15 | App Router + SSR |
| [React](https://react.dev/) | 19 | UI Components |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Styling |
| [Framer Motion](https://framer.com/motion/) | 11 | Animations |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | State Management |
| [Lucide React](https://lucide.dev/) | Latest | Icon Library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20 LTS | Runtime |
| [Express](https://expressjs.com/) | 4 | HTTP Server |
| [TypeScript](https://typescriptlang.org/) | 5 | Type Safety |
| [Prisma](https://prisma.io/) | 6 | ORM & Migrations |
| [Neon PostgreSQL](https://neon.tech/) | — | Serverless Database |
| [Groq SDK](https://groq.com/) | Latest | AI Inference |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- A [Neon.tech](https://neon.tech/) PostgreSQL database (free tier works)
- A [Groq Cloud](https://console.groq.com/) API key (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/MihirJayswal812007/Jansathi-ai.git
cd Jansathi-ai
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your actual values:

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"
GROQ_API_KEY="gsk_your_groq_api_key"
ADMIN_SECRET="your-chosen-admin-secret"
SESSION_SECRET="your-random-session-secret"
CORS_ORIGIN="http://localhost:3000"
```

Run database migrations and start:

```bash
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Backend starts at `http://localhost:4000`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Start the dev server:

```bash
npm run dev
```

Frontend starts at `http://localhost:3000`

---

## 🌍 Environment Variables Reference

### Backend (`.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon pooled connection string |
| `DIRECT_URL` | ✅ | Neon direct connection string (for migrations) |
| `GROQ_API_KEY` | ✅ | Groq Cloud API key for LLaMA inference |
| `ADMIN_SECRET` | ✅ | Secret used to create admin accounts |
| `SESSION_SECRET` | ✅ | Random string for session cookie signing |
| `CORS_ORIGIN` | ✅ | Frontend URL (for CORS allowlist) |
| `PORT` | ❌ | Server port (default: `4000`) |
| `NODE_ENV` | ❌ | `development` or `production` |

### Frontend (`.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend base URL |

---

## ☁️ Deploy to Render

This repo includes a [`render.yaml`](./render.yaml) blueprint for one-click deployment on Render's free tier.

1. Push this repo to GitHub
2. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints)
3. Click **New Blueprint Instance** → connect your repo
4. Fill in the environment variables (DATABASE_URL, DIRECT_URL, GROQ_API_KEY, ADMIN_SECRET)
5. Click **Apply** — both services deploy automatically

> ⚠️ **Note:** Free tier services spin down after 15 minutes of inactivity. The first request after sleep may take 30–60 seconds to wake up.

---

## 📁 Project Structure

```
jansathi-ai/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database models
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── middleware/         # Auth, CSRF, rate limiting
│   │   └── index.ts            # Express app entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   │   └── screenshots/        # README screenshots
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # Reusable React components
│   │   └── lib/                # Utilities, stores, data
│   └── package.json
├── render.yaml                 # Render deployment blueprint
└── README.md
```

---

## 🗺️ Modules

| Module | Hindi Name | Domain |
|---|---|---|
| **JanSeva** | जनसेवा | Citizen Services & Government Schemes |
| **JanShiksha** | जनशिक्षा | Education Resources & Scholarships |
| **JanKrishi** | जनकृषि | Agriculture, Crop Advice & Market Prices |
| **JanVyapar** | जनव्यापार | Rural Business & Village Markets |
| **JanKaushal** | जनकौशल | Skill Development & Job Training |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ for Bharat 🇮🇳

**[Live Demo](https://jansathi-frontend.onrender.com)** · **[Report Bug](https://github.com/MihirJayswal812007/Jansathi-ai/issues)** · **[Request Feature](https://github.com/MihirJayswal812007/Jansathi-ai/issues)**

</div>
