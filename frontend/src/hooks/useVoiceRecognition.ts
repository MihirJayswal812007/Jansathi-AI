// ===== JanSathi AI — Voice Recognition Hook =====
// Uses Web Speech API for low-latency voice interaction

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Language } from "@/types/modules";

interface UseVoiceRecognitionOptions {
    language: Language;
    continuous?: boolean;
    onResult?: (transcript: string) => void;
    onError?: (error: string) => void;
}

interface UseVoiceRecognitionReturn {
    isListening: boolean;
    transcript: string;
    interimTranscript: string;
    startListening: () => void;
    stopListening: () => void;
    isSupported: boolean;
}

const LANG_MAP: Record<Language, string> = {
    hi: "hi-IN",
    en: "en-IN",
};

export function useVoiceRecognition({
    language,
    continuous = false,
    onResult,
    onError,
}: UseVoiceRecognitionOptions): UseVoiceRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = continuous;
            recognition.interimResults = true;
            recognition.lang = LANG_MAP[language];

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let interim = "";
                let final = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        final += result[0].transcript;
                    } else {
                        interim += result[0].transcript;
                    }
                }

                if (final) {
                    setTranscript(final);
                    setInterimTranscript("");
                    onResult?.(final);
                } else {
                    setInterimTranscript(interim);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                setIsListening(false);
                onError?.(event.error);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            recognitionRef.current?.abort();
        };
    }, [language, continuous, onResult, onError]);

    // Update language on the fly
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = LANG_MAP[language];
        }
    }, [language]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript("");
            setInterimTranscript("");
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        isSupported,
    };
}
