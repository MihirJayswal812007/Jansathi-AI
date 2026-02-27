// ===== JanSathi AI — Landing Page =====
// Investor-demo-ready landing page communicating trust, intelligence, and social impact.
// 7 sections: Hero, Problem, Pipeline, Intelligence Stack, Features, Trust, CTA.

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

// 3D background — loaded only client-side (no SSR, no hydration mismatch)
const LandingBackground = dynamic(
  () => import("@/components/3d/LandingBackground"),
  { ssr: false, loading: () => null }
);

// ── Animation Variants ──────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

// ── Data ────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { icon: "search", label: "Your Question", desc: "Ask in Hindi or English, text or voice", color: "#94A3B8" },
  { icon: "library_books", label: "Knowledge Retrieval", desc: "Semantic search across verified scheme documents", color: "#3B82F6" },
  { icon: "psychology", label: "Conversation Memory", desc: "Personal context from your past interactions", color: "#8B5CF6" },
  { icon: "auto_awesome", label: "AI Response", desc: "Grounded, verified, personalized answer", color: "#10B981" },
];

const INTEL_CARDS = [
  { icon: "library_books", title: "Static Knowledge (RAG)", desc: "1,500+ government scheme documents indexed with pgvector semantic search. Every answer is grounded in verified data.", color: "var(--intel-rag)" },
  { icon: "psychology", title: "Conversation Memory", desc: "Your past interactions inform future responses. The AI remembers your context, eligibility, and preferences.", color: "var(--intel-memory)" },
  { icon: "person_search", title: "Long-term Profile", desc: "LLM-generated user profiles summarize your patterns over time for deeply personalized guidance.", color: "var(--intel-profile)" },
  { icon: "swap_vert", title: "Smart Reranking", desc: "Cross-encoder reranking ensures the most relevant documents surface first, not just the highest similarity.", color: "var(--intel-reranker)" },
];

const FEATURES = [
  { icon: "translate", title: "Multilingual", desc: "Hindi & English with Devanagari-optimized tokenization" },
  { icon: "mic", title: "Voice-First", desc: "Speak naturally — the AI understands spoken Hindi" },
  { icon: "verified_user", title: "Secure OTP Auth", desc: "Phone-based authentication, no passwords to remember" },
  { icon: "speed", title: "Redis Scaling", desc: "Rate limiting and caching for production-grade performance" },
  { icon: "analytics", title: "Built-in Analytics", desc: "Usage tracking, token budgets, and retrieval metrics" },
  { icon: "memory", title: "Embedding Cache", desc: "LRU+TTL cache reduces API costs by 50% on repeated queries" },
];

const STATS = [
  { value: "1,500+", label: "Schemes Indexed" },
  { value: "200+", label: "Automated Tests" },
  { value: "5", label: "AI Intelligence Layers" },
  { value: "<2s", label: "Avg Response Time" },
];

