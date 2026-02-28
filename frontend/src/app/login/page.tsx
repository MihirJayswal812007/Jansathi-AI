// ===== JanSathi AI — OTP Login Page (21st.dev Redesign) =====
// Two-step authentication: phone/email → OTP verification
// Glassmorphic 3D tilt card design

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Phone, Mail, ArrowRight, Loader2, KeyRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { requestOTP, verifyOTP } from "@/lib/apiClient";
import { useUserStore } from "@/store/userStore";

type Step = "identifier" | "otp";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-lg border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-white/20 focus-visible:ring-ring/50",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className
            )}
            {...props}
        />
    )
}

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/";
    const { setAuth } = useUserStore();

    // Application state
    const [step, setStep] = useState<Step>("identifier");
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [expiresIn, setExpiresIn] = useState(0);

    // UI State
    const [focusedInput, setFocusedInput] = useState<"identifier" | "otp" | null>(null);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 3D card effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
    const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

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
    const handleRequestOTP = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!identifier.trim() || identifier.trim().length < 5) {
            setError("Enter a valid phone number or email");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await requestOTP(identifier);
            if (res.success) {
                setStep("otp");
                setExpiresIn(res.expiresInSeconds || 300);
                if (res.devOtp) {
                    setDevOtp(res.devOtp);
                    console.log("🛠️ DEV OTP:", res.devOtp); // Always log for debugging
                } else {
                    setDevOtp(null);
                }
                // Focus first OTP input after short delay for animation
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                setError(res.message || "Failed to send OTP");
            }
        } catch (err: any) {
            setError(err.message || "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: OTP Input Logic ─────────────────────────────
    const handleOtpChange = (index: number, val: string) => {
        if (!/^\d*$/.test(val)) return;

        const newOtp = [...otp];
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);
        setError(null);

        if (val && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        } else if (e.key === "Enter" && otp.every((d) => d !== "")) {
            handleVerifyOTP(e);
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
            if (pastedData.length === 6) {
                setError(null);
            }
        }
    };

    // ── Step 3: Verify OTP ──────────────────────────────────
    const handleVerifyOTP = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const code = otp.join("");
        if (code.length !== 6) {
            setError("Please enter all 6 digits.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await verifyOTP(identifier, code);
            if (res.success && res.session) {
                // Initialize session in store
                setAuth(res.session);

                // If user is admin but not redirecting to admin dashboard, point them there
                if (res.session.role?.toLowerCase() === "admin" && redirectTo === "/") {
                    router.push("/admin/dashboard");
                } else {
                    router.push(redirectTo);
                }
            } else {
                setError(res.message || "Invalid verification code.");
            }
        } catch (err: any) {
            setError(err.message || "Network error. Please try again.");
            setOtp(["", "", "", "", "", ""]);
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setStep("identifier");
        setOtp(["", "", "", "", "", ""]);
        setError(null);
        setDevOtp(null);
        setExpiresIn(0);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
            {/* Background gradient effect - changed to blue theme */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-black" />

            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px'
                }}
            />

            {/* Top radial glow - Blue theme */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-blue-500/10 blur-[80px]" />
            <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-cyan-400/5 blur-[60px]"
                animate={{
                    opacity: [0.15, 0.3, 0.15],
                    scale: [0.98, 1.02, 0.98]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
            />
            <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-blue-600/10 blur-[60px]"
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1
                }}
            />

            {/* Animated glow spots */}
            <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-20" />
            <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-20" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-sm relative z-10 mx-4"
                style={{ perspective: 1500 }}
            >
                <motion.div
                    className="relative"
                    style={{ rotateX, rotateY }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    whileHover={{ z: 10 }}
                >
                    <div className="relative group">
                        {/* Card glow effect */}
                        <motion.div
                            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
                            animate={{
                                boxShadow: [
                                    "0 0 10px 2px rgba(255,255,255,0.03)",
                                    "0 0 15px 5px rgba(255,255,255,0.05)",
                                    "0 0 10px 2px rgba(255,255,255,0.03)"
                                ],
                                opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "mirror"
                            }}
                        />

                        {/* Traveling light beam effect */}
                        <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
                            {/* Top light beam */}
                            <motion.div
                                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    left: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror" }
                                }}
                            />

                            {/* Right light beam */}
                            <motion.div
                                className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    top: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 }
                                }}
                            />

                            {/* Bottom light beam */}
                            <motion.div
                                className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    right: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 }
                                }}
                            />

                            {/* Left light beam */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    bottom: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 }
                                }}
                            />
                        </div>

                        {/* Card border shadow layer */}
                        <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/3 via-white/7 to-white/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none" />

                        {/* Glass card container */}
                        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/[0.05] shadow-2xl overflow-hidden">
                            {/* Subtle grid pattern inside card */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{
                                    backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                                    backgroundSize: '30px 30px'
                                }}
                            />

                            {/* Header */}
                            <div className="text-center space-y-1 mb-8">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", duration: 0.8 }}
                                    className="mx-auto w-12 h-12 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden bg-black/50"
                                >
                                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">JS</span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80 mt-2"
                                >
                                    {step === "identifier" ? "Welcome to JanSathi" : "Verify OTP"}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/60 text-sm"
                                >
                                    {step === "identifier"
                                        ? "Sign in to access digital services"
                                        : `Code sent to ${identifier}`}
                                </motion.p>
                            </div>

                            {/* Global Error Banner */}
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Dev Helper - Auto fills OTP if available */}
                            <AnimatePresence>
                                {devOtp && step === "otp" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => {
                                            const newOtp = devOtp.split("").slice(0, 6);
                                            setOtp(newOtp);
                                            setError(null);
                                        }}
                                        className="mb-4 p-2 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs text-center text-blue-300 cursor-pointer hover:bg-blue-500/20 transition-colors"
                                    >
                                        🛠 Dev Mode: Click to paste <strong>{devOtp}</strong>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form Forms Container */}
                            <AnimatePresence mode="wait">
                                {/* STEP 1: PHONE/EMAIL */}
                                {step === "identifier" && (
                                    <motion.form
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onSubmit={handleRequestOTP}
                                        className="space-y-6"
                                    >
                                        <motion.div
                                            className={`relative ${focusedInput === "identifier" ? 'z-10' : ''}`}
                                            whileFocus={{ scale: 1.02 }}
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        >
                                            <div className="absolute -inset-[0.5px] bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

                                            <div className="relative flex items-center overflow-hidden rounded-lg">
                                                {/* Keeping both phone and mail icons as requested */}
                                                <div className={`absolute left-3 flex items-center gap-1.5 transition-all duration-300 ${focusedInput === "identifier" ? 'text-white' : 'text-white/40'}`}>
                                                    <Phone className="w-4 h-4" />
                                                    <div className="w-[1px] h-3 bg-white/20" />
                                                    <Mail className="w-4 h-4" />
                                                </div>

                                                <Input
                                                    type="text"
                                                    placeholder="Phone number or Email"
                                                    value={identifier}
                                                    onChange={(e) => setIdentifier(e.target.value)}
                                                    onFocus={() => setFocusedInput("identifier")}
                                                    onBlur={() => setFocusedInput(null)}
                                                    disabled={loading}
                                                    className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-12 transition-all duration-300 pl-[4.5rem] pr-3 focus:bg-white/10"
                                                />

                                                {/* Input highlight effect */}
                                                {focusedInput === "identifier" && (
                                                    <motion.div
                                                        layoutId="input-highlight"
                                                        className="absolute inset-0 bg-white/5 -z-10"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Submit Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading || identifier.length < 5}
                                            className="w-full relative group/button disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300 pointer-events-none" />

                                            <div className="relative overflow-hidden bg-white text-black font-medium h-12 rounded-lg transition-all duration-300 flex items-center justify-center">
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -z-10"
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                                                    style={{ opacity: loading ? 1 : 0, transition: 'opacity 0.3s ease' }}
                                                />

                                                <AnimatePresence mode="wait">
                                                    {loading ? (
                                                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                            <div className="w-5 h-5 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2 text-sm font-semibold">
                                                            Continue
                                                            <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-300" />
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.button>
                                    </motion.form>
                                )}

                                {/* STEP 2: OTP */}
                                {step === "otp" && (
                                    <motion.form
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleVerifyOTP}
                                        className="space-y-6"
                                    >
                                        <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => { otpRefs.current[index] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="one-time-code"
                                                    maxLength={1}
                                                    disabled={loading}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    onFocus={(e) => e.target.select()}
                                                    className={cn(
                                                        "w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border",
                                                        "bg-white/5 border-white/10 text-white shadow-inner",
                                                        "focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/10 outline-none transition-all",
                                                        "disabled:opacity-50"
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        {/* Actions: Verify & Resend */}
                                        <div className="flex flex-col gap-4">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={loading || otp.join("").length < 6}
                                                className="w-full relative group/button disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300 pointer-events-none" />

                                                <div className="relative overflow-hidden bg-white text-black font-medium h-12 rounded-lg transition-all duration-300 flex items-center justify-center">
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -z-10"
                                                        animate={{ x: ['-100%', '100%'] }}
                                                        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                                                        style={{ opacity: loading ? 1 : 0, transition: 'opacity 0.3s ease' }}
                                                    />

                                                    <AnimatePresence mode="wait">
                                                        {loading ? (
                                                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                                <div className="w-5 h-5 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                                                            </motion.div>
                                                        ) : (
                                                            <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2 text-sm font-semibold">
                                                                Verify & Login
                                                                <KeyRound className="w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-300" />
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.button>

                                            <div className="flex items-center justify-between text-xs sm:text-sm text-white/50">
                                                <button
                                                    type="button"
                                                    onClick={resetFlow}
                                                    className="hover:text-white transition-colors"
                                                >
                                                    Change Number
                                                </button>

                                                {expiresIn > 0 ? (
                                                    <span>Resend code in {formatTime(expiresIn)}</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); handleRequestOTP(); }}
                                                        className="text-white hover:underline transition-all"
                                                    >
                                                        Resend Code
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
