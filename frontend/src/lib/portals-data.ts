// ===== JanSathi AI — Government Portals Directory =====
// Comprehensive list of verified Indian government portals with Hindi translations.

export interface GovPortal {
    id: string;
    name: string;
    nameHi: string;
    url: string;
    description: string;
    descriptionHi: string;
    category: PortalCategory;
    icon: string;
}

export type PortalCategory =
    | "schemes"
    | "identity"
    | "citizen"
    | "employment"
    | "agriculture"
    | "health"
    | "finance"
    | "education";

export const CATEGORY_LABELS: Record<PortalCategory, { en: string; hi: string; color: string }> = {
    schemes: { en: "Schemes & Benefits", hi: "योजनाएं और लाभ", color: "#3B82F6" },
    identity: { en: "Identity & Documents", hi: "पहचान और दस्तावेज़", color: "#8B5CF6" },
    citizen: { en: "Citizen Services", hi: "नागरिक सेवाएं", color: "#10B981" },
    employment: { en: "Employment & Skills", hi: "रोज़गार और कौशल", color: "#F59E0B" },
    agriculture: { en: "Agriculture", hi: "कृषि", color: "#22C55E" },
    health: { en: "Health", hi: "स्वास्थ्य", color: "#EF4444" },
    finance: { en: "Finance & Tax", hi: "वित्त और कर", color: "#06B6D4" },
    education: { en: "Education", hi: "शिक्षा", color: "#EC4899" },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as PortalCategory[];

export const GOV_PORTALS: GovPortal[] = [
    // ── Schemes & Benefits ──────────────────────────────────
    {
        id: "myscheme",
        name: "myScheme",
        nameHi: "मेरी योजना",
        url: "https://www.myscheme.gov.in",
        description: "National platform to discover and apply for 1,000+ central and state government schemes. Find schemes based on your eligibility across categories like social welfare, agriculture, and business.",
        descriptionHi: "1,000+ केंद्र और राज्य सरकार की योजनाओं को खोजने और आवेदन करने का राष्ट्रीय मंच। सामाजिक कल्याण, कृषि और व्यापार जैसी श्रेणियों में अपनी पात्रता के आधार पर योजनाएं खोजें।",
        category: "schemes",
        icon: "search",
    },
    {
        id: "jansamarth",
        name: "JanSamarth Portal",
        nameHi: "जनसमर्थ पोर्टल",
        url: "https://www.jansamarth.in",
        description: "Digital portal linking 15 credit-linked government schemes on a single platform. Apply for education loans, MUDRA loans, housing loans, and other financial assistance.",
        descriptionHi: "15 ऋण-लिंक्ड सरकारी योजनाओं को एक मंच पर जोड़ने वाला डिजिटल पोर्टल। शिक्षा ऋण, मुद्रा ऋण, आवास ऋण और अन्य वित्तीय सहायता के लिए आवेदन करें।",
        category: "schemes",
        icon: "account_balance",
    },
    {
        id: "nsp",
        name: "National Scholarships Portal",
        nameHi: "राष्ट्रीय छात्रवृत्ति पोर्टल",
        url: "https://scholarships.gov.in",
        description: "One-stop portal for 76+ scholarship schemes from 22 ministries. Apply, track status, and receive scholarship payments directly to your bank account.",
        descriptionHi: "22 मंत्रालयों की 76+ छात्रवृत्ति योजनाओं के लिए एक-स्टॉप पोर्टल। आवेदन करें, स्थिति ट्रैक करें, और छात्रवृत्ति भुगतान सीधे अपने बैंक खाते में प्राप्त करें।",
        category: "schemes",
        icon: "school",
    },
    {
        id: "dbt",
        name: "DBT Bharat",
        nameHi: "डीबीटी भारत",
        url: "https://dbtbharat.gov.in",
        description: "Direct Benefit Transfer portal ensuring government subsidies and financial assistance reach beneficiaries directly in their bank accounts, eliminating middlemen.",
        descriptionHi: "प्रत्यक्ष लाभ अंतरण पोर्टल जो सुनिश्चित करता है कि सरकारी सब्सिडी और वित्तीय सहायता सीधे लाभार्थियों के बैंक खातों में पहुंचे, बिचौलियों को समाप्त करे।",
        category: "schemes",
        icon: "payments",
    },

    // ── Identity & Documents ────────────────────────────────
    {
        id: "digilocker",
        name: "DigiLocker",
        nameHi: "डिजिलॉकर",
        url: "https://www.digilocker.gov.in",
        description: "Secure cloud-based platform to store, access, and share official documents digitally — Aadhaar, PAN, driving license, mark sheets, and more. Part of Digital India initiative.",
        descriptionHi: "आधिकारिक दस्तावेज़ों को डिजिटल रूप से संग्रहीत, एक्सेस और साझा करने का सुरक्षित क्लाउड-आधारित मंच — आधार, पैन, ड्राइविंग लाइसेंस, मार्कशीट आदि। डिजिटल इंडिया पहल का हिस्सा।",
        category: "identity",
        icon: "folder_shared",
    },
    {
        id: "uidai",
        name: "UIDAI (Aadhaar)",
        nameHi: "यूआईडीएआई (आधार)",
        url: "https://uidai.gov.in",
        description: "Official portal for Aadhaar services — enrolment, update, download e-Aadhaar, check status, lock/unlock biometrics, and verify Aadhaar number.",
        descriptionHi: "आधार सेवाओं के लिए आधिकारिक पोर्टल — नामांकन, अपडेट, ई-आधार डाउनलोड, स्थिति जांचें, बायोमेट्रिक्स लॉक/अनलॉक करें, और आधार नंबर सत्यापित करें।",
        category: "identity",
        icon: "fingerprint",
    },
    {
        id: "passport-seva",
        name: "Passport Seva",
        nameHi: "पासपोर्ट सेवा",
        url: "https://www.passportindia.gov.in",
        description: "Apply for new passports, renew existing ones, track application status, and schedule appointments at Passport Seva Kendras across India.",
        descriptionHi: "नए पासपोर्ट के लिए आवेदन करें, मौजूदा को नवीनीकृत करें, आवेदन की स्थिति ट्रैक करें, और भारत भर के पासपोर्ट सेवा केंद्रों में अपॉइंटमेंट शेड्यूल करें।",
        category: "identity",
        icon: "badge",
    },

    // ── Citizen Services ────────────────────────────────────
    {
        id: "umang",
        name: "UMANG",
        nameHi: "उमंग",
        url: "https://web.umang.gov.in",
        description: "Unified Mobile App for New-age Governance — access 1,700+ government services from central, state, and local bodies through a single portal. PF, Aadhaar, bills, and more.",
        descriptionHi: "नई-युग शासन के लिए एकीकृत मोबाइल ऐप — एक पोर्टल के माध्यम से केंद्र, राज्य और स्थानीय निकायों की 1,700+ सरकारी सेवाओं तक पहुंचें। पीएफ, आधार, बिल और बहुत कुछ।",
        category: "citizen",
        icon: "phone_android",
    },
    {
        id: "india-gov",
        name: "National Portal of India",
        nameHi: "भारत का राष्ट्रीय पोर्टल",
        url: "https://india.gov.in",
        description: "Single-window access for information and services from Indian government — links to 6,700+ government websites, online services, citizen charters, and RTI resources.",
        descriptionHi: "भारत सरकार की जानकारी और सेवाओं के लिए एकल-खिड़की पहुंच — 6,700+ सरकारी वेबसाइटों, ऑनलाइन सेवाओं, नागरिक चार्टर और आरटीआई संसाधनों से लिंक।",
        category: "citizen",
        icon: "public",
    },
    {
        id: "cpgrams",
        name: "CPGRAMS",
        nameHi: "सीपीजीआरएएमएस",
        url: "https://pgportal.gov.in",
        description: "Centralized Public Grievance Redress and Monitoring System — file complaints against government departments and track resolution status online.",
        descriptionHi: "केंद्रीकृत सार्वजनिक शिकायत निवारण और निगरानी प्रणाली — सरकारी विभागों के खिलाफ शिकायत दर्ज करें और ऑनलाइन समाधान की स्थिति ट्रैक करें।",
        category: "citizen",
        icon: "report",
    },
    {
        id: "mygov",
        name: "MyGov",
        nameHi: "मेरी सरकार",
        url: "https://www.mygov.in",
        description: "Citizen engagement platform — participate in discussions, polls, tasks, and policy consultations. Share ideas and contribute to governance and nation building.",
        descriptionHi: "नागरिक सहभागिता मंच — चर्चाओं, मतदानों, कार्यों और नीति परामर्शों में भाग लें। विचार साझा करें और शासन और राष्ट्र निर्माण में योगदान दें।",
        category: "citizen",
        icon: "groups",
    },

    // ── Employment & Skills ─────────────────────────────────
    {
        id: "ncs",
        name: "National Career Service",
        nameHi: "राष्ट्रीय करियर सेवा",
        url: "https://www.ncs.gov.in",
        description: "One-stop career portal — search jobs in government and private sectors, register as job seeker, access career counselling, and find local employment exchanges.",
        descriptionHi: "एक-स्टॉप करियर पोर्टल — सरकारी और निजी क्षेत्रों में नौकरियां खोजें, जॉब सीकर के रूप में पंजीकरण करें, करियर परामर्श प्राप्त करें, और स्थानीय रोजगार कार्यालय खोजें।",
        category: "employment",
        icon: "work",
    },
    {
        id: "skill-india",
        name: "Skill India Digital",
        nameHi: "स्किल इंडिया डिजिटल",
        url: "https://www.skillindia.gov.in",
        description: "Free online courses and certifications in technology, AI, finance, healthcare, and more. Get certified, build your resume, and apply for relevant jobs.",
        descriptionHi: "प्रौद्योगिकी, एआई, वित्त, स्वास्थ्य सेवा और अन्य में मुफ्त ऑनलाइन पाठ्यक्रम और प्रमाणपत्र। प्रमाणित हों, अपना बायोडाटा बनाएं और प्रासंगिक नौकरियों के लिए आवेदन करें।",
        category: "employment",
        icon: "workspace_premium",
    },
    {
        id: "swayam",
        name: "SWAYAM",
        nameHi: "स्वयं",
        url: "https://swayam.gov.in",
        description: "Free online courses from top Indian universities and IITs — Class 9 to post-graduation. Earn certificates and academic credits through MOOCs.",
        descriptionHi: "शीर्ष भारतीय विश्वविद्यालयों और आईआईटी से मुफ्त ऑनलाइन पाठ्यक्रम — कक्षा 9 से स्नातकोत्तर तक। MOOCs के माध्यम से प्रमाणपत्र और शैक्षणिक क्रेडिट अर्जित करें।",
        category: "employment",
        icon: "auto_stories",
    },

    // ── Agriculture ─────────────────────────────────────────
    {
        id: "farmers-portal",
        name: "Farmer's Portal",
        nameHi: "किसान पोर्टल",
        url: "https://farmer.gov.in",
        description: "Comprehensive resource for farmers — information on seeds, fertilizers, pesticides, credit, best practices, crop insurance, market prices, and weather forecasts.",
        descriptionHi: "किसानों के लिए व्यापक संसाधन — बीज, उर्वरक, कीटनाशक, ऋण, सर्वोत्तम प्रथाएं, फसल बीमा, बाजार भाव और मौसम पूर्वानुमान की जानकारी।",
        category: "agriculture",
        icon: "agriculture",
    },
    {
        id: "pm-kisan",
        name: "PM-KISAN",
        nameHi: "पीएम-किसान",
        url: "https://pmkisan.gov.in",
        description: "PM Kisan Samman Nidhi — check beneficiary status, register for ₹6,000/year income support, and track installment payments directly to farmer bank accounts.",
        descriptionHi: "पीएम किसान सम्मान निधि — लाभार्थी स्थिति जांचें, ₹6,000/वर्ष आय सहायता के लिए पंजीकरण करें, और किसान बैंक खातों में सीधे किस्त भुगतान ट्रैक करें।",
        category: "agriculture",
        icon: "grass",
    },
    {
        id: "crop-insurance",
        name: "Crop Insurance (PMFBY)",
        nameHi: "फसल बीमा (पीएमएफबीवाई)",
        url: "https://pmfby.gov.in",
        description: "Pradhan Mantri Fasal Bima Yojana — check crop insurance coverage, calculate premiums, file claims, and track compensation for crop damage due to natural calamities.",
        descriptionHi: "प्रधानमंत्री फसल बीमा योजना — फसल बीमा कवरेज जांचें, प्रीमियम की गणना करें, दावा दायर करें, और प्राकृतिक आपदाओं से फसल क्षति के लिए मुआवज़ा ट्रैक करें।",
        category: "agriculture",
        icon: "shield",
    },
    {
        id: "enam",
        name: "eNAM (e-Mandi)",
        nameHi: "ईनाम (ई-मंडी)",
        url: "https://enam.gov.in",
        description: "Electronic National Agriculture Market — trade agricultural commodities online across state mandis. Check real-time prices, find buyers, and ensure fair deals for farmers.",
        descriptionHi: "इलेक्ट्रॉनिक राष्ट्रीय कृषि बाज़ार — राज्य मंडियों में ऑनलाइन कृषि वस्तुओं का व्यापार करें। वास्तविक समय की कीमतें जांचें, खरीदार खोजें, और किसानों के लिए उचित सौदे सुनिश्चित करें।",
        category: "agriculture",
        icon: "storefront",
    },

    // ── Health ───────────────────────────────────────────────
    {
        id: "pmjay",
        name: "Ayushman Bharat (PM-JAY)",
        nameHi: "आयुष्मान भारत (पीएम-जय)",
        url: "https://pmjay.gov.in",
        description: "Check eligibility for ₹5 lakh free health insurance under PM-JAY. Find empanelled hospitals, get your Ayushman Bharat Health Card, and access cashless treatment.",
        descriptionHi: "पीएम-जय के तहत ₹5 लाख मुफ्त स्वास्थ्य बीमा की पात्रता जांचें। सूचीबद्ध अस्पताल खोजें, आयुष्मान भारत हेल्थ कार्ड प्राप्त करें, और कैशलेस उपचार प्राप्त करें।",
        category: "health",
        icon: "health_and_safety",
    },
    {
        id: "cowin",
        name: "CoWIN",
        nameHi: "कोविन",
        url: "https://www.cowin.gov.in",
        description: "COVID-19 vaccination portal — register, schedule vaccination appointments, and download vaccination certificates. Also serves as digital health records platform.",
        descriptionHi: "COVID-19 टीकाकरण पोर्टल — पंजीकरण करें, टीकाकरण अपॉइंटमेंट शेड्यूल करें, और टीकाकरण प्रमाणपत्र डाउनलोड करें। डिजिटल स्वास्थ्य रिकॉर्ड मंच के रूप में भी कार्य करता है।",
        category: "health",
        icon: "vaccines",
    },
    {
        id: "esanjeevani",
        name: "eSanjeevani",
        nameHi: "ई-संजीवनी",
        url: "https://esanjeevani.mohfw.gov.in",
        description: "Free telemedicine platform by the Ministry of Health — consult doctors online from home. Available for OPD consultations and doctor-to-doctor specialist referrals.",
        descriptionHi: "स्वास्थ्य मंत्रालय द्वारा मुफ्त टेलीमेडिसिन मंच — घर से ऑनलाइन डॉक्टरों से परामर्श करें। ओपीडी परामर्श और डॉक्टर-से-डॉक्टर विशेषज्ञ रेफरल के लिए उपलब्ध।",
        category: "health",
        icon: "medical_services",
    },

    // ── Finance & Tax ───────────────────────────────────────
    {
        id: "incometax",
        name: "Income Tax e-Filing",
        nameHi: "आयकर ई-फाइलिंग",
        url: "https://www.incometax.gov.in",
        description: "File income tax returns online, check refund status, generate Form 16, link PAN with Aadhaar, and access all income tax services digitally.",
        descriptionHi: "ऑनलाइन आयकर रिटर्न दाखिल करें, रिफंड स्थिति जांचें, फॉर्म 16 जनरेट करें, पैन को आधार से लिंक करें, और सभी आयकर सेवाओं तक डिजिटल रूप से पहुंचें।",
        category: "finance",
        icon: "receipt_long",
    },
    {
        id: "gst",
        name: "GST Portal",
        nameHi: "जीएसटी पोर्टल",
        url: "https://www.gst.gov.in",
        description: "Goods and Services Tax portal — register for GST, file returns (GSTR-1, GSTR-3B), pay tax, generate e-Way bills, and track compliance status.",
        descriptionHi: "वस्तु और सेवा कर पोर्टल — जीएसटी के लिए पंजीकरण करें, रिटर्न दाखिल करें, कर भुगतान करें, ई-वे बिल जनरेट करें, और अनुपालन स्थिति ट्रैक करें।",
        category: "finance",
        icon: "calculate",
    },
    {
        id: "epfo",
        name: "EPFO",
        nameHi: "ईपीएफओ",
        url: "https://www.epfindia.gov.in",
        description: "Employees' Provident Fund Organisation — check PF balance, download passbook, transfer PF, submit claims, and manage your retirement savings online.",
        descriptionHi: "कर्मचारी भविष्य निधि संगठन — पीएफ बैलेंस जांचें, पासबुक डाउनलोड करें, पीएफ ट्रांसफर करें, दावे जमा करें, और अपनी सेवानिवृत्ति बचत ऑनलाइन प्रबंधित करें।",
        category: "finance",
        icon: "savings",
    },

    // ── Education ───────────────────────────────────────────
    {
        id: "diksha",
        name: "DIKSHA",
        nameHi: "दीक्षा",
        url: "https://diksha.gov.in",
        description: "National platform for school education — access free textbooks, interactive courses, teacher training materials, and learning resources for Class 1-12 in multiple languages.",
        descriptionHi: "स्कूल शिक्षा के लिए राष्ट्रीय मंच — कई भाषाओं में कक्षा 1-12 के लिए मुफ्त पाठ्यपुस्तकें, इंटरैक्टिव पाठ्यक्रम, शिक्षक प्रशिक्षण सामग्री और शिक्षण संसाधन प्राप्त करें।",
        category: "education",
        icon: "menu_book",
    },
    {
        id: "ndl",
        name: "National Digital Library",
        nameHi: "राष्ट्रीय डिजिटल पुस्तकालय",
        url: "https://ndl.iitkgp.ac.in",
        description: "Free access to over 90 million digital resources — books, videos, audio, and thesis documents from IIT Kharagpur's initiative. Available in multiple Indian languages.",
        descriptionHi: "90 मिलियन से अधिक डिजिटल संसाधनों तक मुफ्त पहुंच — आईआईटी खड़गपुर की पहल से पुस्तकें, वीडियो, ऑडियो और शोध दस्तावेज़। कई भारतीय भाषाओं में उपलब्ध।",
        category: "education",
        icon: "local_library",
    },
    {
        id: "gem",
        name: "GeM (Govt e-Marketplace)",
        nameHi: "जेम (सरकारी ई-मार्केटप्लेस)",
        url: "https://gem.gov.in",
        description: "Government e-Marketplace — register as a seller to supply products and services directly to government departments. Transparent procurement with no middlemen.",
        descriptionHi: "सरकारी ई-मार्केटप्लेस — सरकारी विभागों को सीधे उत्पाद और सेवाएं आपूर्ति करने के लिए विक्रेता के रूप में पंजीकरण करें। बिना बिचौलियों के पारदर्शी खरीद।",
        category: "finance",
        icon: "shopping_cart",
    },
    {
        id: "udyam",
        name: "Udyam Registration",
        nameHi: "उद्यम पंजीकरण",
        url: "https://udyamregistration.gov.in",
        description: "Free online registration for Micro, Small, and Medium Enterprises (MSMEs). Get your Udyam certificate to access government subsidies, loans, and priority sector benefits.",
        descriptionHi: "सूक्ष्म, लघु और मध्यम उद्यमों (MSME) के लिए मुफ्त ऑनलाइन पंजीकरण। सरकारी सब्सिडी, ऋण और प्राथमिकता क्षेत्र लाभों तक पहुंचने के लिए अपना उद्यम प्रमाणपत्र प्राप्त करें।",
        category: "finance",
        icon: "business",
    },
];
