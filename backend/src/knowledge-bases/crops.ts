// ===== JanSathi AI — Crop Diseases Knowledge Base =====

export const CROPS_DATA = [
    {
        id: "wheat",
        name: "Wheat (Gehun)",
        nameHi: "गेहूं",
        diseases: [
            {
                name: "Yellow Rust (Pila Rust)",
                nameHi: "पीला रस्ट",
                symptoms: ["Yellow stripes on leaves", "Pustules on upper leaf surface", "Leaves dry and curl"],
                treatment: {
                    chemical: "Propiconazole (Tilt 25 EC) — 1 ml/litre water, spray twice at 15-day interval",
                    organic: "Neem oil spray (5ml/litre) as preventive measure",
                },
                urgency: "high",
                prevention: "Use resistant varieties (HD-3226, PBW-824), timely sowing",
            },
            {
                name: "Karnal Bunt",
                nameHi: "करनाल बंट",
                symptoms: ["Black powder in grain", "Fishy smell from grain", "Partial blackening of kernels"],
                treatment: {
                    chemical: "Thiram/Carboxin seed treatment (2.5g/kg seed) before sowing",
                    organic: "Use certified disease-free seeds, crop rotation",
                },
                urgency: "medium",
                prevention: "Use certified seeds, avoid late sowing",
            },
        ],
        season: "Rabi (Oct-Mar)",
        states: ["UP", "MP", "Punjab", "Haryana", "Rajasthan"],
    },
    {
        id: "rice",
        name: "Rice (Dhan)",
        nameHi: "धान",
        diseases: [
            {
                name: "Blast (Jhulsa Rog)",
                nameHi: "झुलसा रोग",
                symptoms: ["Diamond-shaped spots on leaves", "Neck rot", "White/grey lesions"],
                treatment: {
                    chemical: "Tricyclazole (Beam 75 WP) — 0.6g/litre water spray",
                    organic: "Pseudomonas fluorescens spray (10g/litre)",
                },
                urgency: "high",
                prevention: "Balanced nitrogen fertilizer, resistant varieties",
            },
            {
                name: "Brown Spot",
                nameHi: "भूरा धब्बा",
                symptoms: ["Oval brown spots on leaves", "Spots with grey center", "Leaf yellowing"],
                treatment: {
                    chemical: "Mancozeb (Dithane M-45) — 2.5g/litre water",
                    organic: "Trichoderma viride seed treatment",
                },
                urgency: "medium",
                prevention: "Proper spacing, balanced nutrition, seed treatment",
            },
        ],
        season: "Kharif (Jun-Nov)",
        states: ["WB", "UP", "Punjab", "Bihar", "Assam", "TN"],
    },
    {
        id: "tomato",
        name: "Tomato (Tamatar)",
        nameHi: "टमाटर",
        diseases: [
            {
                name: "Late Blight",
                nameHi: "पछेता अंगमारी",
                symptoms: ["Dark water-soaked patches on leaves", "White mold underneath leaves", "Fruit rot"],
                treatment: {
                    chemical: "Metalaxyl + Mancozeb (Ridomil Gold) — 2g/litre spray",
                    organic: "Copper oxychloride spray (3g/litre), remove infected parts",
                },
                urgency: "high",
                prevention: "Proper draining, avoid overhead irrigation, crop rotation",
            },
        ],
        season: "All year (varies by region)",
        states: ["All states"],
    },
    {
        id: "cotton",
        name: "Cotton (Kapas)",
        nameHi: "कपास",
        diseases: [
            {
                name: "Bollworm",
                nameHi: "बॉलवर्म",
                symptoms: ["Holes in bolls", "Larva inside bolls", "Premature boll opening"],
                treatment: {
                    chemical: "Emamectin Benzoate 5 SG — 0.4g/litre spray",
                    organic: "Bt spray, pheromone traps, neem oil",
                },
                urgency: "high",
                prevention: "Bt cotton varieties, pheromone traps, early sowing",
            },
        ],
        season: "Kharif (Jun-Dec)",
        states: ["Gujarat", "Maharashtra", "Telangana", "MP", "Rajasthan"],
    },
];

export type CropData = (typeof CROPS_DATA)[number];
