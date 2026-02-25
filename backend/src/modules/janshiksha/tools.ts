// ===== JanShiksha Module — Tool Definitions =====
// Education tools: quiz generation, concept simplification.

import type { ToolDefinition } from "../../providers/types";

export const janshikshaTools: ToolDefinition[] = [
    {
        name: "generate_quiz",
        description: "Generate practice questions for a specific subject and class level.",
        parameters: {
            subject: { type: "string", description: "Subject (math, science, hindi, english, social studies)", required: true },
            class_level: { type: "number", description: "Class/grade level (1-12)", required: true },
            num_questions: { type: "number", description: "Number of questions to generate (default 3)" },
        },
        handler: async (args) => {
            // For MVP, return structured prompt guidance — actual quiz generation
            // is handled by the LLM with this structured input
            return `Generate ${args.num_questions || 3} practice questions for Class ${args.class_level} ${args.subject}. Use NCERT curriculum. Include answers. Use simple Hindi/English.`;
        },
    },
];
