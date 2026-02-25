// ===== JanSathi AI — Input Validators =====

const ALLOWED_MODES = ["janseva", "janshiksha", "jankrishi", "janvyapar", "jankaushal"];

export function validateChatInput(body: { message?: string; mode?: string; language?: string }): string | null {
    if (!body.message || typeof body.message !== "string" || body.message.trim() === "") {
        return "Message is required";
    }
    if (body.message.length > 2000) {
        return "Message too long (max 2000 chars)";
    }
    if (body.mode && !ALLOWED_MODES.includes(body.mode)) {
        return `Invalid mode: ${body.mode}`;
    }
    if (body.language && !["hi", "en"].includes(body.language)) {
        return "Language must be 'hi' or 'en'";
    }
    return null;
}

export function validateAnalyticsInput(body: { type?: string; sessionId?: string }): string | null {
    if (!body.type || typeof body.type !== "string") return "type is required";
    if (!body.sessionId || typeof body.sessionId !== "string") return "sessionId is required";
    return null;
}
