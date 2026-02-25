// ===== JanSathi AI — Error Handler =====

import { Response } from "express";

export type ErrorCode = "INVALID_INPUT" | "RATE_LIMITED" | "UNAUTHORIZED" | "FORBIDDEN" | "INTERNAL_ERROR" | "DB_ERROR";

const ERROR_STATUS: Record<ErrorCode, number> = {
    INVALID_INPUT: 400,
    RATE_LIMITED: 429,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    INTERNAL_ERROR: 500,
    DB_ERROR: 500,
};

export function sendError(
    res: Response,
    code: ErrorCode,
    message?: string,
    requestId?: string
) {
    const status = ERROR_STATUS[code] || 500;
    res.status(status).json({
        error: code,
        message: message || "An error occurred",
        requestId,
    });
}
