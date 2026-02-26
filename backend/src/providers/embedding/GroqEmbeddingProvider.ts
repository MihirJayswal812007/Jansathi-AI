// ===== JanSathi AI — Groq Embedding Provider =====
// Uses Groq API for text embeddings.
// Falls back gracefully on API failure.

import type { IEmbeddingProvider } from "./IEmbeddingProvider";
import logger from "../../utils/logger";

export class GroqEmbeddingProvider implements IEmbeddingProvider {
    readonly name = "groq";
    readonly dimensions: number;
    private apiKey: string;
    private model: string;
    private baseUrl: string;

    constructor(config: {
        apiKey: string;
        model?: string;
        dimensions?: number;
        baseUrl?: string;
    }) {
        this.apiKey = config.apiKey;
        this.model = config.model ?? "text-embedding-3-small";
        this.dimensions = config.dimensions ?? 1536;
        this.baseUrl = config.baseUrl ?? "https://api.openai.com/v1";
    }

    async embed(text: string): Promise<number[]> {
        const result = await this.embedBatch([text]);
        return result[0];
    }

    async embedBatch(texts: string[]): Promise<number[][]> {
        try {
            const response = await fetch(`${this.baseUrl}/embeddings`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: this.model,
                    input: texts,
                    dimensions: this.dimensions,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                logger.error("embedding.api_error", {
                    status: response.status,
                    error: error.slice(0, 200),
                });
                return texts.map(() => []);
            }

            const data = (await response.json()) as {
                data: { embedding: number[]; index: number }[];
            };

            // Sort by index to maintain order
            return data.data
                .sort((a, b) => a.index - b.index)
                .map((d) => d.embedding);
        } catch (error) {
            logger.error("embedding.request_failed", {
                error: error instanceof Error ? error.message : String(error),
            });
            return texts.map(() => []);
        }
    }
}
