// ===== JanSathi AI — Careers Knowledge Base (JanKaushal) =====
// Job roles, skills, training resources for rural Indian career guidance.
// Used by the JanKaushal module to provide career path recommendations.

export interface CareerPath {
    id: string;
    title: string;
    titleHi: string;
    category: string;
    categoryHi: string;
    description: string;
    descriptionHi: string;
    salaryRange: string;
    requiredSkills: string[];
    requiredSkillsHi: string[];
    trainingOptions: { name: string; nameHi: string; type: "free" | "paid" | "government"; url?: string }[];
    demandLevel: "high" | "medium" | "low";
}

export const CAREER_PATHS: CareerPath[] = [
    {
        id: "driver",
        title: "Driver / Transport",
        titleHi: "ड्राइवर / ट्रांसपोर्ट",
        category: "Transport & Logistics",
        categoryHi: "परिवहन और लॉजिस्टिक्स",
        description: "Drive taxis, delivery vehicles, or commercial trucks.",
        descriptionHi: "टैक्सी, डिलीवरी वाहन या ट्रक चलाना।",
        salaryRange: "₹12,000 – ₹25,000/month",
        requiredSkills: ["Driving License", "Route Knowledge", "Basic English", "Smartphone Use"],
        requiredSkillsHi: ["ड्राइविंग लाइसेंस", "रास्ते की जानकारी", "बेसिक अंग्रेजी", "स्मार्टफोन चलाना"],
        trainingOptions: [
            { name: "Government ITI Driving Course", nameHi: "सरकारी ITI ड्राइविंग कोर्स", type: "government" },
            { name: "Ola/Uber Partner Program", nameHi: "ओला/उबर पार्टनर प्रोग्राम", type: "free" },
        ],
        demandLevel: "high",
    },
    {
        id: "electrician",
        title: "Electrician",
        titleHi: "इलेक्ट्रीशियन",
        category: "Skilled Trades",
        categoryHi: "कुशल कारीगरी",
        description: "Install and repair electrical wiring, fixtures, and equipment.",
        descriptionHi: "बिजली की वायरिंग, फिक्सचर और उपकरण लगाना व ठीक करना।",
        salaryRange: "₹15,000 – ₹35,000/month",
        requiredSkills: ["Wiring Knowledge", "Safety Procedures", "Tool Handling", "Circuit Reading"],
        requiredSkillsHi: ["वायरिंग की जानकारी", "सुरक्षा प्रक्रिया", "औजार चलाना", "सर्किट पढ़ना"],
        trainingOptions: [
            { name: "ITI Electrician (2 yrs)", nameHi: "ITI इलेक्ट्रीशियन (2 वर्ष)", type: "government" },
            { name: "PMKVY Electrician Short Course", nameHi: "PMKVY इलेक्ट्रीशियन शॉर्ट कोर्स", type: "government" },
        ],
        demandLevel: "high",
    },
    {
        id: "data-entry",
        title: "Data Entry Operator",
        titleHi: "डाटा एंट्री ऑपरेटर",
        category: "Digital & IT",
        categoryHi: "डिजिटल और आईटी",
        description: "Enter data into computer systems, manage spreadsheets and databases.",
        descriptionHi: "कंप्यूटर में डेटा डालना, स्प्रेडशीट और डेटाबेस मैनेज करना।",
        salaryRange: "₹10,000 – ₹20,000/month",
        requiredSkills: ["Typing Speed 30+ WPM", "MS Excel", "Basic Computer", "Hindi/English Typing"],
        requiredSkillsHi: ["30+ WPM टाइपिंग स्पीड", "MS Excel", "बेसिक कंप्यूटर", "हिंदी/अंग्रेजी टाइपिंग"],
        trainingOptions: [
            { name: "NIELIT CCC Course", nameHi: "NIELIT CCC कोर्स", type: "government" },
            { name: "PMGDISHA Digital Literacy", nameHi: "PMGDISHA डिजिटल साक्षरता", type: "free" },
        ],
        demandLevel: "high",
    },
    {
        id: "tailor",
        title: "Tailoring / Fashion",
        titleHi: "सिलाई / फैशन",
        category: "Handcraft & Design",
        categoryHi: "हस्तकला और डिज़ाइन",
        description: "Stitch garments, do embroidery, or run a boutique business.",
        descriptionHi: "कपड़े सिलना, कढ़ाई करना या बुटीक व्यापार चलाना।",
        salaryRange: "₹8,000 – ₹30,000/month",
        requiredSkills: ["Sewing Machine", "Pattern Cutting", "Design Sense", "Customer Handling"],
        requiredSkillsHi: ["सिलाई मशीन", "पैटर्न काटना", "डिज़ाइन समझ", "ग्राहक संभालना"],
        trainingOptions: [
            { name: "NIFT Short Course", nameHi: "NIFT शॉर्ट कोर्स", type: "paid" },
            { name: "PMKVY Tailoring", nameHi: "PMKVY सिलाई कोर्स", type: "government" },
        ],
        demandLevel: "medium",
    },
    {
        id: "healthcare",
        title: "Healthcare Assistant",
        titleHi: "स्वास्थ्य सहायक",
        category: "Healthcare",
        categoryHi: "स्वास्थ्य सेवा",
        description: "Work as ANM nurse, lab technician, or pharmacy assistant.",
        descriptionHi: "ANM नर्स, लैब तकनीशियन या फार्मेसी सहायक के रूप में काम।",
        salaryRange: "₹12,000 – ₹25,000/month",
        requiredSkills: ["First Aid", "Patient Care", "Basic Medical Knowledge", "Record Keeping"],
        requiredSkillsHi: ["प्राथमिक उपचार", "रोगी देखभाल", "बेसिक चिकित्सा ज्ञान", "रिकॉर्ड रखना"],
        trainingOptions: [
            { name: "ANM Diploma (2 yrs)", nameHi: "ANM डिप्लोमा (2 वर्ष)", type: "government" },
            { name: "DMLT (Lab Technician)", nameHi: "DMLT (लैब तकनीशियन)", type: "government" },
        ],
        demandLevel: "high",
    },
    {
        id: "plumber",
        title: "Plumber",
        titleHi: "प्लम्बर",
        category: "Skilled Trades",
        categoryHi: "कुशल कारीगरी",
        description: "Install and repair pipes, fixtures, and water systems.",
        descriptionHi: "पाइप, फिक्सचर और पानी के सिस्टम लगाना व ठीक करना।",
        salaryRange: "₹12,000 – ₹30,000/month",
        requiredSkills: ["Pipe Fitting", "Welding Basics", "Blueprint Reading", "Problem Solving"],
        requiredSkillsHi: ["पाइप फिटिंग", "वेल्डिंग बेसिक्स", "ब्लूप्रिंट पढ़ना", "समस्या सुलझाना"],
        trainingOptions: [
            { name: "ITI Plumber (2 yrs)", nameHi: "ITI प्लम्बर (2 वर्ष)", type: "government" },
            { name: "Skill India Plumbing", nameHi: "स्किल इंडिया प्लम्बिंग", type: "government" },
        ],
        demandLevel: "medium",
    },
    {
        id: "organic-farmer",
        title: "Organic Farmer / Agri-Business",
        titleHi: "जैविक किसान / कृषि व्यापार",
        category: "Agriculture",
        categoryHi: "कृषि",
        description: "Grow organic produce, run dairy/fishery businesses, or sell at mandis.",
        descriptionHi: "जैविक उपज उगाना, डेयरी/मत्स्य व्यापार या मंडी में बेचना।",
        salaryRange: "₹10,000 – ₹50,000/month",
        requiredSkills: ["Soil Management", "Crop Planning", "Marketing", "Government Scheme Knowledge"],
        requiredSkillsHi: ["मिट्टी प्रबंधन", "फसल योजना", "मार्केटिंग", "सरकारी योजनाओं की जानकारी"],
        trainingOptions: [
            { name: "KVK Training (Free)", nameHi: "KVK प्रशिक्षण (मुफ्त)", type: "free" },
            { name: "MANAGE Agri-Business Course", nameHi: "MANAGE कृषि व्यापार कोर्स", type: "government" },
        ],
        demandLevel: "high",
    },
];

/**
 * Find career paths by category or demand level.
 */
export function findCareers(filter?: { category?: string; demandLevel?: "high" | "medium" | "low" }): CareerPath[] {
    if (!filter) return CAREER_PATHS;
    return CAREER_PATHS.filter((c) => {
        if (filter.category && c.category !== filter.category) return false;
        if (filter.demandLevel && c.demandLevel !== filter.demandLevel) return false;
        return true;
    });
}
