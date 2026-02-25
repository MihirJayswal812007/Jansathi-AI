// ===== JanVyapar Module — Tool Definitions =====
// Business tools: product pricing, catalog generation.

import type { ToolDefinition } from "../../providers/types";

export const janvyaparTools: ToolDefinition[] = [
    {
        name: "suggest_product_pricing",
        description: "Suggest fair pricing for a rural product based on type, quantity, and market segment.",
        parameters: {
            product: { type: "string", description: "Product name (e.g., honey, pickle, handloom)", required: true },
            quantity: { type: "string", description: "Quantity/packaging (e.g., 500g, 1kg, per piece)" },
            quality: { type: "string", description: "Quality tier: basic, premium, organic" },
        },
        handler: async (args) => {
            // MVP: structured pricing guidance for the LLM
            return `Provide pricing guidance for ${args.product} (${args.quantity || "standard unit"}, ${args.quality || "standard"} quality). Consider: production cost, packaging, local market rates, online marketplace rates. Provide min/max/recommended prices in INR.`;
        },
    },
    {
        name: "generate_product_description",
        description: "Generate a professional product description for online/WhatsApp catalog listing.",
        parameters: {
            product: { type: "string", description: "Product name", required: true },
            features: { type: "string", description: "Key features or selling points" },
            origin: { type: "string", description: "Place of origin (adds authenticity)" },
        },
        handler: async (args) => {
            return `Create a compelling product description for "${args.product}" from ${args.origin || "rural India"}. Features: ${args.features || "natural, handmade"}. Format for WhatsApp catalog: title, description (2-3 lines), price placeholder, emoji decorations.`;
        },
    },
];
