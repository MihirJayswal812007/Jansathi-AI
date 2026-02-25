// ===== JanSathi AI — Module Registry =====
// Maps ModeName → context builder. Replaces the switch/case in chat.ts.

import { type ModeName } from "../config/env";
import { buildJansevaContext } from "./janseva/context";
import { buildJankrishiContext } from "./jankrishi/context";
import { buildJanshikshaContext } from "./janshiksha/context";
import { buildJanvyaparContext } from "./janvyapar/context";
import { buildJankaushalContext } from "./jankaushal/context";

type ContextBuilder = (message: string) => string | Promise<string>;

const MODULE_REGISTRY: Record<ModeName, ContextBuilder> = {
    janseva: buildJansevaContext,
    jankrishi: buildJankrishiContext,
    janshiksha: buildJanshikshaContext,
    janvyapar: buildJanvyaparContext,
    jankaushal: buildJankaushalContext,
};

/**
 * Build context for a given module.
 * Returns a string to inject into the system prompt's {context} placeholder.
 */
export async function buildContext(mode: ModeName, message: string): Promise<string> {
    const builder = MODULE_REGISTRY[mode];
    if (!builder) return "";
    return builder(message);
}
