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
    const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Store callbacks in refs to avoid re-triggering the effect
    const onResultRef = useRef(onResult);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onResultRef.current = onResult;
        onErrorRef.current = onError;
    }, [onResult, onError]);

    // Clear silence timeout helper
    const clearSilenceTimeout = useCallback(() => {
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = continuous;
            recognition.interimResults = true;
            // maxAlternatives is supported in browsers but not in TS types
            (recognition as any).maxAlternatives = 1;
            recognition.lang = LANG_MAP[language];

            (recognition as any).onstart = () => {
                console.log("[Voice] Recognition started, lang:", recognition.lang);
            };

            (recognition as any).onaudiostart = () => {
                console.log("[Voice] Audio capture started");
            };

            (recognition as any).onsoundstart = () => {
                console.log("[Voice] Sound detected");
            };

            (recognition as any).onspeechstart = () => {
                console.log("[Voice] Speech detected");
                // Reset the silence timeout since speech was detected
                clearSilenceTimeout();
            };

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

                console.log("[Voice] Result — final:", JSON.stringify(final), "interim:", JSON.stringify(interim));

                if (final) {
                    setTranscript(final);
                    setInterimTranscript("");
                    clearSilenceTimeout();
                    onResultRef.current?.(final);
                } else {
                    setInterimTranscript(interim);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error("[Voice] Error:", event.error, event.message);
                clearSilenceTimeout();
                setIsListening(false);

                // Provide user-friendly error messages
                let errorMsg = event.error;
                switch (event.error) {
                    case "no-speech":
                        errorMsg = "No speech detected. Please try again.";
                        break;
                    case "audio-capture":
                        errorMsg = "No microphone found. Check your mic settings.";
                        break;
                    case "not-allowed":
                        errorMsg = "Microphone access denied. Allow mic in browser settings.";
                        break;
                    case "network":
                        errorMsg = "Network error. Speech recognition requires internet.";
                        break;
                    case "aborted":
                        // Don't notify for aborted — this is intentional
                        return;
                }
                onErrorRef.current?.(errorMsg);
            };

            recognition.onend = () => {
                console.log("[Voice] Recognition ended");
                clearSilenceTimeout();
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("[Voice] SpeechRecognition API not supported in this browser");
        }

        return () => {
            clearSilenceTimeout();
            recognitionRef.current?.abort();
        };
    }, [language, continuous, clearSilenceTimeout]);

    // Update language on the fly
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = LANG_MAP[language];
        }
    }, [language]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                setTranscript("");
                setInterimTranscript("");
                recognitionRef.current.start();
                setIsListening(true);
                console.log("[Voice] Starting recognition...");

                // Set a silence timeout — if no result in 10s, stop and notify
                clearSilenceTimeout();
                silenceTimeoutRef.current = setTimeout(() => {
                    console.log("[Voice] Silence timeout — no speech detected in 10s");
                    if (recognitionRef.current) {
                        recognitionRef.current.stop();
                    }
                    setIsListening(false);
                    onErrorRef.current?.("No speech detected. Please try speaking louder or check your microphone.");
                }, 10000);
            } catch (err) {
                console.error("[Voice] Failed to start:", err);
                setIsListening(false);
                onErrorRef.current?.("Failed to start voice recognition. Try again.");
            }
        }
    }, [isListening, clearSilenceTimeout]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            clearSilenceTimeout();
            setIsListening(false);
        }
    }, [isListening, clearSilenceTimeout]);

    return {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        isSupported,
    };
}
