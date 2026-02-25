// ===== JanSathi AI — Structured Logger =====
// JSON-formatted, levelled logging for production observability.

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function emit(level: LogLevel, event: string, data?: Record<string, unknown>) {
    if (!shouldLog(level)) return;
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        event,
        ...data,
    };
    if (level === "error") {
        console.error(JSON.stringify(entry));
    } else if (level === "warn") {
        console.warn(JSON.stringify(entry));
    } else {
        console.log(JSON.stringify(entry));
    }
}

const logger = {
    debug: (event: string, data?: Record<string, unknown>) => emit("debug", event, data),
    info: (event: string, data?: Record<string, unknown>) => emit("info", event, data),
    warn: (event: string, data?: Record<string, unknown>) => emit("warn", event, data),
    error: (event: string, data?: Record<string, unknown>) => emit("error", event, data),
    generateRequestId: (): string => `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
};

export default logger;
