// ===== JanSathi AI — OTP Authentication Service =====
// Handles OTP generation, hashed storage, verification, rate limiting,
// and replay protection. No OTP stored/logged in plain text.

import { createHash, randomInt } from "crypto";
import prisma from "../models/prisma";
import { OTP } from "../config/env";
import logger from "../utils/logger";
import { smsService } from "./sms.service";
import { emailService } from "./email.service";

// ── Types ───────────────────────────────────────────────────
export interface OTPRequestResult {
    success: boolean;
    message: string;
    /** Seconds until OTP expires — for frontend countdown */
    expiresInSeconds?: number;
}

export interface OTPVerifyResult {
    success: boolean;
    message: string;
    userId?: string;
    sessionToken?: string;
}

// ── Helpers (PRIVATE — never export) ────────────────────────
function generateOTPCode(): string {
    const max = Math.pow(10, OTP.codeLength);
    const min = Math.pow(10, OTP.codeLength - 1);
    return String(randomInt(min, max));
}

function hashOTP(code: string): string {
    return createHash("sha256").update(code).digest("hex");
}

// ── OTP Service ─────────────────────────────────────────────
class OTPService {
    /**
     * Request a new OTP for a phone or email.
     * Enforces rate limiting per identifier.
     */
    async requestOTP(identifier: string): Promise<OTPRequestResult> {
        const normalized = this.normalizeIdentifier(identifier);

        if (!normalized) {
            return { success: false, message: "Invalid phone number or email" };
        }

        // Rate limit: max N OTPs per window per identifier
        const windowStart = new Date(Date.now() - OTP.rateLimitWindowSeconds * 1000);
        const recentCount = await prisma.otpVerification.count({
            where: {
                identifier: normalized,
                createdAt: { gte: windowStart },
            },
        });

        if (recentCount >= OTP.rateLimitPerIdentifier) {
            logger.warn("otp.rate_limited", { identifier: this.maskIdentifier(normalized) });
            return {
                success: false,
                message: "Too many OTP requests. Please wait before trying again.",
            };
        }

        // Invalidate any existing unused OTPs for this identifier
        await prisma.otpVerification.updateMany({
            where: {
                identifier: normalized,
                verified: false,
                expiresAt: { gt: new Date() },
            },
            data: { expiresAt: new Date() }, // expire immediately
        });

        // Generate and store hashed OTP
        const code = generateOTPCode();
        const otpHash = hashOTP(code);
        const expiresAt = new Date(Date.now() + OTP.expirySeconds * 1000);

        await prisma.otpVerification.create({
            data: {
                identifier: normalized,
                otpHash,
                expiresAt,
            },
        });

        // Log action WITHOUT the OTP code
        logger.info("otp.requested", {
            identifier: this.maskIdentifier(normalized),
            expiresAt: expiresAt.toISOString(),
        });

        // ── Deliver OTP via SMS or Email ─────────────────────
        const isEmail = normalized.includes("@");
        const delivery = isEmail
            ? await emailService.sendOTP(normalized, code)
            : await smsService.sendOTP(normalized, code);

        if (!delivery.sent) {
            logger.error("otp.delivery_failed", {
                identifier: this.maskIdentifier(normalized),
                channel: isEmail ? "email" : "sms",
                error: delivery.error,
            });
            return {
                success: false,
                message: delivery.error || "Failed to send OTP. Please try again.",
            };
        }

        return {
            success: true,
            message: isEmail
                ? "OTP sent to your email address"
                : "OTP sent to your mobile number",
            expiresInSeconds: OTP.expirySeconds,
        };
    }

    /**
     * Verify an OTP code for a given identifier.
     * Handles: expiry, max attempts, replay protection.
     */
    async verifyOTP(identifier: string, code: string): Promise<OTPVerifyResult> {
        const normalized = this.normalizeIdentifier(identifier);
        if (!normalized) {
            return { success: false, message: "Invalid identifier" };
        }

        // Find the latest unexpired, unverified OTP for this identifier
        const otpRecord = await prisma.otpVerification.findFirst({
            where: {
                identifier: normalized,
                verified: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
        });

        if (!otpRecord) {
            return { success: false, message: "No valid OTP found. Please request a new one." };
        }

        // Max attempts check (brute-force protection)
        if (otpRecord.attempts >= OTP.maxAttempts) {
            // Expire this OTP — force re-request
            await prisma.otpVerification.update({
                where: { id: otpRecord.id },
                data: { expiresAt: new Date() },
            });
            logger.warn("otp.max_attempts_exceeded", {
                identifier: this.maskIdentifier(normalized),
                attempts: otpRecord.attempts,
            });
            return { success: false, message: "Too many incorrect attempts. Please request a new OTP." };
        }

        // Increment attempt counter
        await prisma.otpVerification.update({
            where: { id: otpRecord.id },
            data: { attempts: { increment: 1 } },
        });

        // Compare hashes (constant-time not critical for OTP but hash makes raw comparison safe)
        const inputHash = hashOTP(code);
        if (inputHash !== otpRecord.otpHash) {
            logger.warn("otp.incorrect", {
                identifier: this.maskIdentifier(normalized),
                attempt: otpRecord.attempts + 1,
            });
            return { success: false, message: "Incorrect OTP" };
        }

        // Mark as verified (replay protection — cannot reuse)
        await prisma.otpVerification.update({
            where: { id: otpRecord.id },
            data: { verified: true },
        });

        // Link to user: find or create
        const user = await this.findOrCreateUser(normalized);

        logger.info("otp.verified", {
            identifier: this.maskIdentifier(normalized),
            userId: user.id,
        });

        return {
            success: true,
            message: "OTP verified successfully",
            userId: user.id,
        };
    }

    /**
     * Find existing user by phone/email, or create a new one.
     */
    private async findOrCreateUser(identifier: string): Promise<{ id: string; role: string }> {
        const isEmail = identifier.includes("@");
        const where = isEmail ? { email: identifier } : { phone: identifier };

        let user = await prisma.user.findUnique({ where, select: { id: true, role: true } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    ...(isEmail ? { email: identifier } : { phone: identifier }),
                    role: "user",
                },
                select: { id: true, role: true },
            });
            logger.info("otp.user_created", { userId: user.id });
        }

        return user;
    }

    /**
     * Link a verified user to an existing session.
     */
    async linkUserToSession(userId: string, sessionId: string): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        await prisma.session.update({
            where: { id: sessionId },
            data: {
                userId,
                role: user?.role || "user",
            },
        });

        logger.info("otp.session_linked", { userId, sessionId });
    }

    // ── Private Helpers ─────────────────────────────────────
    private normalizeIdentifier(identifier: string): string | null {
        const trimmed = identifier.trim();

        // Email check
        if (trimmed.includes("@")) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(trimmed) ? trimmed.toLowerCase() : null;
        }

        // Phone check: strip non-digits, require 10+ digits
        const digits = trimmed.replace(/\D/g, "");
        if (digits.length >= 10) {
            // Normalize Indian numbers: add +91 prefix if 10 digits
            return digits.length === 10 ? `+91${digits}` : `+${digits}`;
        }

        return null;
    }

    private maskIdentifier(identifier: string): string {
        if (identifier.includes("@")) {
            const [local, domain] = identifier.split("@");
            return `${local.slice(0, 2)}***@${domain}`;
        }
        return `***${identifier.slice(-4)}`;
    }
}

// ── Singleton ───────────────────────────────────────────────
export const otpService = new OTPService();
