// ===== JanVyapar Module — Product Showcase Component =====
// Display product listing for rural artisan products

"use client";

import { motion } from "framer-motion";
import { Share2, ShoppingCart, Star, Tag } from "lucide-react";

export interface ProductInfo {
    name: string;
    nameHi: string;
    description: string;
    descriptionHi: string;
    priceRange: { min: number; max: number };
    unit: string;
    unitHi: string;
    category: string;
    rating?: number;
    features: string[];
    featuresHi: string[];
}

interface ProductShowcaseProps {
    product: ProductInfo;
    language: "hi" | "en";
    onShare?: () => void;
    onOrder?: () => void;
}

export const SAMPLE_PRODUCTS: ProductInfo[] = [
    {
        name: "Pure Wild Honey",
        nameHi: "शुद्ध जंगली शहद",
        description:
            "100% pure honey collected from wild beehives in the forest. No additives, no chemicals. Nature's golden gift, straight to your table!",
        descriptionHi:
            "जंगलों से प्राप्त 100% शुद्ध शहद। कोई मिलावट नहीं, कोई केमिकल नहीं। प्रकृति का अनमोल उपहार, सीधा आपकी थाली तक!",
        priceRange: { min: 350, max: 450 },
        unit: "500g",
        unitHi: "500 ग्राम",
        category: "Food",
        rating: 4.8,
        features: ["100% Organic", "Forest-sourced", "No additives", "Rich in antioxidants"],
        featuresHi: ["100% जैविक", "जंगल से प्राप्त", "कोई मिलावट नहीं", "एंटीऑक्सीडेंट से भरपूर"],
    },
    {
        name: "Handmade Mango Pickle",
        nameHi: "घर का बना आम का अचार",
        description:
            "Traditional homemade mango pickle made with authentic spices and mustard oil. Aged for perfect taste!",
        descriptionHi:
            "पारंपरिक मसालों और सरसों के तेल से बना घर का आम का अचार। परफेक्ट स्वाद के लिए पुराना!",
        priceRange: { min: 120, max: 180 },
        unit: "500g",
        unitHi: "500 ग्राम",
        category: "Food",
        rating: 4.6,
        features: ["Homemade", "Traditional recipe", "Mustard oil", "6-month aged"],
        featuresHi: ["घर का बना", "पारंपरिक नुस्खा", "सरसों का तेल", "6 महीने पुराना"],
    },
];

export default function ProductShowcase({
    product,
    language,
    onShare,
    onOrder,
}: ProductShowcaseProps) {
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
            {/* Product image placeholder */}
            <div
                className="h-36 flex items-center justify-center text-5xl"
                style={{
                    background: "linear-gradient(135deg, var(--janvyapar-surface), var(--bg-elevated))",
                }}
            >
                {product.category === "Food" ? "🍯" : "🎨"}
            </div>

            <div className="p-4">
                {/* Category + Rating */}
                <div className="flex items-center justify-between mb-2">
                    <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                            background: "var(--janvyapar-surface)",
                            color: "var(--janvyapar-primary)",
                        }}
                    >
                        {product.category}
                    </span>
                    {product.rating && (
                        <div className="flex items-center gap-1">
                            <Star size={12} fill="#FBBF24" color="#FBBF24" />
                            <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                                {product.rating}
                            </span>
                        </div>
                    )}
                </div>

                {/* Name */}
                <h3 className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>
                    {language === "hi" ? product.nameHi : product.name}
                </h3>

                {/* Description */}
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                    {language === "hi" ? product.descriptionHi : product.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {(language === "hi" ? product.featuresHi : product.features).map((f, i) => (
                        <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                                background: "var(--bg-elevated)",
                                color: "var(--text-secondary)",
                            }}
                        >
                            ✅ {f}
                        </span>
                    ))}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                    <Tag size={16} style={{ color: "var(--janvyapar-primary)" }} />
                    <span className="text-lg font-bold" style={{ color: "var(--janvyapar-primary)" }}>
                        ₹{product.priceRange.min} - ₹{product.priceRange.max}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        / {language === "hi" ? product.unitHi : product.unit}
                    </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={onShare}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium"
                        style={{
                            background: "var(--janvyapar-surface)",
                            color: "var(--janvyapar-primary)",
                        }}
                    >
                        <Share2 size={14} />
                        {language === "hi" ? "शेयर करें" : "Share"}
                    </button>
                    <button
                        onClick={onOrder}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium"
                        style={{
                            background: "var(--janvyapar-primary)",
                            color: "#fff",
                        }}
                    >
                        <ShoppingCart size={14} />
                        {language === "hi" ? "ऑर्डर करें" : "Order Now"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
