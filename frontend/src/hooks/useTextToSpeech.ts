// ===== JanSathi AI — Text-to-Speech Hook =====

"use client";

import { useCallback, useRef, useState } from "react";
import { Language } from "@/types/modules";

interface UseTextToSpeechOptions {
    language: Language;
}

interface UseTextToSpeechReturn {
    speak: (text: string) => void;
    stop: () => void;
    isSpeaking: boolean;
    isSupported: boolean;
}

const VOICE_LANG_MAP: Record<Language, string> = {
    hi: "hi-IN",
    en: "en-IN",
};

export function useTextToSpeech({
    language,
}: UseTextToSpeechOptions): UseTextToSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

    const speak = useCallback(
        (text: string) => {
            if (!isSupported) return;

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = VOICE_LANG_MAP[language];
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1.0;

            // Try to find a matching voice
            const voices = window.speechSynthesis.getVoices();
            const matchingVoice = voices.find(
                (v) => v.lang === VOICE_LANG_MAP[language]
            );
            if (matchingVoice) {
                utterance.voice = matchingVoice;
            }

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        },
        [language, isSupported]
    );

    const stop = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isSupported]);

    return { speak, stop, isSpeaking, isSupported };
}