// ── Component ───────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="landing" style={{ position: "relative" }}>
      {/* ─── 3D Background Layer (behind everything) ────────── */}
      <LandingBackground />

      {/* ─── All content above the background ──────────────── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ─── Navbar ────────────────────────────────────────── */}
        <nav className="landing-nav">
          <div className="landing-nav-inner">
            <Link href="/" className="landing-logo">
              <span className="material-symbols-outlined" style={{ color: "#2563EB", fontSize: 24 }}>
                auto_awesome
              </span>
              <span className="font-display" style={{ fontWeight: 600, fontSize: 18, color: "var(--text-primary)" }}>
                JanSathi AI
              </span>
            </Link>
            <div className="landing-nav-links">
              <Link href="/chat" className="landing-nav-cta">
                Start Chatting
              </Link>
            </div>
          </div>
        </nav>

        {/* ─── 1. Hero ───────────────────────────────────────── */}
        <section className="landing-hero">
          <motion.div
            className="landing-hero-content"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div className="landing-hero-badge" custom={0} variants={fadeUp}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#10B981" }}>check_circle</span>
              <span>Powered by Retrieval-Augmented Generation</span>
            </motion.div>

            <motion.h1 className="landing-hero-title font-display" custom={1} variants={fadeUp}>
              Your AI-Powered Gateway to{" "}
              <span className="landing-hero-gradient">Government Services</span>
            </motion.h1>

            <motion.p className="landing-hero-subtitle" custom={2} variants={fadeUp}>
              Intelligent scheme matching powered by semantic retrieval,
              conversation memory, and verified knowledge — designed for every citizen of India.
            </motion.p>

            <motion.div className="landing-hero-actions" custom={3} variants={fadeUp}>
              <Link href="/chat" className="landing-btn landing-btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chat</span>
                Start a Conversation
              </Link>
              <a href="#how-it-works" className="landing-btn landing-btn-secondary">
                Learn How It Works
              </a>
            </motion.div>

            <motion.div className="landing-hero-stats" custom={4} variants={fadeUp}>
              {STATS.map((s) => (
                <div key={s.label} className="landing-stat">
                  <span className="landing-stat-value font-display">{s.value}</span>
                  <span className="landing-stat-label">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Gradient orb background */}
          <div className="landing-hero-orb landing-hero-orb-1" />
          <div className="landing-hero-orb landing-hero-orb-2" />
        </section>

        {/* ─── 2. Problem Statement ──────────────────────────── */}
        <section className="landing-section">
          <motion.div
            className="landing-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div className="landing-section-header" custom={0} variants={fadeUp}>
              <span className="landing-section-tag">The Problem</span>
              <h2 className="landing-section-title font-display">
                1,500+ Government Schemes.<br />
                <span style={{ color: "var(--text-muted)" }}>Most Citizens Can't Find the Right One.</span>
              </h2>
              <p className="landing-section-desc">
                Language barriers, complex eligibility criteria, scattered information, and lack of personalization
                leave millions without access to the services designed for them.
              </p>
            </motion.div>

            <motion.div className="landing-problem-grid" custom={1} variants={fadeUp}>
              {[
                { value: "70%", label: "of eligible citizens unaware of applicable schemes", icon: "visibility_off" },
                { value: "22+", label: "official languages — most portals only support Hindi/English", icon: "translate" },
                { value: "45min", label: "average time to navigate a government portal", icon: "schedule" },
              ].map((item) => (
                <div key={item.label} className="landing-problem-card">
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--error)", marginBottom: 12 }}>
                    {item.icon}
                  </span>
                  <span className="landing-problem-value font-display">{item.value}</span>
                  <span className="landing-problem-label">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ─── 3. How It Works (Pipeline) ────────────────────── */}
        <section id="how-it-works" className="landing-section landing-section-alt">
          <motion.div
            className="landing-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div className="landing-section-header" custom={0} variants={fadeUp}>
              <span className="landing-section-tag">How It Works</span>
              <h2 className="landing-section-title font-display">
                From Question to Verified Answer —{" "}
                <span style={{ color: "var(--janseva-primary)" }}>In Seconds</span>
              </h2>
            </motion.div>

            <motion.div className="landing-pipeline" custom={1} variants={fadeUp}>
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.label} className="landing-pipeline-step">
                  <div className="landing-pipeline-icon" style={{ borderColor: step.color }}>
                    <span className="material-symbols-outlined" style={{ color: step.color, fontSize: 24 }}>
                      {step.icon}
                    </span>
                  </div>
                  <div className="landing-pipeline-text">
                    <span className="landing-pipeline-title font-display">{step.label}</span>
                    <span className="landing-pipeline-desc">{step.desc}</span>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="landing-pipeline-arrow">
                      <span className="material-symbols-outlined" style={{ color: "var(--text-muted)", fontSize: 20 }}>
                        arrow_forward
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ─── 4. Intelligence Stack ─────────────────────────── */}
        <section className="landing-section">
          <motion.div
            className="landing-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div className="landing-section-header" custom={0} variants={fadeUp}>
              <span className="landing-section-tag">Intelligence Architecture</span>
              <h2 className="landing-section-title font-display">
                Four Layers of Context.
                <br />
                <span style={{ color: "var(--intel-memory)" }}>One Intelligent Response.</span>
              </h2>
              <p className="landing-section-desc">
                Every response is grounded in verified documents, enriched with your conversation history,
                informed by your long-term profile, and ranked for maximum relevance.
              </p>
            </motion.div>

            <motion.div className="landing-intel-grid" custom={1} variants={fadeUp}>
              {INTEL_CARDS.map((card, i) => (
                <motion.div key={card.title} className="landing-intel-card" custom={i + 2} variants={fadeUp}>
                  <div className="landing-intel-icon" style={{ background: `${card.color}18` }}>
                    <span className="material-symbols-outlined" style={{ color: card.color, fontSize: 24 }}>
                      {card.icon}
                    </span>
                  </div>
                  <h3 className="landing-intel-title font-display">{card.title}</h3>
                  <p className="landing-intel-desc">{card.desc}</p>
                  <div className="landing-intel-line" style={{ background: card.color }} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ─── 5. Features Grid ──────────────────────────────── */}
        <section className="landing-section landing-section-alt">
          <motion.div
            className="landing-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div className="landing-section-header" custom={0} variants={fadeUp}>
              <span className="landing-section-tag">Capabilities</span>
              <h2 className="landing-section-title font-display">
                Production-Grade.{" "}
                <span style={{ color: "var(--success)" }}>Not a Prototype.</span>
              </h2>
            </motion.div>

            <motion.div className="landing-features-grid" custom={1} variants={fadeUp}>
              {FEATURES.map((f, i) => (
                <motion.div key={f.title} className="landing-feature-card" custom={i + 2} variants={fadeUp}>
                  <span className="material-symbols-outlined landing-feature-icon">
                    {f.icon}
                  </span>
                  <h3 className="landing-feature-title">{f.title}</h3>
                  <p className="landing-feature-desc">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ─── 6. Trust & Security ───────────────────────────── */}
        <section className="landing-section">
          <motion.div
            className="landing-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div className="landing-section-header" custom={0} variants={fadeUp}>
              <span className="landing-section-tag">Security</span>
              <h2 className="landing-section-title font-display">
                Your Data. Your Privacy.{" "}
                <span style={{ color: "var(--janseva-primary)" }}>No Compromise.</span>
              </h2>
            </motion.div>

            <motion.div className="landing-trust-grid" custom={1} variants={fadeUp}>
              {[
                { icon: "shield", title: "User-Isolated Memory", desc: "Every user's conversation memory and profile is completely isolated. No cross-user data leakage — ever." },
                { icon: "lock", title: "OTP-Only Authentication", desc: "No passwords to steal. Phone-based OTP with rate limiting, brute-force protection, and session cookies." },
                { icon: "key", title: "No Secrets in Code", desc: "All credentials are environment-injected at runtime. Git history cleaned. Gitleaks CI scanning active." },
                { icon: "speed", title: "Rate-Limited by Design", desc: "Redis-backed rate limiting with per-user quotas. Automatic scaling. Memory fallback for zero-downtime." },
              ].map((item, i) => (
                <motion.div key={item.title} className="landing-trust-card" custom={i + 2} variants={fadeUp}>
                  <span className="material-symbols-outlined" style={{ color: "var(--janseva-primary)", fontSize: 24 }}>
                    {item.icon}
                  </span>
                  <h3 className="landing-trust-title font-display">{item.title}</h3>
                  <p className="landing-trust-desc">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ─── 7. CTA Footer ─────────────────────────────────── */}
        <section className="landing-cta">
          <motion.div
            className="landing-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 className="landing-cta-title font-display" custom={0} variants={fadeUp}>
              Ready to access the schemes you deserve?
            </motion.h2>
            <motion.p className="landing-cta-desc" custom={1} variants={fadeUp}>
              Start a conversation in Hindi or English. No account required.
            </motion.p>
            <motion.div className="landing-cta-actions" custom={2} variants={fadeUp}>
              <Link href="/chat" className="landing-btn landing-btn-primary landing-btn-lg">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>chat</span>
                Start a Conversation
              </Link>
              <Link href="/login" className="landing-btn landing-btn-ghost">
                Sign in with OTP
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ─── Footer ────────────────────────────────────────── */}
        <footer className="landing-footer">
          <div className="landing-container">
            <div className="landing-footer-inner">
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                © 2026 JanSathi AI · Built with ❤️ for Bharat
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                201 automated tests · Production-grade architecture
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
