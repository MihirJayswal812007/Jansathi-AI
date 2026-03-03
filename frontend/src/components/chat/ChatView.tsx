// ===== JanSathi AI — Chat View =====
// Scrollable message list with ChatBubble + ChatInput.
// Header shows active module name.

"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage, ModeName } from "@/types/modules";
import { MODE_CONFIGS } from "@/lib/constants";
import { useModeStore } from "@/store/modeStore";
import ChatBubble from "@/components/common/ChatBubble";
import ChatInput from "./ChatInput";
import ConcentricRingsOrb from "./ConcentricRingsOrb";
import ModuleGuide from "./ModuleGuide";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface ChatViewProps {
    messages: ChatMessage[];
    activeMode: ModeName;
    onSend: (message: string) => void;
    onVoiceToggle: () => void;
    isListening: boolean;
    isProcessing: boolean;
    interimTranscript?: string;
    onBack: () => void;
}

export default function ChatView({
    messages,
    activeMode,
    onSend,
    onVoiceToggle,
    isListening,
    isProcessing,
    interimTranscript,
    onBack,
}: ChatViewProps) {
    const { language } = useModeStore();
    const config = MODE_CONFIGS[activeMode];
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { speak, stop, isSpeaking } = useTextToSpeech({ language });

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const showVoiceOrb = messages.length === 0;

    return (
        <div className="chat-view">
            {/* Header */}
            <header className="chat-view-header">
                <button
                    className="chat-view-back"
                    onClick={onBack}
                    aria-label={language === "hi" ? "वापस" : "Back"}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                        arrow_back
                    </span>
                </button>
                <div
                    className="chat-view-module-badge"
                    style={{
                        background: config.surfaceColor,
                        borderColor: `${config.primaryColor}40`,
                    }}
                >
                    <span
                        className="material-symbols-outlined"
                        style={{ color: config.primaryColor, fontSize: "18px" }}
                        aria-hidden="true"
                    >
                        smart_toy
                    </span>
                    <span style={{ color: config.primaryColor, fontWeight: 600 }}>
                        {language === "hi" ? config.nameHi : config.name}
                    </span>
                </div>
                <span className="chat-view-tagline">
                    {language === "hi" ? config.taglineHi : config.tagline}
                </span>
            </header>

            {/* Messages area */}
            <div className="chat-view-messages">
                {showVoiceOrb ? (
                    <div className="chat-view-voice-hero flex flex-col items-center justify-center min-h-[60vh] pb-20 gap-6">
                        <ModuleGuide
                            config={config}
                            language={language}
                            onSelectAction={onSend}
                            micElement={
                                <ConcentricRingsOrb
                                    isListening={isListening}
                                    isProcessing={isProcessing}
                                    onToggle={onVoiceToggle}
                                    accentColor={config.primaryColor}
                                    language={language}
                                    interimTranscript={interimTranscript}
                                />
                            }
                        />
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <ChatBubble
                                key={msg.id}
                                message={msg}
                                onSpeak={speak}
                                isSpeaking={isSpeaking}
                                onStopSpeaking={stop}
                                language={language}
                            />
                        ))}
                    </AnimatePresence>
                )}

                {/* Typing indicator */}
                {isProcessing && messages.length > 0 && (
                    <motion.div
                        className="chat-typing-indicator"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="chat-typing-dot" />
                        <span className="chat-typing-dot" />
                        <span className="chat-typing-dot" />
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <ChatInput
                onSend={onSend}
                onVoiceToggle={onVoiceToggle}
                isListening={isListening}
                isProcessing={isProcessing}
                accentColor={config.primaryColor}
            />
        </div>
    );
}
