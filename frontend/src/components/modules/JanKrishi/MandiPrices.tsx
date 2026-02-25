// ===== JanKrishi Module — Mandi Prices Component =====
// Displays market prices for crops across mandis

"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, MapPin } from "lucide-react";

export interface MandiPrice {
    mandi: string;
    mandiHi: string;
    state: string;
    price: number;
    unit: string;
    trend: "up" | "down" | "stable";
    changePercent: number;
}

interface MandiPricesProps {
    cropName: string;
    cropNameHi: string;
    prices: MandiPrice[];
    language: "hi" | "en";
    lastUpdated?: string;
}

// Sample mandi prices (would come from Agmarknet API in production)
export const SAMPLE_WHEAT_PRICES: MandiPrice[] = [
    { mandi: "Azadpur Mandi", mandiHi: "आजादपुर मंडी", state: "Delhi", price: 2450, unit: "quintal", trend: "up", changePercent: 3.2 },
    { mandi: "Indore Mandi", mandiHi: "इंदौर मंडी", state: "MP", price: 2380, unit: "quintal", trend: "up", changePercent: 1.8 },
    { mandi: "Hapur Mandi", mandiHi: "हापुड़ मंडी", state: "UP", price: 2510, unit: "quintal", trend: "up", changePercent: 4.1 },
    { mandi: "Karnal Mandi", mandiHi: "करनाल मंडी", state: "Haryana", price: 2420, unit: "quintal", trend: "down", changePercent: -1.2 },
    { mandi: "Jaipur Mandi", mandiHi: "जयपुर मंडी", state: "Rajasthan", price: 2390, unit: "quintal", trend: "stable", changePercent: 0.3 },
];

const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp size={14} style={{ color: "var(--success)" }} />;
    if (trend === "down") return <TrendingDown size={14} style={{ color: "var(--error)" }} />;
    return <Minus size={14} style={{ color: "var(--text-muted)" }} />;
};

export default function MandiPrices({
    cropName,
    cropNameHi,
    prices,
    language,
    lastUpdated,
}: MandiPricesProps) {
    const avgPrice = Math.round(prices.reduce((sum, p) => sum + p.price, 0) / prices.length);
    const bestPrice = prices.reduce((best, p) => (p.price > best.price ? p : best), prices[0]);

    return (
        <motion.div
            className="rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-primary)",
            }}
        >
            {/* Header */}
            <div className="p-4 pb-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                        📊 {language === "hi" ? `${cropNameHi} — मंडी भाव` : `${cropName} — Market Prices`}
                    </h3>
                    {lastUpdated && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {lastUpdated}
                        </span>
                    )}
                </div>

                {/* Summary */}
                <div className="flex gap-4 mt-2">
                    <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {language === "hi" ? "औसत भाव" : "Avg Price"}
                        </p>
                        <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                            ₹{avgPrice.toLocaleString()}<span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>/qt</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {language === "hi" ? "सबसे अच्छा भाव" : "Best Price"}
                        </p>
                        <p className="font-bold text-lg" style={{ color: "var(--success)" }}>
                            ₹{bestPrice.price.toLocaleString()}<span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>/qt</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Price list */}
            <div className="px-4 pb-3">
                <div className="space-y-1.5">
                    {prices.map((p, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-2.5 rounded-lg"
                            style={{
                                background: p === bestPrice ? "rgba(16, 185, 129, 0.08)" : "var(--bg-elevated)",
                                border: p === bestPrice ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid transparent",
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                                <div>
                                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                        {language === "hi" ? p.mandiHi : p.mandi}
                                    </span>
                                    <span className="text-xs ml-1.5" style={{ color: "var(--text-muted)" }}>
                                        ({p.state})
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                    ₹{p.price.toLocaleString()}
                                </span>
                                <div className="flex items-center gap-0.5">
                                    <TrendIcon trend={p.trend} />
                                    <span
                                        className="text-xs font-medium"
                                        style={{
                                            color: p.trend === "up" ? "var(--success)" : p.trend === "down" ? "var(--error)" : "var(--text-muted)",
                                        }}
                                    >
                                        {p.changePercent > 0 ? "+" : ""}
                                        {p.changePercent}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Best selling advice */}
            <div
                className="px-4 py-3 text-xs flex items-center gap-2"
                style={{ background: "var(--jankrishi-surface)", color: "var(--jankrishi-primary)" }}
            >
                💡{" "}
                {language === "hi"
                    ? `सबसे अच्छा भाव ${language === "hi" ? bestPrice.mandiHi : bestPrice.mandi} में मिल रहा है। अभी बेचना फायदेमंद है!`
                    : `Best price available at ${bestPrice.mandi}. Good time to sell!`}
            </div>
        </motion.div>
    );
}
