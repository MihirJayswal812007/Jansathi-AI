"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_SECTIONS = [
    {
        icon: "mic",
        title: "Voice Input",
        titleHi: "आवाज़ इनपुट",
        items: [
            {
                q: "How do I use voice input?",
                a: "Click the microphone orb or the mic icon in the chat input bar. Speak clearly and JanSathi will transcribe and respond to your question. You can switch between Hindi and English from the sidebar language toggle.",
            },
            {
                q: "Why isn't voice working?",
                a: "Make sure your browser has microphone permissions enabled. Voice input works best in Chrome, Edge, or Safari. Check Settings → Voice to ensure voice is enabled.",
            },
        ],
    },
    {
        icon: "dashboard",
        title: "Modules",
        titleHi: "मॉड्यूल",
        items: [
            {
                q: "What are the 5 modules?",
                a: "JanSeva (government schemes & civic services), JanShiksha (education & learning), JanKrishi (agriculture & farming), JanVyapar (business & marketplace), and JanKaushal (skills & career). Each module has specialized AI trained for that domain.",
            },
            {
                q: "How do I switch modules?",
                a: "Click the ← back arrow in the chat header to return to the module selection screen. Then select a different module card to start a new conversation in that domain.",
            },
        ],
    },
    {
        icon: "translate",
        title: "Language",
        titleHi: "भाषा",
        items: [
            {
                q: "Can I chat in Hindi?",
                a: "Yes! Toggle the language switch in the sidebar footer between हिंदी and EN. The AI understands both Hindi and English, and you can even mix them (Hinglish).",
            },
        ],
    },
    {
        icon: "security",
        title: "Privacy & Security",
        titleHi: "गोपनीयता",
        items: [
            {
                q: "Is my data safe?",
                a: "Yes. Your conversations are encrypted in transit and stored securely in our database. Only you and authorized administrators can access your data. We use industry-standard security practices including OTP authentication, CSRF protection, and rate limiting.",
            },
            {
                q: "Can I delete my conversations?",
                a: "This feature is coming soon. Currently, your conversation history is stored for your reference. Contact support if you need data removed.",
            },
        ],
    },
    {
        icon: "support_agent",
        title: "Getting Help",
        titleHi: "सहायता",
        items: [
            {
                q: "The AI gave wrong information. What do I do?",
                a: "The AI provides information based on its training data and retrieved documents. Always verify important information (especially for government schemes) from official sources. You can rate conversations to help us improve accuracy.",
            },
            {
                q: "How do I report an issue?",
                a: "Use the feedback system in each conversation (star rating). For technical issues, note the error message and contact the development team.",
            },
        ],
    },
];

export default function HelpPage() {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggleItem = (key: string) => {
        setOpenItems((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold font-space text-white">Help & FAQ</h1>
                <p className="text-gray-400 text-sm mt-1">Everything you need to know about JanSathi AI</p>
            </motion.div>

            {/* Quick Tips */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                {[
                    { icon: "tips_and_updates", tip: "Tap the orb to start voice chat", color: "text-amber-400", bg: "bg-amber-500/10" },
                    { icon: "swap_horiz", tip: "Switch modules anytime with ←", color: "text-blue-400", bg: "bg-blue-500/10" },
                    { icon: "star", tip: "Rate chats to help us improve", color: "text-violet-400", bg: "bg-violet-500/10" },
                ].map((t) => (
                    <div key={t.tip} className={`p-4 rounded-xl ${t.bg} border border-white/5 flex items-start gap-3`}>
                        <span className={`material-symbols-outlined ${t.color} shrink-0`} style={{ fontSize: "20px" }}>{t.icon}</span>
                        <p className="text-xs text-gray-300 leading-relaxed">{t.tip}</p>
                    </div>
                ))}
            </motion.div>

            {/* FAQ Accordion */}
            {FAQ_SECTIONS.map((section, si) => (
                <motion.div
                    key={section.title}
                    className="glass-card p-6 rounded-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: si * 0.06 + 0.1 }}
                >
                    <h2 className="text-base font-semibold font-space text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400" style={{ fontSize: "20px" }}>{section.icon}</span>
                        {section.title}
                    </h2>
                    <div className="space-y-2">
                        {section.items.map((item) => {
                            const key = `${section.title}-${item.q}`;
                            const isOpen = openItems.has(key);
                            return (
                                <div key={key} className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                                    <button
                                        onClick={() => toggleItem(key)}
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                                    >
                                        <span className="text-sm font-medium text-white pr-4">{item.q}</span>
                                        <span
                                            className="material-symbols-outlined text-gray-500 shrink-0 transition-transform"
                                            style={{ fontSize: "20px", transform: isOpen ? "rotate(180deg)" : "" }}
                                        >
                                            expand_more
                                        </span>
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">
                                                    {item.a}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
