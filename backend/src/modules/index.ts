// ===== JanSathi AI — Module Registry =====
// Maps ModeName → context builder + tool definitions.
// Tools are registered with the ToolRouter on startup.

import { type ModeName } from "../config/env";
import { buildJansevaContext } from "./janseva/context";
import { buildJankrishiContext } from "./jankrishi/context";
import { buildJanshikshaContext } from "./janshiksha/context";
import { buildJanvyaparContext } from "./janvyapar/context";
import { buildJankaushalContext } from "./jankaushal/context";
import { jansevaTools } from "./janseva/tools";
import { jankrishiTools } from "./jankrishi/tools";
import { janshikshaTools } from "./janshiksha/tools";
import { janvyaparTools } from "./janvyapar/tools";
import { jankaushalTools } from "./jankaushal/tools";
import { toolRouter } from "../orchestration/ToolRouter";
import type { ToolDefinition } from "../providers/types";
import logger from "../utils/logger";

type ContextBuilder = (message: string) => string | Promise<string>;

interface ModuleDefinition {
    contextBuilder: ContextBuilder;
    tools: ToolDefinition[];
}

const MODULE_REGISTRY: Record<ModeName, ModuleDefinition> = {
    janseva: { contextBuilder: buildJansevaContext, tools: jansevaTools },
    jankrishi: { contextBuilder: buildJankrishiContext, tools: jankrishiTools },
    janshiksha: { contextBuilder: buildJanshikshaContext, tools: janshikshaTools },
    janvyapar: { contextBuilder: buildJanvyaparContext, tools: janvyaparTools },
    jankaushal: { contextBuilder: buildJankaushalContext, tools: jankaushalTools },
};

/**
 * Build context for a given module.
 * Returns a string to inject into the system prompt's {context} placeholder.
 */
export async function buildContext(mode: ModeName, message: string): Promise<string> {
    const module = MODULE_REGISTRY[mode];
    if (!module) return "";
    return module.contextBuilder(message);
}

/**
 * Get tool definitions for a given module.
 */
export function getModuleTools(mode: ModeName): ToolDefinition[] {
    return MODULE_REGISTRY[mode]?.tools ?? [];
}

/**
 * Register all module tools with the ToolRouter.
 * Called once at startup.
 */
export function registerAllModuleTools(): void {
    let totalTools = 0;
    for (const [mode, module] of Object.entries(MODULE_REGISTRY)) {
        if (module.tools.length > 0) {
            toolRouter.registerTools(module.tools);
            totalTools += module.tools.length;
        }
    }
    logger.info("module_registry.tools_registered", { totalTools });
}
