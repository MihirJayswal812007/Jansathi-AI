'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Phone, KeyRound, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { requestOTP, verifyOTP } from '@/lib/apiClient';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';

// ── Reusable Input ──────────────────────────────────────────
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            className={cn(
                "placeholder:text-white/30 flex h-10 w-full min-w-0 rounded-lg bg-white/5 border border-transparent px-3 py-1 text-base text-white shadow-xs transition-all duration-300 outline-none",
                "focus:border-white/20 focus:bg-white/10 focus:ring-[3px] focus:ring-white/10",
                className
            )}
            {...props}
        />
    );
}

// ── Login Steps ─────────────────────────────────────────────
type Step = 'phone' | 'otp' | 'success';

export default function LoginPage() {
    const [step, setStep] = useState<Step>('phone');
    const [identifier, setIdentifier] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const setAuth = useUserStore((s) => s.setAuth);
    const router = useRouter();

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

    // ── Step 1: Request OTP ─────────────────────────────────
    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim() || identifier.trim().length < 5) {
            setError('Enter a valid phone number or email');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await requestOTP(identifier.trim());
            if (result.success) {
                setStep('otp');
                if (result.devOtp) {
                    setDevOtp(result.devOtp);
                    setOtpCode(result.devOtp); // auto-fill so user just clicks Verify
                }
            } else {
                setError(result.message || 'Failed to send OTP');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 2: Verify OTP ──────────────────────────────────
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpCode.trim() || otpCode.trim().length < 4) {
            setError('Enter the OTP code');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await verifyOTP(identifier.trim(), otpCode.trim());
            if (result.success && result.session) {
                setAuth(result.session);
                setStep('success');
                const destination = result.session.role === 'admin' ? '/dashboard' : '/chat';
                setTimeout(() => router.push(destination), 1500);
            } else {
                setError(result.message || 'Invalid OTP');
            }
        } catch {
            setError('Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/40 via-indigo-700/50 to-black" />

            {/* Noise texture */}
            <div
                className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                }}
            />

            {/* Top radial glow */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-blue-400/25 blur-[80px]" />
            <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-blue-300/25 blur-[60px]"
                animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
            />
            <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-indigo-400/25 blur-[60px]"
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
            />

            {/* Glow spots */}
            <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
            <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

            {/* ── Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-sm relative z-10"
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
                        {/* Card glow */}
                        <motion.div
                            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
                            animate={{
                                boxShadow: [
                                    '0 0 10px 2px rgba(255,255,255,0.03)',
                                    '0 0 15px 5px rgba(255,255,255,0.05)',
                                    '0 0 10px 2px rgba(255,255,255,0.03)',
                                ],
                                opacity: [0.2, 0.4, 0.2],
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
                        />

                        {/* Traveling light beams */}
                        <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: 'blur(2px)' }}
                                animate={{ left: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                                transition={{ left: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror' }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror' } }}
                            />
                            <motion.div
                                className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: 'blur(2px)' }}
                                animate={{ top: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                                transition={{ top: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 0.6 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 0.6 } }}
                            />
                            <motion.div
                                className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: 'blur(2px)' }}
                                animate={{ right: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                                transition={{ right: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.2 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 1.2 } }}
                            />
                            <motion.div
                                className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: 'blur(2px)' }}
                                animate={{ bottom: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                                transition={{ bottom: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.8 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 1.8 } }}
                            />

                            {/* Corner glow dots */}
                            <motion.div className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]"
                                animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }} />
                            <motion.div className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]"
                                animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.4, repeat: Infinity, repeatType: 'mirror', delay: 0.5 }} />
                            <motion.div className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]"
                                animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: 'mirror', delay: 1 }} />
                            <motion.div className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]"
                                animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.3, repeat: Infinity, repeatType: 'mirror', delay: 1.5 }} />
                        </div>

                        {/* Card border glow */}
                        <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03] opacity-0 group-hover:opacity-70 transition-opacity duration-500" />

                        {/* ── Glass Card ── */}
                        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
                            {/* Inner grid pattern */}
                            <div
                                className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                                    backgroundSize: '30px 30px',
                                }}
                            />

                            {/* Logo + Header */}
                            <div className="text-center space-y-1 mb-5">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', duration: 0.8 }}
                                    className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden"
                                >
                                    <span className="material-symbols-outlined text-lg" style={{ color: '#3B82F6' }}>auto_awesome</span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                                >
                                    {step === 'success' ? 'Welcome!' : 'Welcome to JanSathi'}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/60 text-xs"
                                >
                                    {step === 'phone' && 'Sign in to access digital services'}
                                    {step === 'otp' && `Enter the OTP sent to ${identifier}`}
                                    {step === 'success' && 'Redirecting you to your dashboard...'}
                                </motion.p>
                            </div>

                            {/* ── Error Display ── */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Dev OTP hint */}
                            <AnimatePresence>
                                {devOtp && step === 'otp' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center"
                                    >
                                        Dev OTP: <span className="font-mono font-bold">{devOtp}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ── Step: Phone/Email ── */}
                            <AnimatePresence mode="wait">
                                {step === 'phone' && (
                                    <motion.form
                                        key="phone-step"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        onSubmit={handleRequestOTP}
                                        className="space-y-4"
                                    >
                                        <motion.div
                                            className={cn('relative', focusedInput === 'phone' && 'z-10')}
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        >
                                            <div className="relative flex items-center overflow-hidden rounded-lg">
                                                <Phone className={cn('absolute left-3 w-4 h-4 transition-all duration-300', focusedInput === 'phone' ? 'text-white' : 'text-white/40')} />
                                                <Input
                                                    type="text"
                                                    placeholder="Phone number or Email"
                                                    value={identifier}
                                                    onChange={(e) => { setIdentifier(e.target.value); setError(null); }}
                                                    onFocus={() => setFocusedInput('phone')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    className="pl-10 pr-3"
                                                    autoFocus
                                                />
                                                {focusedInput === 'phone' && (
                                                    <motion.div layoutId="input-highlight" className="absolute inset-0 bg-white/5 -z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Continue button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full relative group/button mt-2"
                                        >
                                            <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                                            <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -z-10"
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
                                                    style={{ opacity: isLoading ? 1 : 0, transition: 'opacity 0.3s ease' }}
                                                />
                                                <AnimatePresence mode="wait">
                                                    {isLoading ? (
                                                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                            <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-1 text-sm font-medium">
                                                            Continue
                                                            <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.button>
                                    </motion.form>
                                )}

                                {/* ── Step: OTP Verification ── */}
                                {step === 'otp' && (
                                    <motion.form
                                        key="otp-step"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        onSubmit={handleVerifyOTP}
                                        className="space-y-4"
                                    >
                                        <motion.div
                                            className={cn('relative', focusedInput === 'otp' && 'z-10')}
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        >
                                            <div className="relative flex items-center overflow-hidden rounded-lg">
                                                <KeyRound className={cn('absolute left-3 w-4 h-4 transition-all duration-300', focusedInput === 'otp' ? 'text-white' : 'text-white/40')} />
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="Enter OTP code"
                                                    value={otpCode}
                                                    onChange={(e) => { setOtpCode(e.target.value.replace(/[^0-9]/g, '')); setError(null); }}
                                                    onFocus={() => setFocusedInput('otp')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    className="pl-10 pr-3 tracking-[0.3em] text-center font-mono"
                                                    maxLength={6}
                                                    autoFocus
                                                />
                                                {focusedInput === 'otp' && (
                                                    <motion.div layoutId="input-highlight" className="absolute inset-0 bg-white/5 -z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Verify button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full relative group/button mt-2"
                                        >
                                            <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                                            <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                                                <AnimatePresence mode="wait">
                                                    {isLoading ? (
                                                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                            <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-1 text-sm font-medium">
                                                            Verify OTP
                                                            <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.button>

                                        {/* Back button */}
                                        <button
                                            type="button"
                                            onClick={() => { setStep('phone'); setOtpCode(''); setError(null); setDevOtp(null); }}
                                            className="w-full text-center text-xs text-white/40 hover:text-white/70 transition-colors duration-200 mt-1"
                                        >
                                            ← Change phone number
                                        </button>
                                    </motion.form>
                                )}

                                {/* ── Step: Success ── */}
                                {step === 'success' && (
                                    <motion.div
                                        key="success-step"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center gap-3 py-4"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                        >
                                            <CheckCircle className="w-12 h-12 text-emerald-400" />
                                        </motion.div>
                                        <p className="text-white/60 text-sm">Authentication successful</p>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ── Divider + Skip ── */}
                            {step !== 'success' && (
                                <>
                                    <div className="relative mt-5 mb-4 flex items-center">
                                        <div className="flex-grow border-t border-white/5" />
                                        <motion.span
                                            className="mx-3 text-xs text-white/40"
                                            animate={{ opacity: [0.7, 0.9, 0.7] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        >
                                            or
                                        </motion.span>
                                        <div className="flex-grow border-t border-white/5" />
                                    </div>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Link
                                            href="/chat"
                                            className="w-full relative group/skip block"
                                        >
                                            <div className="absolute inset-0 bg-white/5 rounded-lg blur opacity-0 group-hover/skip:opacity-70 transition-opacity duration-300" />
                                            <div className="relative overflow-hidden bg-white/5 text-white font-medium h-10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-base text-white/70 group-hover/skip:text-white transition-colors duration-300">chat</span>
                                                <span className="text-white/70 group-hover/skip:text-white transition-colors text-xs">
                                                    Continue without signing in
                                                </span>
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
                                                    initial={{ x: '-100%' }}
                                                    whileHover={{ x: '100%' }}
                                                    transition={{ duration: 1, ease: 'easeInOut' }}
                                                />
                                            </div>
                                        </Link>
                                    </motion.div>

                                    <motion.p
                                        className="text-center text-xs text-white/40 mt-4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        No password needed — we use{' '}
                                        <span className="text-white/60 font-medium">OTP verification</span>
                                    </motion.p>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
