# JanSathi AI - Frontend

This is the frontend UI shell for **JanSathi AI**, a bilingual voice-first AI assistant designed for rural India, featuring specialized modules for citizen services (JanSeva), agriculture (JanKrishi), and business (JanVyapar).

## Tech Stack

The frontend is built with modern, performant web technologies:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

## Features

- **Conversational UI**: Intuitive chat interface with a dedicated Voice Mode.
- **Bilingual Support**: Real-time support for English and Hindi interactions.
- **Dynamic Theming**: Module-specific color palettes (e.g., green for JanKrishi, orange for JanVyapar).
- **Responsive Design**: Mobile-first architecture optimized for all devices.
- **PWA Ready**: Includes offline caching and fallback pages via Service Workers.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- The JanSathi backend must be running locally or deployed.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and configure your local settings, particularly the backend API URL.
   ```bash
   cp .env.example .env
   ```
   *Ensure `NEXT_PUBLIC_API_URL` points to your backend instance.*

4. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

Following the V2 Architecture split, this Next.js application acts as a pure UI shell. All heavy logic, database interactions (Prisma/PostgreSQL), and AI inference (Groq/Llama 3) have been extracted to the Express backend. The frontend communicates with the backend exclusively via REST APIs.

## Deployment

The frontend is optimized for deployment on Vercel. 

```bash
npm run build
npm run start
```

Please ensure cross-origin resource sharing (CORS) is properly configured on the backend to accept requests from your deployed frontend domain.
