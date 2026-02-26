// ===== JanSathi AI — Centralised Configuration =====
// All environment variables validated at import time.
// No hardcoded values anywhere else in the codebase.

// ── Helpers ─────────────────────────────────────────────────
function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value || value.trim() === "") {
        throw new Error(
            `[CONFIG] Missing required environment variable: ${key}. ` +
            `Add it to your .env file and restart the server.`
        );
    }
    return value.trim();
}

function optionalEnv(key: string, fallback: string): string {
    const value = process.env[key];
    return value && value.trim() !== "" ? value.trim() : fallback;
}

function intEnv(key: string, fallback: number): number {
    const raw = process.env[key];
    if (!raw) return fallback;
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
        throw new Error(
            `[CONFIG] Environment variable ${key} must be a valid integer. Got: "${raw}"`
        );
    }
    return parsed;
}

// ── Exported Configuration ──────────────────────────────────

/** Database */
export const DB = {
    url: requireEnv("DATABASE_URL"),
    directUrl: requireEnv("DIRECT_URL"),
} as const;

/** Groq LLM */
export const LLM = {
    apiKey: optionalEnv("GROQ_API_KEY", ""),
    model: optionalEnv("LLM_MODEL", "llama-3.3-70b-versatile"),
    temperature: parseFloat(optionalEnv("LLM_TEMPERATURE", "0.7")),
    maxTokens: intEnv("LLM_MAX_TOKENS", 500),
    topP: parseFloat(optionalEnv("LLM_TOP_P", "0.9")),
    intentTemperature: parseFloat(optionalEnv("LLM_INTENT_TEMPERATURE", "0.1")),
    intentMaxTokens: intEnv("LLM_INTENT_MAX_TOKENS", 100),
    get isAvailable(): boolean {
        return this.apiKey !== "";
    },
} as const;

/** Rate Limiting */
export const RATE_LIMIT = {
    windowMs: intEnv("RATE_LIMIT_WINDOW_MS", 60_000),
    maxRequests: intEnv("RATE_LIMIT_MAX_REQUESTS", 30),
} as const;

/** Session / Auth */
export const AUTH = {
    sessionCookieName: optionalEnv("SESSION_COOKIE_NAME", "jansathi_sid"),
    sessionMaxAgeSeconds: intEnv("SESSION_MAX_AGE_SECONDS", 30 * 24 * 60 * 60), // 30 days
    tokenBytes: intEnv("SESSION_TOKEN_BYTES", 32), // 32 bytes = 256-bit entropy
} as const;

/** OTP Configuration */
export const OTP = {
    codeLength: intEnv("OTP_CODE_LENGTH", 6),
    expirySeconds: intEnv("OTP_EXPIRY_SECONDS", 300), // 5 minutes
    maxAttempts: intEnv("OTP_MAX_ATTEMPTS", 5),
    rateLimitPerIdentifier: intEnv("OTP_RATE_LIMIT", 3), // max OTPs per window
    rateLimitWindowSeconds: intEnv("OTP_RATE_LIMIT_WINDOW", 600), // 10 minutes
} as const;

/** SMS — Fast2SMS (India) */
export const SMS = {
    fast2smsApiKey: optionalEnv("FAST2SMS_API_KEY", ""),
    get isConfigured(): boolean {
        return this.fast2smsApiKey !== "";
    },
} as const;

/** Email — SMTP (nodemailer) */
export const EMAIL = {
    smtpHost: optionalEnv("SMTP_HOST", ""),
    smtpPort: intEnv("SMTP_PORT", 587),
    smtpUser: optionalEnv("SMTP_USER", ""),
    smtpPass: optionalEnv("SMTP_PASS", ""),
    smtpFrom: optionalEnv("SMTP_FROM", "JanSathi AI <noreply@jansathi.ai>"),
    get isConfigured(): boolean {
        return this.smtpHost !== "" && this.smtpUser !== "" && this.smtpPass !== "";
    },
} as const;

/** Application */
export const APP = {
    name: optionalEnv("APP_NAME", "JanSathi AI"),
    env: optionalEnv("NODE_ENV", "development"),
    logLevel: optionalEnv("LOG_LEVEL", "info") as "debug" | "info" | "warn" | "error",
    allowedOrigins: optionalEnv("ALLOWED_ORIGINS", "*").split(",").map((o) => o.trim()),
    get isDev(): boolean {
        return this.env === "development";
    },
    get isProd(): boolean {
        return this.env === "production";
    },
} as const;

/** Validation Constraints */
export const VALIDATION = {
    maxMessageLength: intEnv("MAX_MESSAGE_LENGTH", 2000),
    maxConversationHistory: intEnv("MAX_CONVERSATION_HISTORY", 6),
    allowedModes: ["janseva", "janshiksha", "jankrishi", "janvyapar", "jankaushal"] as const,
    allowedLanguages: ["hi", "en"] as const,
    allowedEventTypes: [
        "page_view",
        "mode_select",
        "voice_start",
        "voice_end",
        "quick_action_click",
        "message_sent",
        "feedback_given",
    ] as const,
} as const;

/** Derived types */
export type ModeName = (typeof VALIDATION.allowedModes)[number];
export type Language = (typeof VALIDATION.allowedLanguages)[number];
export type EventType = (typeof VALIDATION.allowedEventTypes)[number];
