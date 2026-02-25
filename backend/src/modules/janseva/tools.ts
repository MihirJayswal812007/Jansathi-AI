// ===== JanSeva Module — Tool Definitions =====
// Declares tools the LLM can invoke for government scheme operations.

import type { ToolDefinition } from "../../providers/types";
import { SCHEMES_DATA } from "../../knowledge-bases/schemes";

export const jansevaTools: ToolDefinition[] = [
    {
        name: "check_scheme_eligibility",
        description: "Check if a user is eligible for a specific government scheme based on income, category, age, and state.",
        parameters: {
            scheme_name: { type: "string", description: "Name of the government scheme", required: true },
            income: { type: "number", description: "Annual household income in INR" },
            category: { type: "string", description: "Social category: General, SC, ST, OBC, Minority" },
            age: { type: "number", description: "Age of the applicant" },
            state: { type: "string", description: "State of residence" },
        },
        handler: async (args) => {
            const schemeName = String(args.scheme_name || "").toLowerCase();
            const scheme = SCHEMES_DATA.find(
                (s) => s.name.toLowerCase().includes(schemeName) || s.nameHi.includes(schemeName)
            );
            if (!scheme) return `Scheme "${args.scheme_name}" not found in database.`;

            const eligibility = scheme.eligibility;
            const checks: string[] = [];

            if (args.income && eligibility.incomeMax && Number(args.income) > eligibility.incomeMax) {
                checks.push(`❌ Income ₹${args.income} exceeds limit ₹${eligibility.incomeMax}`);
            } else if (args.income) {
                checks.push(`✅ Income ₹${args.income} within limit`);
            }

            return `Eligibility for ${scheme.name}:\n${checks.join("\n")}\n\nDocuments: ${scheme.documents.join(", ")}\nProcess: ${scheme.applicationProcess.join(" → ")}`;
        },
    },
    {
        name: "list_schemes_by_category",
        description: "List available government schemes filtered by category (housing, agriculture, education, health, employment, financial).",
        parameters: {
            category: { type: "string", description: "Scheme category to filter by", required: true },
        },
        handler: async (args) => {
            const category = String(args.category || "").toLowerCase();
            const matching = SCHEMES_DATA.filter((s) => s.category.toLowerCase().includes(category));
            if (matching.length === 0) return `No schemes found for category "${args.category}".`;
            return matching.map((s) => `• ${s.name} (${s.nameHi}) — ${s.benefits}`).join("\n");
        },
    },
];
