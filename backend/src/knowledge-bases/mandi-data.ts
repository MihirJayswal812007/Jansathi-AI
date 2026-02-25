// ===== JanSathi AI — Mandi Price Dataset =====
// Static dataset of crop prices across major Indian mandis.
// Source: Aggregated from Agmarknet/data.gov.in public data.
// Refreshable via future seed script.

export interface MandiPrice {
    crop: string;
    cropHi: string;
    variety: string;
    mandi: string;
    state: string;
    stateHi: string;
    minPrice: number;   // ₹ per quintal
    maxPrice: number;
    modalPrice: number;
    unit: string;
    lastUpdated: string;
    season: string;
}

export const MANDI_DATA: MandiPrice[] = [
    // ── Gehun (Wheat) ───────────────────────────────────────
    { crop: "wheat", cropHi: "गेहूं", variety: "Lokwan", mandi: "Azadpur", state: "Delhi", stateHi: "दिल्ली", minPrice: 2100, maxPrice: 2600, modalPrice: 2350, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "wheat", cropHi: "गेहूं", variety: "Dara", mandi: "Hapur", state: "UP", stateHi: "उत्तर प्रदेश", minPrice: 2050, maxPrice: 2500, modalPrice: 2275, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "wheat", cropHi: "गेहूं", variety: "Sharbati", mandi: "Indore", state: "MP", stateHi: "मध्य प्रदेश", minPrice: 2200, maxPrice: 2800, modalPrice: 2500, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "wheat", cropHi: "गेहूं", variety: "HD-2967", mandi: "Karnal", state: "Haryana", stateHi: "हरियाणा", minPrice: 2150, maxPrice: 2650, modalPrice: 2400, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "wheat", cropHi: "गेहूं", variety: "PBW-343", mandi: "Amritsar", state: "Punjab", stateHi: "पंजाब", minPrice: 2100, maxPrice: 2550, modalPrice: 2325, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "wheat", cropHi: "गेहूं", variety: "Lokwan", mandi: "Jaipur", state: "Rajasthan", stateHi: "राजस्थान", minPrice: 2000, maxPrice: 2450, modalPrice: 2225, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },

    // ── Dhan (Rice/Paddy) ──────────────────────────────────
    { crop: "rice", cropHi: "धान", variety: "Basmati 1121", mandi: "Karnal", state: "Haryana", stateHi: "हरियाणा", minPrice: 3800, maxPrice: 4500, modalPrice: 4150, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "rice", cropHi: "धान", variety: "Swarna", mandi: "Patna", state: "Bihar", stateHi: "बिहार", minPrice: 1800, maxPrice: 2300, modalPrice: 2050, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "rice", cropHi: "धान", variety: "IR-64", mandi: "Raipur", state: "Chhattisgarh", stateHi: "छत्तीसगढ़", minPrice: 1900, maxPrice: 2400, modalPrice: 2150, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "rice", cropHi: "धान", variety: "Sona Masuri", mandi: "Nizamabad", state: "Telangana", stateHi: "तेलंगाना", minPrice: 2800, maxPrice: 3400, modalPrice: 3100, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "rice", cropHi: "धान", variety: "Pusa Basmati", mandi: "Amritsar", state: "Punjab", stateHi: "पंजाब", minPrice: 3500, maxPrice: 4200, modalPrice: 3850, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },

    // ── Chana (Chickpea) ───────────────────────────────────
    { crop: "chickpea", cropHi: "चना", variety: "Desi", mandi: "Indore", state: "MP", stateHi: "मध्य प्रदेश", minPrice: 4800, maxPrice: 5600, modalPrice: 5200, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "chickpea", cropHi: "चना", variety: "Kabuli", mandi: "Bikaner", state: "Rajasthan", stateHi: "राजस्थान", minPrice: 6500, maxPrice: 7800, modalPrice: 7150, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "chickpea", cropHi: "चना", variety: "Desi", mandi: "Latur", state: "Maharashtra", stateHi: "महाराष्ट्र", minPrice: 4600, maxPrice: 5400, modalPrice: 5000, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "chickpea", cropHi: "चना", variety: "Desi", mandi: "Jaipur", state: "Rajasthan", stateHi: "राजस्थान", minPrice: 4700, maxPrice: 5500, modalPrice: 5100, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },

    // ── Sarson (Mustard) ───────────────────────────────────
    { crop: "mustard", cropHi: "सरसों", variety: "Rai/Sarson", mandi: "Jaipur", state: "Rajasthan", stateHi: "राजस्थान", minPrice: 5000, maxPrice: 5800, modalPrice: 5400, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "mustard", cropHi: "सरसों", variety: "Rai", mandi: "Agra", state: "UP", stateHi: "उत्तर प्रदेश", minPrice: 4800, maxPrice: 5600, modalPrice: 5200, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "mustard", cropHi: "सरसों", variety: "Sarson", mandi: "Bharatpur", state: "Rajasthan", stateHi: "राजस्थान", minPrice: 5100, maxPrice: 5900, modalPrice: 5500, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },

    // ── Pyaaz (Onion) ──────────────────────────────────────
    { crop: "onion", cropHi: "प्याज़", variety: "Red", mandi: "Lasalgaon", state: "Maharashtra", stateHi: "महाराष्ट्र", minPrice: 800, maxPrice: 2200, modalPrice: 1500, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "onion", cropHi: "प्याज़", variety: "Red", mandi: "Azadpur", state: "Delhi", stateHi: "दिल्ली", minPrice: 1000, maxPrice: 2500, modalPrice: 1750, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "onion", cropHi: "प्याज़", variety: "White", mandi: "Vashi", state: "Maharashtra", stateHi: "महाराष्ट्र", minPrice: 900, maxPrice: 2300, modalPrice: 1600, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "onion", cropHi: "प्याज़", variety: "Red", mandi: "Hubli", state: "Karnataka", stateHi: "कर्नाटक", minPrice: 700, maxPrice: 2000, modalPrice: 1350, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },

    // ── Tamatar (Tomato) ───────────────────────────────────
    { crop: "tomato", cropHi: "टमाटर", variety: "Local", mandi: "Azadpur", state: "Delhi", stateHi: "दिल्ली", minPrice: 600, maxPrice: 3500, modalPrice: 2050, unit: "quintal", lastUpdated: "2026-02-01", season: "all" },
    { crop: "tomato", cropHi: "टमाटर", variety: "Hybrid", mandi: "Kolar", state: "Karnataka", stateHi: "कर्नाटक", minPrice: 400, maxPrice: 3000, modalPrice: 1700, unit: "quintal", lastUpdated: "2026-02-01", season: "all" },
    { crop: "tomato", cropHi: "टमाटर", variety: "Local", mandi: "Vashi", state: "Maharashtra", stateHi: "महाराष्ट्र", minPrice: 500, maxPrice: 3200, modalPrice: 1850, unit: "quintal", lastUpdated: "2026-02-01", season: "all" },

    // ── Aalu (Potato) ──────────────────────────────────────
    { crop: "potato", cropHi: "आलू", variety: "Kufri Jyoti", mandi: "Azadpur", state: "Delhi", stateHi: "दिल्ली", minPrice: 600, maxPrice: 1400, modalPrice: 1000, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "potato", cropHi: "आलू", variety: "Chandramukhi", mandi: "Agra", state: "UP", stateHi: "उत्तर प्रदेश", minPrice: 500, maxPrice: 1200, modalPrice: 850, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "potato", cropHi: "आलू", variety: "Local", mandi: "Patna", state: "Bihar", stateHi: "बिहार", minPrice: 550, maxPrice: 1300, modalPrice: 925, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },

    // ── Soyabean ───────────────────────────────────────────
    { crop: "soybean", cropHi: "सोयाबीन", variety: "Yellow", mandi: "Indore", state: "MP", stateHi: "मध्य प्रदेश", minPrice: 4200, maxPrice: 5000, modalPrice: 4600, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "soybean", cropHi: "सोयाबीन", variety: "Yellow", mandi: "Latur", state: "Maharashtra", stateHi: "महाराष्ट्र", minPrice: 4000, maxPrice: 4800, modalPrice: 4400, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "soybean", cropHi: "सोयाबीन", variety: "Yellow", mandi: "Nagpur", state: "Maharashtra", stateHi: "महाराष्ट्र", minPrice: 4100, maxPrice: 4900, modalPrice: 4500, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },

    // ── Makka (Maize/Corn) ─────────────────────────────────
    { crop: "maize", cropHi: "मक्का", variety: "Yellow", mandi: "Davangere", state: "Karnataka", stateHi: "कर्नाटक", minPrice: 1800, maxPrice: 2300, modalPrice: 2050, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "maize", cropHi: "मक्का", variety: "Desi", mandi: "Hapur", state: "UP", stateHi: "उत्तर प्रदेश", minPrice: 1700, maxPrice: 2200, modalPrice: 1950, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "maize", cropHi: "मक्का", variety: "Yellow", mandi: "Gulbarga", state: "Karnataka", stateHi: "कर्नाटक", minPrice: 1750, maxPrice: 2250, modalPrice: 2000, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },

    // ── Kapas (Cotton) ─────────────────────────────────────
    { crop: "cotton", cropHi: "कपास", variety: "Shankar-6", mandi: "Rajkot", state: "Gujarat", stateHi: "गुजरात", minPrice: 6500, maxPrice: 7500, modalPrice: 7000, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "cotton", cropHi: "कपास", variety: "DCH-32", mandi: "Hubli", state: "Karnataka", stateHi: "कर्नाटक", minPrice: 6200, maxPrice: 7200, modalPrice: 6700, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "cotton", cropHi: "कपास", variety: "H-777", mandi: "Sirsa", state: "Haryana", stateHi: "हरियाणा", minPrice: 6300, maxPrice: 7300, modalPrice: 6800, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },

    // ── Moong (Green Gram) ─────────────────────────────────
    { crop: "moong", cropHi: "मूंग", variety: "Green", mandi: "Bikaner", state: "Rajasthan", stateHi: "राजस्थान", minPrice: 7000, maxPrice: 8200, modalPrice: 7600, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "moong", cropHi: "मूंग", variety: "Green", mandi: "Indore", state: "MP", stateHi: "मध्य प्रदेश", minPrice: 6800, maxPrice: 8000, modalPrice: 7400, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },

    // ── Masoor (Lentil) ────────────────────────────────────
    { crop: "lentil", cropHi: "मसूर", variety: "Bold", mandi: "Indore", state: "MP", stateHi: "मध्य प्रदेश", minPrice: 5500, maxPrice: 6500, modalPrice: 6000, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "lentil", cropHi: "मसूर", variety: "Medium", mandi: "Varanasi", state: "UP", stateHi: "उत्तर प्रदेश", minPrice: 5200, maxPrice: 6200, modalPrice: 5700, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },

    // ── Ganna (Sugarcane) ──────────────────────────────────
    { crop: "sugarcane", cropHi: "गन्ना", variety: "CO-0238", mandi: "Muzaffarnagar", state: "UP", stateHi: "उत्तर प्रदेश", minPrice: 340, maxPrice: 380, modalPrice: 360, unit: "quintal", lastUpdated: "2026-02-01", season: "all" },
    { crop: "sugarcane", cropHi: "गन्ना", variety: "CO-86032", mandi: "Pune", state: "Maharashtra", stateHi: "महाराष्ट्र", minPrice: 310, maxPrice: 350, modalPrice: 330, unit: "quintal", lastUpdated: "2026-02-01", season: "all" },

    // ── Lahsun (Garlic) ────────────────────────────────────
    { crop: "garlic", cropHi: "लहसुन", variety: "Desi", mandi: "Rajkot", state: "Gujarat", stateHi: "गुजरात", minPrice: 2000, maxPrice: 8000, modalPrice: 5000, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "garlic", cropHi: "लहसुन", variety: "Desi", mandi: "Indore", state: "MP", stateHi: "मध्य प्रदेश", minPrice: 1800, maxPrice: 7500, modalPrice: 4650, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },

    // ── Mirch (Chilli) ─────────────────────────────────────
    { crop: "chilli", cropHi: "मिर्च", variety: "Teja S17", mandi: "Guntur", state: "Andhra Pradesh", stateHi: "आंध्र प्रदेश", minPrice: 12000, maxPrice: 18000, modalPrice: 15000, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "chilli", cropHi: "मिर्च", variety: "Bydagi", mandi: "Hubli", state: "Karnataka", stateHi: "कर्नाटक", minPrice: 14000, maxPrice: 20000, modalPrice: 17000, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },

    // ── Haldi (Turmeric) ───────────────────────────────────
    { crop: "turmeric", cropHi: "हल्दी", variety: "Finger", mandi: "Nizamabad", state: "Telangana", stateHi: "तेलंगाना", minPrice: 8000, maxPrice: 14000, modalPrice: 11000, unit: "quintal", lastUpdated: "2026-02-01", season: "all" },
    { crop: "turmeric", cropHi: "हल्दी", variety: "Erode", mandi: "Erode", state: "Tamil Nadu", stateHi: "तमिल नाडु", minPrice: 9000, maxPrice: 15000, modalPrice: 12000, unit: "quintal", lastUpdated: "2026-02-01", season: "all" },

    // ── Baajra (Pearl Millet) ──────────────────────────────
    { crop: "pearl_millet", cropHi: "बाजरा", variety: "Desi", mandi: "Jaipur", state: "Rajasthan", stateHi: "राजस्थान", minPrice: 2100, maxPrice: 2700, modalPrice: 2400, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "pearl_millet", cropHi: "बाजरा", variety: "Hybrid", mandi: "Jodhpur", state: "Rajasthan", stateHi: "राजस्थान", minPrice: 2000, maxPrice: 2600, modalPrice: 2300, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },

    // ── Moongfali (Groundnut) ──────────────────────────────
    { crop: "groundnut", cropHi: "मूंगफली", variety: "Bold", mandi: "Rajkot", state: "Gujarat", stateHi: "गुजरात", minPrice: 5500, maxPrice: 6800, modalPrice: 6150, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },
    { crop: "groundnut", cropHi: "मूंगफली", variety: "Java", mandi: "Junagadh", state: "Gujarat", stateHi: "गुजरात", minPrice: 5200, maxPrice: 6500, modalPrice: 5850, unit: "quintal", lastUpdated: "2026-02-01", season: "kharif" },

    // ── Jeera (Cumin) ──────────────────────────────────────
    { crop: "cumin", cropHi: "जीरा", variety: "Local", mandi: "Unjha", state: "Gujarat", stateHi: "गुजरात", minPrice: 30000, maxPrice: 42000, modalPrice: 36000, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "cumin", cropHi: "जीरा", variety: "Local", mandi: "Jodhpur", state: "Rajasthan", stateHi: "राजस्थान", minPrice: 28000, maxPrice: 40000, modalPrice: 34000, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },

    // ── Dhaniya (Coriander) ────────────────────────────────
    { crop: "coriander", cropHi: "धनिया", variety: "Eagle", mandi: "Kota", state: "Rajasthan", stateHi: "राजस्थान", minPrice: 6000, maxPrice: 8000, modalPrice: 7000, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
    { crop: "coriander", cropHi: "धनिया", variety: "Local", mandi: "Indore", state: "MP", stateHi: "मध्य प्रदेश", minPrice: 5800, maxPrice: 7800, modalPrice: 6800, unit: "quintal", lastUpdated: "2026-02-01", season: "rabi" },
];

// ── Aliases for Hindi search ─────────────────────────────
export const CROP_ALIASES: Record<string, string> = {
    gehun: "wheat", gehu: "wheat", गेहूं: "wheat", गेहू: "wheat",
    dhan: "rice", chawal: "rice", धान: "rice", चावल: "rice",
    chana: "chickpea", चना: "chickpea",
    sarson: "mustard", सरसों: "mustard",
    pyaaz: "onion", pyaj: "onion", प्याज: "onion", प्याज़: "onion",
    tamatar: "tomato", टमाटर: "tomato",
    aalu: "potato", आलू: "potato",
    soyabean: "soybean", सोयाबीन: "soybean",
    makka: "maize", मक्का: "maize",
    kapas: "cotton", कपास: "cotton",
    moong: "moong", मूंग: "moong",
    masoor: "lentil", मसूर: "lentil",
    ganna: "sugarcane", गन्ना: "sugarcane",
    lahsun: "garlic", लहसुन: "garlic",
    mirch: "chilli", मिर्च: "chilli",
    haldi: "turmeric", हल्दी: "turmeric",
    bajra: "pearl_millet", baajra: "pearl_millet", बाजरा: "pearl_millet",
    moongfali: "groundnut", मूंगफली: "groundnut",
    jeera: "cumin", जीरा: "cumin",
    dhaniya: "coriander", धनिया: "coriander",
};
