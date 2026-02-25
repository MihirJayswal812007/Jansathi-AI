// ===== JanSathi AI — Structured Logger =====
// JSON-structured logging with levels, correlation IDs, and context.
// Replaces all raw console.log/console.error calls.

import { APP } from "@/lib/config";
import { randomUUID } from "crypto";

// ── Types ───────────────────────────────────────────────────
type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    event: string;
    requestId?: string;
    userId?: string;
    sessionId?: string;
    durationMs?: number;
    [key: string]: unknown;
}

// ── Level Hierarchy ─────────────────────────────────────────
const LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

function shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[APP.logLevel];
}

// ── Core Emit ───────────────────────────────────────────────
function emit(level: LogLevel, event: string, meta: Record<string, unknown> = {}): void {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        event,
        ...meta,
    };

    // In development, pretty-print for readability
    if (APP.isDev) {
        const icon = { debug: "🔍", info: "ℹ️", warn: "⚠️", error: "❌" }[level];
        const color = { debug: "\x1b[36m", info: "\x1b[32m", warn: "\x1b[33m", error: "\x1b[31m" }[level];
        const reset = "\x1b[0m";
        const { timestamp, level: _l, event: _e, ...rest } = entry;
        const metaStr = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";
        console[level === "error" ? "error" : "log"](
            `${color}${icon} [${timestamp}] ${event}${metaStr}${reset}`
        );
        return;
    }

    // In production, emit structured JSON
    const output = JSON.stringify(entry);
    if (level === "error") {
        console.error(output);
    } else {
        console.log(output);
    }
}

// ── Public API ──────────────────────────────────────────────
export const logger = {
    debug: (event: string, meta?: Record<string, unknown>) => emit("debug", event, meta),
    info: (event: string, meta?: Record<string, unknown>) => emit("info", event, meta),
    warn: (event: string, meta?: Record<string, unknown>) => emit("warn", event, meta),
    error: (event: string, meta?: Record<string, unknown>) => emit("error", event, meta),

    /** Create a child logger with pre-bound context (requestId, userId, etc.) */
    child: (context: Record<string, unknown>) => ({
        debug: (event: string, meta?: Record<string, unknown>) =>
            emit("debug", event, { ...context, ...meta }),
        info: (event: string, meta?: Record<string, unknown>) =>
            emit("info", event, { ...context, ...meta }),
        warn: (event: string, meta?: Record<string, unknown>) =>
            emit("warn", event, { ...context, ...meta }),
        error: (event: string, meta?: Record<string, unknown>) =>
            emit("error", event, { ...context, ...meta }),
    }),

    /** Generate a unique request correlation ID */
    generateRequestId: (): string => randomUUID(),
} as const;

export default logger;
