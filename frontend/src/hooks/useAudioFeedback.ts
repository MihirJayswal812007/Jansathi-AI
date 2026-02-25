// ===== JanSathi AI — Audio Feedback Hook =====
// Generates subtle sound effects using Web Audio API.
// No external audio files needed — all synthesized.

"use client";

import { useCallback, useRef } from "react";

type SoundType = "startListening" | "stopListening" | "messageSent" | "responseReceived" | "modeSwitch" | "error";

interface AudioFeedbackReturn {
    playSound: (type: SoundType) => void;
    isSupported: boolean;
}

export function useAudioFeedback(): AudioFeedbackReturn {
    const ctxRef = useRef<AudioContext | null>(null);
    const isSupported = typeof window !== "undefined" && "AudioContext" in window;

    const getCtx = useCallback(() => {
        if (!ctxRef.current && isSupported) {
            ctxRef.current = new AudioContext();
        }
        return ctxRef.current;
    }, [isSupported]);

    const playTone = useCallback(
        (frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) => {
            const ctx = getCtx();
            if (!ctx) return;

            // Resume if suspended (autoplay policy)
            if (ctx.state === "suspended") ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        },
        [getCtx]
    );

    const playChord = useCallback(
        (frequencies: number[], duration: number, type: OscillatorType = "sine", volume = 0.08) => {
            frequencies.forEach((f) => playTone(f, duration, type, volume));
        },
        [playTone]
    );

    const playSound = useCallback(
        (sound: SoundType) => {
            switch (sound) {
                case "startListening":
                    // Rising two-tone chime
                    playTone(440, 0.15, "sine", 0.12);
                    setTimeout(() => playTone(587, 0.2, "sine", 0.12), 100);
                    break;

                case "stopListening":
                    // Falling tone
                    playTone(587, 0.12, "sine", 0.10);
                    setTimeout(() => playTone(440, 0.18, "sine", 0.10), 80);
                    break;

                case "messageSent":
                    // Quick blip
                    playTone(800, 0.08, "sine", 0.08);
                    break;

                case "responseReceived":
                    // Soft chord
                    playChord([523, 659, 784], 0.25, "sine", 0.06);
                    break;

                case "modeSwitch":
                    // Sweep tone
                    playTone(330, 0.12, "triangle", 0.10);
                    setTimeout(() => playTone(440, 0.12, "triangle", 0.10), 60);
                    setTimeout(() => playTone(660, 0.15, "triangle", 0.10), 120);
                    break;

                case "error":
                    // Low buzz
                    playTone(220, 0.2, "sawtooth", 0.06);
                    break;
            }
        },
        [playTone, playChord]
    );

    return { playSound, isSupported };
}
