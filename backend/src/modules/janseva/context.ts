// ===== JanSeva Module — Government Schemes Context Builder =====

import { SCHEMES_DATA } from "../../knowledge-bases/schemes";

export function buildJansevaContext(message: string): string {
    const lowerMsg = message.toLowerCase();

    const relevantSchemes = SCHEMES_DATA.filter((scheme) => {
        return (
            lowerMsg.includes(scheme.name.toLowerCase()) ||
            lowerMsg.includes(scheme.category.toLowerCase()) ||
            scheme.name.toLowerCase().includes(lowerMsg.split(" ").slice(0, 3).join(" "))
        );
    });

    if (relevantSchemes.length > 0) {
        return relevantSchemes
            .map(
                (s) =>
                    `Scheme: ${s.name} (${s.nameHi})\nCategory: ${s.category}\nDescription: ${s.descriptionHi}\nEligibility: ${JSON.stringify(s.eligibility)}\nBenefits: ${s.benefits}\nDocuments: ${s.documents.join(", ")}\nProcess: ${s.applicationProcess.join(" → ")}\nWebsite: ${s.website}`
            )
            .join("\n\n");
    }

    // Fallback: list all schemes briefly
    return SCHEMES_DATA.map(
        (s) => `• ${s.name} (${s.nameHi}) — ${s.category}: ${s.benefits}`
    ).join("\n");
}
