// ===== JanSathi AI — Government Portals Directory (Premium) =====
// SaaS-quality searchable directory with glass cards, skeleton loading,
// category pill filters, and scroll-reveal animations.

"use client";
import "./portals.css";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/modeStore";
import {
    GOV_PORTALS,
    ALL_CATEGORIES,
    CATEGORY_LABELS,
    type PortalCategory,
    type GovPortal,
} from "@/lib/portals-data";

// ── Variants ────────────────────────────────────────────────
const cardVariant = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.045,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
    }),
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const fadeIn = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

// ── Page ────────────────────────────────────────────────────
export default function PortalsPage() {
    const { language } = useModeStore();
    const isHi = language === "hi";

    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<PortalCategory | "all">("all");
    const [isLoaded, setIsLoaded] = useState(false);

    // Simulate initial load for skeleton
    useEffect(() => {
        const t = setTimeout(() => setIsLoaded(true), 400);
        return () => clearTimeout(t);
    }, []);

    const filtered = useMemo(() => {
        let results = GOV_PORTALS;
        if (activeCategory !== "all") {
            results = results.filter((p) => p.category === activeCategory);
        }
        const q = search.trim().toLowerCase();
        if (q) {
            results = results.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.nameHi.includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.descriptionHi.includes(q) ||
                    p.url.toLowerCase().includes(q) ||
                    CATEGORY_LABELS[p.category].en.toLowerCase().includes(q)
            );
        }
        return results;
    }, [search, activeCategory]);

    const handleCategoryClick = useCallback((cat: PortalCategory | "all") => {
        setActiveCategory(cat);
    }, []);

    return (
        <div className="gp">
            {/* ── Header ─────────────────────────────────────── */}
            <motion.header
                className="gp-header"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <div className="gp-header-text">
                    <h1 className="gp-title font-display">
                        <span className="material-symbols-outlined gp-title-icon">language</span>
                        {isHi ? "सरकारी पोर्टल" : "Government Portals"}
                    </h1>
                    <p className="gp-subtitle">
                        {isHi
                            ? "भारत सरकार की सभी महत्वपूर्ण वेबसाइटें एक जगह — खोजें, जानें और सीधे जाएं"
                            : "Every essential Indian government website in one place — discover, learn, and visit directly"}
                    </p>
                </div>
                <div className="gp-header-stat">
                    <span className="gp-header-stat-num font-display">{GOV_PORTALS.length}</span>
                    <span className="gp-header-stat-label">{isHi ? "पोर्टल" : "Portals"}</span>
                </div>
            </motion.header>

            {/* ── Sticky toolbar ──────────────────────────────── */}
            <div className="gp-toolbar">
                {/* Search */}
                <div className="gp-search">
                    <span className="material-symbols-outlined gp-search-icon">search</span>
                    <input
                        type="text"
                        className="gp-search-input"
                        placeholder={isHi ? "नाम, श्रेणी या URL से खोजें..." : "Search by name, category, or URL..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label={isHi ? "पोर्टल खोजें" : "Search portals"}
                    />
                    {search && (
                        <button
                            className="gp-search-clear"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                        </button>
                    )}
                </div>

                {/* Category pills */}
                <div className="gp-pills" role="tablist" aria-label="Filter by category">
                    <button
                        className={`gp-pill${activeCategory === "all" ? " gp-pill--active" : ""}`}
                        onClick={() => handleCategoryClick("all")}
                        role="tab"
                        aria-selected={activeCategory === "all"}
                    >
                        {isHi ? "सभी" : "All"}
                        <span className="gp-pill-count">{GOV_PORTALS.length}</span>
                    </button>
                    {ALL_CATEGORIES.map((cat) => {
                        const count = GOV_PORTALS.filter((p) => p.category === cat).length;
                        return (
                            <button
                                key={cat}
                                className={`gp-pill${activeCategory === cat ? " gp-pill--active" : ""}`}
                                onClick={() => handleCategoryClick(cat)}
                                role="tab"
                                aria-selected={activeCategory === cat}
                                data-color={CATEGORY_LABELS[cat].color}
                            >
                                {isHi ? CATEGORY_LABELS[cat].hi : CATEGORY_LABELS[cat].en}
                                <span className="gp-pill-count">{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Results meta ────────────────────────────────── */}
            <div className="gp-meta">
                <span className="gp-meta-count">
                    {filtered.length} {isHi ? "पोर्टल" : filtered.length === 1 ? "portal" : "portals"}
                    {activeCategory !== "all" && (
                        <> {isHi ? "में" : "in"} <strong>{isHi ? CATEGORY_LABELS[activeCategory].hi : CATEGORY_LABELS[activeCategory].en}</strong></>
                    )}
                    {search && <> {isHi ? "खोज:" : "matching"} &ldquo;{search}&rdquo;</>}
                </span>
                {(search || activeCategory !== "all") && (
                    <button
                        className="gp-meta-clear"
                        onClick={() => { setSearch(""); setActiveCategory("all"); }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                        {isHi ? "सब हटाएं" : "Clear all"}
                    </button>
                )}
            </div>

            {/* ── Card Grid / Skeleton / Empty ────────────────── */}
            {!isLoaded ? (
                <div className="gp-grid">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="gp-skeleton" aria-hidden>
                            <div className="gp-skeleton-badge" />
                            <div className="gp-skeleton-title" />
                            <div className="gp-skeleton-line" />
                            <div className="gp-skeleton-line gp-skeleton-line--short" />
                            <div className="gp-skeleton-btn" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    className="gp-empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="material-symbols-outlined gp-empty-icon">search_off</span>
                    <h3 className="gp-empty-title font-display">
                        {isHi ? "कोई पोर्टल नहीं मिला" : "No portals found"}
                    </h3>
                    <p className="gp-empty-desc">
                        {isHi ? "अपनी खोज या फ़िल्टर बदलकर देखें" : "Try adjusting your search or filter criteria"}
                    </p>
                    <button
                        className="gp-empty-btn"
                        onClick={() => { setSearch(""); setActiveCategory("all"); }}
                    >
                        {isHi ? "सब हटाएं" : "Reset filters"}
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    className="gp-grid"
                    initial="hidden"
                    animate="visible"
                    key={`${activeCategory}-${search}`}
                >
                    <AnimatePresence mode="popLayout">
                        {filtered.map((portal, i) => (
                            <PortalCard key={portal.id} portal={portal} index={i} isHi={isHi} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}

// ── Portal Card Component ───────────────────────────────────
function PortalCard({ portal, index, isHi }: { portal: GovPortal; index: number; isHi: boolean }) {
    const cat = CATEGORY_LABELS[portal.category];
    const domain = (() => {
        try { return new URL(portal.url).hostname.replace("www.", ""); } catch { return portal.url; }
    })();

    return (
        <motion.a
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="gp-card"
            custom={index}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            aria-label={`${isHi ? portal.nameHi : portal.name} — ${domain}`}
        >
            {/* Accent line */}
            <div className="gp-card-accent" style={{ background: cat.color }} />

            {/* Top row: icon + badge */}
            <div className="gp-card-head">
                <div className="gp-card-icon-wrap" style={{ background: `${cat.color}14` }}>
                    <span className="material-symbols-outlined gp-card-icon" style={{ color: cat.color }}>
                        {portal.icon}
                    </span>
                </div>
                <span className="gp-card-cat" style={{ color: cat.color, borderColor: `${cat.color}30` }}>
                    {isHi ? cat.hi : cat.en}
                </span>
            </div>

            {/* Name */}
            <h3 className="gp-card-title font-display">
                {isHi ? portal.nameHi : portal.name}
            </h3>

            {/* Description (clamped 2 lines) */}
            <p className="gp-card-desc">
                {isHi ? portal.descriptionHi : portal.description}
            </p>

            {/* Footer */}
            <div className="gp-card-foot">
                <span className="gp-card-domain">{domain}</span>
                <span className="gp-card-cta">
                    {isHi ? "पोर्टल पर जाएं" : "Visit Portal"}
                    <span className="material-symbols-outlined gp-card-cta-arrow">arrow_outward</span>
                </span>
            </div>
        </motion.a>
    );
}
