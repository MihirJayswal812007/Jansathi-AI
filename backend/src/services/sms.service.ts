// ===== JanSathi AI — SMS Service (Fast2SMS) =====
// Sends OTP codes via Fast2SMS API (India-specific, free tier).
// Docs: https://www.fast2sms.com/docs/reseller

import logger from "../utils/logger";
import { SMS } from "../config/env";

interface SMSSendResult {
    sent: boolean;
    error?: string;
}

class SMSService {
    /**
     * Send an OTP code via Fast2SMS.
     * @param phone — E.164 format, e.g. "+919876543210"
     * @param code  — The plain-text OTP code to send
     */
    async sendOTP(phone: string, code: string): Promise<SMSSendResult> {
        if (!SMS.fast2smsApiKey) {
            logger.warn("sms.provider_not_configured", { reason: "FAST2SMS_API_KEY missing" });
            return { sent: false, error: "SMS provider not configured" };
        }

        // Strip leading + and country code for Fast2SMS (expects 10-digit Indian number)
        const digits = phone.replace(/\D/g, "");
        const mobile = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;

        if (mobile.length !== 10) {
            logger.warn("sms.invalid_number", { phone });
            return { sent: false, error: "Invalid Indian phone number for SMS delivery" };
        }

        try {
            const url = new URL("https://www.fast2sms.com/dev/bulkV2");
            url.searchParams.set("authorization", SMS.fast2smsApiKey);
            url.searchParams.set("route", "otp");
            url.searchParams.set("variables_values", code);
            url.searchParams.set("flash", "0");
            url.searchParams.set("numbers", mobile);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: { "cache-control": "no-cache" },
                signal: AbortSignal.timeout(10_000), // 10s timeout
            });

            const json = await response.json() as { return: boolean; message: string[] };

            if (json.return === true) {
                logger.info("sms.sent", { mobile: `***${mobile.slice(-4)}` });
                return { sent: true };
            }

            const errMsg = json.message?.join(", ") || "Unknown Fast2SMS error";
            logger.error("sms.send_failed", { error: errMsg });
            return { sent: false, error: errMsg };
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.error("sms.send_exception", { error: msg });
            return { sent: false, error: msg };
        }
    }
}

export const smsService = new SMSService();
