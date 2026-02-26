// ===== JanSathi AI — OTP Login Page =====
// Two-step authentication: phone/email → OTP verification

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, ArrowRight, ArrowLeft, Shield, Loader2 } from "lucide-react";
import { requestOTP, verifyOTP } from "@/lib/apiClient";
import { useUserStore } from "@/store/userStore";

type Step = "identifier" | "otp";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/";
    const { setSession } = useUserStore();

    const [step, setStep] = useState<Step>("identifier");
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [expiresIn, setExpiresIn] = useState(0);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Countdown timer
    useEffect(() => {
        if (expiresIn > 0) {
            timerRef.current = setInterval(() => {
                setExpiresIn((prev) => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [expiresIn]);

    // ── Step 1: Request OTP ─────────────────────────────────
    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim() || identifier.trim().length < 5) {
            setError("Enter a valid phone number or email");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await requestOTP(identifier.trim());
            if (result.success) {
                setStep("otp");
                setExpiresIn(result.expiresInSeconds || 300);
                if (result.devOtp) setDevOtp(result.devOtp);
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                setError(result.message || "Failed to send OTP");
            }
        } catch {
            setError("Network error — is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Verify OTP ──────────────────────────────────
    const handleVerifyOTP = async (codeOverride?: string) => {
        const code = codeOverride ?? otp.join("");
        if (code.length < 6) {
            setError("Enter the complete 6-digit OTP");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await verifyOTP(identifier.trim(), code);
            if (result.success && result.session) {
                setSession(result.session.id, result.session.role === "admin");
                router.push(redirectTo);
            } else {
                setError(result.message || "Invalid OTP");
                setOtp(["", "", "", "", "", ""]);
                otpRefs.current[0]?.focus();
            }
        } catch {
            setError("Verification failed — try again");
        } finally {
            setLoading(false);
        }
    };

    // ── OTP Input Handler ───────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-advance
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-submit on last digit — pass code directly to avoid stale closure
        if (value && index === 5) {
            const code = newOtp.join("");
            if (code.length === 6) {
                setTimeout(() => handleVerifyOTP(code), 100);
            }
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const isPhone = /^\+?\d/.test(identifier);

    return (
        <div
            className="min-h-dvh flex items-center justify-center px-4"
            style={{ background: "var(--bg-primary)" }}
        >
            <motion.div
                className="w-full max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                        style={{
                            background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                        }}
                    >
                        <Shield size={28} color="white" />
                    </div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
                    >
                        JanSathi AI
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        सुरक्षित लॉगिन · Secure Login
                    </p>
                </div>

                {/* Card */}
                <div
                    className="p-6 rounded-2xl"
                    style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-primary)",
                    }}
                >
                    <AnimatePresence mode="wait">
                        {step === "identifier" ? (
                            <motion.form
                                key="identifier"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleRequestOTP}
                            >
                                <h2
                                    className="text-lg font-semibold mb-1"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    Enter Phone or Email
                                </h2>
                                <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                                    फ़ोन नंबर या ईमेल दर्ज करें
                                </p>

                                <div className="relative mb-4">
                                    <div
                                        className="absolute left-3 top-1/2 -translate-y-1/2"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {isPhone ? <Phone size={16} /> : <Mail size={16} />}
                                    </div>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => {
                                            setIdentifier(e.target.value);
                                            setError(null);
                                        }}
                                        placeholder="+91 98765 43210 or name@email.com"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                                        style={{
                                            background: "var(--bg-elevated)",
                                            color: "var(--text-primary)",
                                            border: "1px solid var(--border-primary)",
                                        }}
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs mb-3" style={{ color: "#EF4444" }}>
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !identifier.trim()}
                                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
                                    style={{
                                        background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                                        color: "white",
                                        opacity: loading || !identifier.trim() ? 0.5 : 1,
                                    }}
                                >
                                    {loading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            Send OTP <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <button
                                    onClick={() => {
                                        setStep("identifier");
                                        setOtp(["", "", "", "", "", ""]);
                                        setError(null);
                                        setDevOtp(null);
                                    }}
                                    className="flex items-center gap-1 text-xs mb-3"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    <ArrowLeft size={14} /> Change number
                                </button>

                                <h2
                                    className="text-lg font-semibold mb-1"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    Enter OTP
                                </h2>
                                <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                                    Sent to {identifier}
                                    {expiresIn > 0 && (
                                        <span className="ml-2" style={{ color: "#F59E0B" }}>
                                            {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, "0")}
                                        </span>
                                    )}
                                </p>

                                {/* Dev OTP hint */}
                                {devOtp && (
                                    <div
                                        className="text-xs p-2 rounded-lg mb-3"
                                        style={{
                                            background: "#F59E0B20",
                                            color: "#F59E0B",
                                            border: "1px solid #F59E0B40",
                                        }}
                                    >
                                        🔧 Dev OTP: <strong>{devOtp}</strong>
                                    </div>
                                )}

                                {/* OTP Grid */}
                                <div className="flex gap-2 mb-4 justify-center">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className="w-11 h-12 text-center text-lg font-bold rounded-xl outline-none"
                                            style={{
                                                background: "var(--bg-elevated)",
                                                color: "var(--text-primary)",
                                                border: digit
                                                    ? "2px solid #3B82F6"
                                                    : "1px solid var(--border-primary)",
                                            }}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <p className="text-xs mb-3" style={{ color: "#EF4444" }}>
                                        {error}
                                    </p>
                                )}

                                <button
                                    onClick={() => handleVerifyOTP()}
                                    disabled={loading || otp.join("").length < 6}
                                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
                                    style={{
                                        background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                                        color: "white",
                                        opacity: loading || otp.join("").length < 4 ? 0.5 : 1,
                                    }}
                                >
                                    {loading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            Verify <Shield size={16} />
                                        </>
                                    )}
                                </button>

                                {/* Resend */}
                                {expiresIn === 0 && (
                                    <button
                                        onClick={async () => {
                                            setError(null);
                                            const result = await requestOTP(identifier.trim());
                                            if (result.success) {
                                                setExpiresIn(result.expiresInSeconds || 300);
                                                if (result.devOtp) setDevOtp(result.devOtp);
                                            }
                                        }}
                                        className="w-full text-center text-xs mt-3 py-2"
                                        style={{ color: "#3B82F6" }}
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Skip */}
                <button
                    onClick={() => router.push("/")}
                    className="w-full text-center text-xs mt-4 py-2"
                    style={{ color: "var(--text-muted)" }}
                >
                    Skip login — continue as guest →
                </button>
            </motion.div>
        </div>
    );
}
