// ===== JanSathi AI — Email OTP Service (Nodemailer) =====
// Sends OTP codes via SMTP. Configured via SMTP_* env vars.
// Works with Gmail App Passwords, Outlook, or any SMTP host.

import nodemailer, { Transporter } from "nodemailer";
import logger from "../utils/logger";
import { EMAIL } from "../config/env";

interface EmailSendResult {
    sent: boolean;
    error?: string;
}

class EmailService {
    private transporter: Transporter | null = null;

    private getTransporter(): Transporter | null {
        if (!EMAIL.smtpHost || !EMAIL.smtpUser || !EMAIL.smtpPass) {
            return null;
        }
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host: EMAIL.smtpHost,
                port: EMAIL.smtpPort,
                secure: EMAIL.smtpPort === 465,
                auth: {
                    user: EMAIL.smtpUser,
                    pass: EMAIL.smtpPass,
                },
            });
        }
        return this.transporter;
    }

    /**
     * Send an OTP to an email address.
     */
    async sendOTP(email: string, code: string): Promise<EmailSendResult> {
        const transporter = this.getTransporter();
        if (!transporter) {
            logger.warn("email.provider_not_configured", { reason: "SMTP_* env vars missing" });
            return { sent: false, error: "Email provider not configured" };
        }

        try {
            await transporter.sendMail({
                from: EMAIL.smtpFrom,
                to: email,
                subject: "Your JanSathi AI Login Code",
                text: `Your one-time login code is: ${code}\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
                        <h2 style="color:#2563EB;margin-bottom:8px">JanSathi AI</h2>
                        <p style="color:#374151;margin-bottom:24px">Your one-time login code:</p>
                        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;
                                    background:#F3F4F6;border-radius:8px;padding:16px 24px;
                                    text-align:center;margin-bottom:24px">
                            ${code}
                        </div>
                        <p style="color:#6B7280;font-size:14px">
                            This code expires in <strong>5 minutes</strong>. 
                            Do not share it with anyone.
                        </p>
                    </div>`,
            });

            const maskedEmail = `${email.slice(0, 2)}***@${email.split("@")[1]}`;
            logger.info("email.otp_sent", { email: maskedEmail });
            return { sent: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.error("email.send_exception", { error: msg });
            return { sent: false, error: msg };
        }
    }
}

export const emailService = new EmailService();
