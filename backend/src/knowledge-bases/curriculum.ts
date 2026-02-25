// ===== JanSathi AI — Curriculum Knowledge Base (JanShiksha) =====
// NCERT-aligned syllabus data for Classes 1-12.
// Used by the JanShiksha module to provide contextual education support.

export interface Subject {
    name: string;
    nameHi: string;
    topics: { topic: string; topicHi: string; class: number }[];
}

export const SUBJECTS: Subject[] = [
    {
        name: "Science",
        nameHi: "विज्ञान",
        topics: [
            { topic: "Living and Non-Living Things", topicHi: "सजीव और निर्जीव", class: 1 },
            { topic: "Plants Around Us", topicHi: "हमारे आस-पास के पौधे", class: 2 },
            { topic: "Food We Eat", topicHi: "हमारा भोजन", class: 3 },
            { topic: "Teeth and Digestion", topicHi: "दाँत और पाचन", class: 4 },
            { topic: "Human Body – Skeletal System", topicHi: "मानव शरीर – कंकाल तंत्र", class: 5 },
            { topic: "Separation of Substances", topicHi: "पदार्थों का पृथक्करण", class: 6 },
            { topic: "Heat and Temperature", topicHi: "ऊष्मा और तापमान", class: 7 },
            { topic: "Cell – Structure and Functions", topicHi: "कोशिका – संरचना और कार्य", class: 8 },
            { topic: "Atoms and Molecules", topicHi: "परमाणु और अणु", class: 9 },
            { topic: "Chemical Reactions", topicHi: "रासायनिक अभिक्रियाएँ", class: 10 },
            { topic: "Photosynthesis in Plants", topicHi: "पौधों में प्रकाश संश्लेषण", class: 11 },
            { topic: "Genetics and Evolution", topicHi: "आनुवंशिकी और विकास", class: 12 },
        ],
    },
    {
        name: "Mathematics",
        nameHi: "गणित",
        topics: [
            { topic: "Counting 1-100", topicHi: "1-100 तक गिनती", class: 1 },
            { topic: "Addition and Subtraction", topicHi: "जोड़ और घटाव", class: 2 },
            { topic: "Multiplication Tables", topicHi: "पहाड़े", class: 3 },
            { topic: "Fractions", topicHi: "भिन्न (Fractions)", class: 4 },
            { topic: "Decimals and Percentages", topicHi: "दशमलव और प्रतिशत", class: 5 },
            { topic: "Ratio and Proportion", topicHi: "अनुपात और समानुपात", class: 6 },
            { topic: "Algebra – Simple Equations", topicHi: "बीजगणित – सरल समीकरण", class: 7 },
            { topic: "Linear Equations in Two Variables", topicHi: "दो चरों वाले रैखिक समीकरण", class: 8 },
            { topic: "Polynomials", topicHi: "बहुपद", class: 9 },
            { topic: "Trigonometry", topicHi: "त्रिकोणमिति", class: 10 },
            { topic: "Limits and Derivatives", topicHi: "सीमा और अवकलज", class: 11 },
            { topic: "Integrals", topicHi: "समाकलन", class: 12 },
        ],
    },
    {
        name: "Social Science",
        nameHi: "सामाजिक विज्ञान",
        topics: [
            { topic: "My Family", topicHi: "मेरा परिवार", class: 1 },
            { topic: "Our Neighbourhood", topicHi: "हमारा पड़ोस", class: 2 },
            { topic: "Maps and Directions", topicHi: "नक्शे और दिशाएँ", class: 3 },
            { topic: "Indian States and Capitals", topicHi: "भारत के राज्य और राजधानियाँ", class: 4 },
            { topic: "Indian Freedom Struggle", topicHi: "भारतीय स्वतंत्रता संग्राम", class: 5 },
            { topic: "Indian Constitution", topicHi: "भारतीय संविधान", class: 6 },
            { topic: "Medieval India", topicHi: "मध्यकालीन भारत", class: 7 },
            { topic: "The French Revolution", topicHi: "फ्रांसीसी क्रांति", class: 8 },
            { topic: "Democracy and Elections", topicHi: "लोकतंत्र और चुनाव", class: 9 },
            { topic: "Globalisation", topicHi: "वैश्वीकरण", class: 10 },
        ],
    },
    {
        name: "Hindi",
        nameHi: "हिंदी",
        topics: [
            { topic: "Varnamala (Alphabets)", topicHi: "वर्णमाला", class: 1 },
            { topic: "Matras", topicHi: "मात्राएँ", class: 2 },
            { topic: "Simple Sentences", topicHi: "सरल वाक्य", class: 3 },
            { topic: "Gender – Ling", topicHi: "लिंग", class: 4 },
            { topic: "Synonyms and Antonyms", topicHi: "पर्यायवाची और विलोम शब्द", class: 5 },
            { topic: "Letter Writing", topicHi: "पत्र लेखन", class: 6 },
            { topic: "Essay Writing", topicHi: "निबंध लेखन", class: 7 },
        ],
    },
];

/**
 * Returns topics for a given class number.
 */
export function getTopicsForClass(classNumber: number): { subject: string; subjectHi: string; topic: string; topicHi: string }[] {
    const results: { subject: string; subjectHi: string; topic: string; topicHi: string }[] = [];
    for (const subject of SUBJECTS) {
        for (const t of subject.topics) {
            if (t.class === classNumber) {
                results.push({
                    subject: subject.name,
                    subjectHi: subject.nameHi,
                    topic: t.topic,
                    topicHi: t.topicHi,
                });
            }
        }
    }
    return results;
}
