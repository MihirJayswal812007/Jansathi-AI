// ===== JanSathi AI — Chat Page =====
// Client component managing the welcome → chat transition.
// Routes through (app) group to share sidebar.

"use client";

import { useState, useCallback, useRef } from "react";
import { ModeName, ChatMessage } from "@/types/modules";
import { useChatStore } from "@/store/chatStore";
import { useModeStore } from "@/store/modeStore";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { sendChatMessage } from "@/lib/apiClient";
import { ALL_MODES, MODE_CONFIGS } from "@/lib/constants";
import WelcomeScreen from "@/components/chat/WelcomeScreen";
import ChatView from "@/components/chat/ChatView";

// ── Auto-module detection from transcript ──────────────────────────
const MODULE_KEYWORDS: Record<ModeName, string[]> = {
    janseva: [
        "scheme", "yojana", "government", "sarkari", "document", "aadhaar",
        "complaint", "pension", "ration", "voter", "sarkar", "sarkaar",
        "pm awas", "ayushman", "nrega", "modi", "subsidy", "certificate",
        "BPL", "शिकायत", "योजना", "सरकार", "पेंशन", "राशन", "आधार",
    ],
    janshiksha: [
        "study", "exam", "school", "college", "class", "math", "science",
        "learn", "quiz", "homework", "teacher", "student", "padhai",
        "photosynthesis", "fraction", "पढ़ाई", "परीक्षा", "स्कूल", "विज्ञान",
        "गणित", "कक्षा", "शिक्षा",
    ],
    jankrishi: [
        "crop", "farm", "weather", "mandi", "price", "soil", "seed",
        "fertilizer", "harvest", "wheat", "rice", "disease", "farming",
        "agriculture", "kisan", "fasal", "kheti", "barish",
        "फसल", "खेती", "मंडी", "मौसम", "किसान", "बीज", "खाद",
    ],
    janvyapar: [
        "sell", "price", "product", "shop", "market", "business", "catalog",
        "store", "buy", "customer", "order", "bazar", "dukan", "vyapar",
        "बिक्री", "दुकान", "बाज़ार", "व्यापार", "ग्राहक",
    ],
    jankaushal: [
        "job", "resume", "career", "interview", "skill", "training",
        "salary", "vacancy", "employment", "naukri", "rozgar",
        "नौकरी", "रोज़गार", "कौशल", "इंटरव्यू", "रिज्यूमे",
    ],
};

function detectModule(transcript: string): ModeName | null {
    const lower = transcript.toLowerCase();
    let bestMatch: ModeName | null = null;
    let bestScore = 0;

    for (const mode of ALL_MODES) {
        const keywords = MODULE_KEYWORDS[mode];
        const score = keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
        if (score > bestScore) {
            bestScore = score;
            bestMatch = mode;
        }
    }

    return bestScore > 0 ? bestMatch : null;
}

export default function ChatPage() {
    const {
        messages,
        conversationId,
        addMessage,
        setConversationId,
        clearMessages,
    } = useChatStore();

    const {
        activeMode,
        setActiveMode,
        language,
        isProcessing,
        setIsProcessing,
    } = useModeStore();

    // Pending transcript for welcome screen auto-routing
    const pendingTranscriptRef = useRef<string | null>(null);

    // Voice recognition — uses the hook's own isListening & interimTranscript
    const {
        isListening,
        interimTranscript,
        startListening,
        stopListening,
    } = useVoiceRecognition({
        language,
        onResult: (transcript) => {
            if (transcript.trim()) {
                if (!activeMode) {
                    // On welcome screen — detect module and send message after routing
                    const detected = detectModule(transcript);
                    const target = detected || "janseva"; // Default to JanSeva
                    pendingTranscriptRef.current = transcript.trim();
                    setActiveMode(target);
                } else {
                    handleSendMessage(transcript.trim());
                }
            }
        },
        onError: () => {
            // Voice recognition error — no-op, UI updates via isListening
        },
    });

    // After activeMode is set from voice, send the pending message
    // This is handled in a useEffect-like check via the render
    if (activeMode && pendingTranscriptRef.current) {
        const msg = pendingTranscriptRef.current;
        pendingTranscriptRef.current = null;
        // Use setTimeout to ensure state is settled
        setTimeout(() => handleSendMessage(msg), 100);
    }

    const handleVoiceToggle = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    const handleSendMessage = useCallback(
        async (text: string) => {
            if (!activeMode || isProcessing) return;

            // Add user message
            const userMsg: ChatMessage = {
                id: `user-${Date.now()}`,
                role: "user",
                content: text,
                timestamp: new Date(),
                mode: activeMode,
                conversationId: conversationId || undefined,
            };
            addMessage(userMsg);
            setIsProcessing(true);

            try {
                const response = await sendChatMessage(
                    text,
                    activeMode,
                    messages,
                    language,
                    conversationId || undefined
                );

                // Store conversation ID
                if (response.conversationId && !conversationId) {
                    setConversationId(response.conversationId);
                }

                // Add AI response
                const aiMsg: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    role: "assistant",
                    content: response.content,
                    timestamp: new Date(),
                    mode: response.mode || activeMode,
                    conversationId: response.conversationId,
                    metadata: {
                        confidence: response.confidence,
                        intent: response.intent,
                        language,
                    },
                };
                addMessage(aiMsg);
            } catch {
                // Add error message
                const errorMsg: ChatMessage = {
                    id: `error-${Date.now()}`,
                    role: "assistant",
                    content:
                        language === "hi"
                            ? "क्षमा करें, कुछ गलत हो गया। कृपया फिर से प्रयास करें।"
                            : "Sorry, something went wrong. Please try again.",
                    timestamp: new Date(),
                    mode: activeMode,
                };
                addMessage(errorMsg);
            } finally {
                setIsProcessing(false);
            }
        },
        [
            activeMode,
            isProcessing,
            conversationId,
            messages,
            language,
            addMessage,
            setConversationId,
            setIsProcessing,
        ]
    );

    const handleModuleSelect = useCallback(
        (mode: ModeName) => {
            setActiveMode(mode);
        },
        [setActiveMode]
    );

    const handleBack = useCallback(() => {
        setActiveMode(null);
        clearMessages();
    }, [setActiveMode, clearMessages]);

    // Show welcome screen if no module selected
    if (!activeMode) {
        return (
            <WelcomeScreen
                onModuleSelect={handleModuleSelect}
                onVoiceToggle={handleVoiceToggle}
                isListening={isListening}
                isProcessing={isProcessing}
                interimTranscript={interimTranscript}
            />
        );
    }

    // Show chat view
    return (
        <ChatView
            messages={messages}
            activeMode={activeMode}
            onSend={handleSendMessage}
            onVoiceToggle={handleVoiceToggle}
            isListening={isListening}
            isProcessing={isProcessing}
            interimTranscript={interimTranscript}
            onBack={handleBack}
        />
    );
}
