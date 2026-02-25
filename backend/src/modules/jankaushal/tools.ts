// ===== JanKaushal Module — Tool Definitions =====
// Career tools: resume building, job matching, skill gap analysis.

import type { ToolDefinition } from "../../providers/types";

export const jankaushalTools: ToolDefinition[] = [
    {
        name: "build_resume_section",
        description: "Structure user-provided information into a professional resume section.",
        parameters: {
            name: { type: "string", description: "Full name of the applicant", required: true },
            phone: { type: "string", description: "Contact phone number" },
            education: { type: "string", description: "Education details" },
            skills: { type: "string", description: "Comma-separated skills" },
            experience: { type: "string", description: "Work experience details" },
        },
        handler: async (args) => {
            const sections = [
                `📄 RESUME — ${args.name}`,
                args.phone ? `📞 ${args.phone}` : null,
                args.education ? `🎓 Education: ${args.education}` : null,
                args.skills ? `💪 Skills: ${args.skills}` : null,
                args.experience ? `💼 Experience: ${args.experience}` : null,
            ].filter(Boolean);

            return `Structured resume data:\n${sections.join("\n")}\n\nFormat this into a clean, professional resume. Keep it concise and suitable for blue-collar/entry-level jobs.`;
        },
    },
    {
        name: "find_training_programs",
        description: "Find relevant government training programs (Skill India, ITI, PMKVY) based on skills and location.",
        parameters: {
            skill_area: { type: "string", description: "Skill area of interest (e.g., driving, electrician, tailoring)", required: true },
            state: { type: "string", description: "State for location-based suggestions" },
        },
        handler: async (args) => {
            return `Find training programs for "${args.skill_area}" in ${args.state || "India"}. Include: Skill India programs, ITI courses, PMKVY schemes, approximate duration, and whether certificate is provided. Focus on free or subsidized government programs.`;
        },
    },
];
