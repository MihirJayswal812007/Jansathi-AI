// ===== JanSathi AI — Speech Provider Interface =====
// Stub for future TTS/STT providers (Google Cloud Speech, Azure, Whisper).

export interface ISpeechProvider {
    readonly name: string;

    /** Text-to-Speech: Convert text to audio buffer */
    textToSpeech(text: string, language: "hi" | "en"): Promise<Buffer>;

    /** Speech-to-Text: Convert audio buffer to text */
    speechToText(audio: Buffer, language: "hi" | "en"): Promise<{ text: string; confidence: number }>;
}
