// ===== JanSathi AI — Vision Provider Interface =====
// Stub for future computer vision providers (Google Vision, GPT-4V, local).

export interface IVisionProvider {
    readonly name: string;

    /** Analyze an image and return a text description or structured data */
    analyzeImage(image: Buffer, prompt?: string): Promise<{ description: string; labels?: string[] }>;
}
