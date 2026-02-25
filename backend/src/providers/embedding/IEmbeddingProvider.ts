// ===== JanSathi AI — Embedding Provider Interface =====
// Stub for future vector embedding providers (OpenAI, Cohere, local).

export interface IEmbeddingProvider {
    readonly name: string;
    embed(text: string): Promise<number[]>;
    embedBatch(texts: string[]): Promise<number[][]>;
    readonly dimensions: number;
}
