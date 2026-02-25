// ===== JanSathi AI — Constants & Module Configuration =====

import { ModeConfig, ModeName } from "@/types/modules";

// ── Module Configurations with Colour Psychology ──────────────────

export const MODE_CONFIGS: Record<ModeName, ModeConfig> = {
    janseva: {
        id: "janseva",
        name: "JanSeva",
        nameHi: "जनसेवा",
        tagline: "Civic Connect",
        taglineHi: "नागरिक सेवा",
        icon: "🏛️",
        primaryColor: "#2563EB",
        gradient: "linear-gradient(135deg, #2563EB, #60A5FA)",
        surfaceColor: "rgba(37, 99, 235, 0.12)",
        description: "Government schemes, documents & civic services",
        descriptionHi: "सरकारी योजनाएं, दस्तावेज़ और नागरिक सेवाएं",
        quickActions: [
            {
                label: "Check scheme eligibility",
                labelHi: "योजना पात्रता जांचें",
                query: "Am I eligible for PM Awas Yojana?",
            },
            {
                label: "Document help",
                labelHi: "दस्तावेज़ सहायता",
                query: "What documents do I need for Aadhaar card?",
            },
            {
                label: "File a complaint",
                labelHi: "शिकायत दर्ज करें",
                query: "I want to file a complaint about road conditions",
            },
        ],
    },

    janshiksha: {
        id: "janshiksha",
        name: "JanShiksha",
        nameHi: "जनशिक्षा",
        tagline: "Edu Mentor",
        taglineHi: "शिक्षा मित्र",
        icon: "🎓",
        primaryColor: "#7C3AED",
        gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
        surfaceColor: "rgba(124, 58, 237, 0.12)",
        description: "Learn, practice & prepare for exams",
        descriptionHi: "सीखें, अभ्यास करें और परीक्षा की तैयारी करें",
        quickActions: [
            {
                label: "Explain a concept",
                labelHi: "कोई अवधारणा समझाएं",
                query: "Explain photosynthesis simply",
            },
            {
                label: "Practice quiz",
                labelHi: "अभ्यास प्रश्नोत्तरी",
                query: "Give me 5 questions on fractions for class 6",
            },
            {
                label: "Homework help",
                labelHi: "होमवर्क मदद",
                query: "Help me solve this math problem",
            },
        ],
    },

    jankrishi: {
        id: "jankrishi",
        name: "JanKrishi",
        nameHi: "जनकृषि",
        tagline: "Agri Advisor",
        taglineHi: "कृषि सलाहकार",
        icon: "🌾",
        primaryColor: "#059669",
        gradient: "linear-gradient(135deg, #059669, #34D399)",
        surfaceColor: "rgba(5, 150, 105, 0.12)",
        description: "Crop diseases, weather alerts & mandi prices",
        descriptionHi: "फसल रोग, मौसम अलर्ट और मंडी भाव",
        quickActions: [
            {
                label: "Crop disease help",
                labelHi: "फसल रोग सहायता",
                query: "My wheat crop has yellow spots on leaves",
            },
            {
                label: "Today's mandi prices",
                labelHi: "आज के मंडी भाव",
                query: "What is the price of wheat in the nearest mandi?",
            },
            {
                label: "Weather forecast",
                labelHi: "मौसम पूर्वानुमान",
                query: "Will it rain this week in my area?",
            },
        ],
    },

    janvyapar: {
        id: "janvyapar",
        name: "JanVyapar",
        nameHi: "जनव्यापार",
        tagline: "Gram Market",
        taglineHi: "ग्राम बाज़ार",
        icon: "💹",
        primaryColor: "#D97706",
        gradient: "linear-gradient(135deg, #D97706, #FBBF24)",
        surfaceColor: "rgba(217, 119, 6, 0.12)",
        description: "Sell products, pricing & digital storefront",
        descriptionHi: "उत्पाद बेचें, मूल्य निर्धारण और डिजिटल दुकान",
        quickActions: [
            {
                label: "Create product listing",
                labelHi: "उत्पाद सूची बनाएं",
                query: "I want to sell my homemade pickles online",
            },
            {
                label: "Price suggestion",
                labelHi: "मूल्य सुझाव",
                query: "What should I price my honey at?",
            },
            {
                label: "Build catalog",
                labelHi: "कैटलॉग बनाएं",
                query: "Create a WhatsApp catalog for my products",
            },
        ],
    },

    jankaushal: {
        id: "jankaushal",
        name: "JanKaushal",
        nameHi: "जनकौशल",
        tagline: "Skill Udaan",
        taglineHi: "कौशल उड़ान",
        icon: "🚀",
        primaryColor: "#DC2626",
        gradient: "linear-gradient(135deg, #DC2626, #F87171)",
        surfaceColor: "rgba(220, 38, 38, 0.12)",
        description: "Jobs, resume builder & career guidance",
        descriptionHi: "नौकरी, रिज्यूमे बिल्डर और करियर मार्गदर्शन",
        quickActions: [
            {
                label: "Build my resume",
                labelHi: "मेरा रिज्यूमे बनाएं",
                query: "Help me create a resume",
            },
            {
                label: "Find jobs nearby",
                labelHi: "पास में नौकरी खोजें",
                query: "What jobs are available near me?",
            },
            {
                label: "Practice interview",
                labelHi: "इंटरव्यू अभ्यास",
                query: "Give me mock interview questions for a driver job",
            },
        ],
    },
};

export const ALL_MODES: ModeName[] = [
    "janseva",
    "janshiksha",
    "jankrishi",
    "janvyapar",
    "jankaushal",
];

export const APP_NAME = "JanSathi AI";
export const APP_TAGLINE = "One Platform. Five Pillars. Infinite Impact.";
export const APP_TAGLINE_HI = "एक मंच। पांच स्तंभ। अनंत प्रभाव।";
