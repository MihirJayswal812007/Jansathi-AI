// ===== JanSathi AI — Abuse Detection Tests =====
// Unit tests for the lightweight abuse detection logger.

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    trackSessionCreation,
    trackOTPFailure,
    ABUSE_CONFIG,
    _resetCounters,
} from "../src/middleware/abuseDetector";
import logger from "../src/utils/logger";

// Spy on logger.warn to verify structured security events
const warnSpy = vi.spyOn(logger, "warn");

beforeEach(() => {
    _resetCounters();
    warnSpy.mockClear();
});

describe("Abuse Detection: session creation tracking", () => {
    it("should NOT log when below threshold", () => {
        for (let i = 0; i < ABUSE_CONFIG.sessionCreation.maxPerWindow; i++) {
            trackSessionCreation("192.168.1.1");
        }

        expect(warnSpy).not.toHaveBeenCalledWith(
            "security.abuse.excessive_sessions",
            expect.anything()
        );
    });

    it("should log security event when threshold exceeded", () => {
        const threshold = ABUSE_CONFIG.sessionCreation.maxPerWindow;

        for (let i = 0; i < threshold + 1; i++) {
            trackSessionCreation("192.168.1.1");
        }

        expect(warnSpy).toHaveBeenCalledWith(
            "security.abuse.excessive_sessions",
            expect.objectContaining({
                ip: "192.168.1.1",
                count: threshold + 1,
                threshold,
                severity: "medium",
                action: "logged",
            })
        );
    });

    it("should only alert once per window", () => {
        const threshold = ABUSE_CONFIG.sessionCreation.maxPerWindow;

        for (let i = 0; i < threshold + 5; i++) {
            trackSessionCreation("192.168.1.1");
        }

        // Should have been called exactly once
        const calls = warnSpy.mock.calls.filter(
            (c) => c[0] === "security.abuse.excessive_sessions"
        );
        expect(calls.length).toBe(1);
    });

    it("should track different IPs independently", () => {
        const threshold = ABUSE_CONFIG.sessionCreation.maxPerWindow;

        for (let i = 0; i < threshold + 1; i++) {
            trackSessionCreation("10.0.0.1");
        }

        // Different IP should not trigger
        for (let i = 0; i < 3; i++) {
            trackSessionCreation("10.0.0.2");
        }

        const calls = warnSpy.mock.calls.filter(
            (c) => c[0] === "security.abuse.excessive_sessions"
        );
        expect(calls.length).toBe(1);
        expect(calls[0][1]).toEqual(expect.objectContaining({ ip: "10.0.0.1" }));
    });
});

describe("Abuse Detection: OTP failure tracking", () => {
    it("should NOT log when below threshold", () => {
        for (let i = 0; i < ABUSE_CONFIG.otpFailures.maxPerWindow; i++) {
            trackOTPFailure("+919876543210");
        }

        expect(warnSpy).not.toHaveBeenCalledWith(
            "security.abuse.excessive_otp_failures",
            expect.anything()
        );
    });

    it("should log security event when OTP failure threshold exceeded", () => {
        const threshold = ABUSE_CONFIG.otpFailures.maxPerWindow;

        for (let i = 0; i < threshold + 1; i++) {
            trackOTPFailure("+919876543210");
        }

        expect(warnSpy).toHaveBeenCalledWith(
            "security.abuse.excessive_otp_failures",
            expect.objectContaining({
                count: threshold + 1,
                threshold,
                severity: "high",
                action: "logged",
            })
        );
    });

    it("should mask identifier in log output", () => {
        const threshold = ABUSE_CONFIG.otpFailures.maxPerWindow;

        for (let i = 0; i < threshold + 1; i++) {
            trackOTPFailure("+919876543210");
        }

        // Identifier should be masked
        const call = warnSpy.mock.calls.find(
            (c) => c[0] === "security.abuse.excessive_otp_failures"
        );
        expect(call).toBeDefined();
        expect(call![1]).toEqual(
            expect.objectContaining({
                identifier: expect.stringContaining("***"),
            })
        );
    });
});
