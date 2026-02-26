// ===== JanSathi AI — Embedding Cache (LRU + TTL) =====
// In-memory cache to avoid redundant embedding API calls.
// Key = SHA-256 hash of input text. Value = embedding vector.
// Configurable via ENABLE_EMBEDDING_CACHE, EMBEDDING_CACHE_TTL_MS, EMBEDDING_CACHE_MAX_SIZE.

import { createHash } from "crypto";
import type { IEmbeddingProvider } from "../providers/embedding/IEmbeddingProvider";
import logger from "../utils/logger";

interface CacheEntry {
    embedding: number[];
    insertedAt: number;
}

export interface EmbeddingCacheConfig {
    enabled: boolean;
    maxSize: number;        // max entries in cache
    ttlMs: number;          // time-to-live per entry in ms
}

/**
 * LRU + TTL embedding cache that wraps an IEmbeddingProvider.
 * On cache hit: returns cached embedding instantly (0 API calls).
 * On cache miss: calls the underlying provider and caches the result.
 */
export class CachedEmbeddingProvider implements IEmbeddingProvider {
    readonly name: string;
    readonly dimensions: number;

    private cache: Map<string, CacheEntry>;
    private config: EmbeddingCacheConfig;
    private inner: IEmbeddingProvider;

    // Metrics
    private _hits = 0;
    private _misses = 0;

    constructor(inner: IEmbeddingProvider, config: EmbeddingCacheConfig) {
        this.inner = inner;
        this.config = config;
        this.cache = new Map();
        this.name = `cached(${inner.name})`;
        this.dimensions = inner.dimensions;
    }

    /** Hash the input text to create a cache key */
    private hashKey(text: string): string {
        return createHash("sha256").update(text).digest("hex").slice(0, 24);
    }

    /** Check if an entry is expired */
    private isExpired(entry: CacheEntry): boolean {
        return Date.now() - entry.insertedAt > this.config.ttlMs;
    }

    /** Evict expired entries and LRU overflow */
    private evict(): void {
        // Remove expired
        for (const [key, entry] of this.cache) {
            if (this.isExpired(entry)) {
                this.cache.delete(key);
            }
        }

        // LRU eviction: remove oldest entries if over max size
        while (this.cache.size > this.config.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }
    }

    async embed(text: string): Promise<number[]> {
        if (!this.config.enabled) {
            return this.inner.embed(text);
        }

        const key = this.hashKey(text);
        const cached = this.cache.get(key);

        if (cached && !this.isExpired(cached)) {
            this._hits++;
            // Move to end for LRU (delete + re-insert)
            this.cache.delete(key);
            this.cache.set(key, cached);
            return cached.embedding;
        }

        this._misses++;
        const embedding = await this.inner.embed(text);

        if (embedding && embedding.length > 0) {
            this.cache.set(key, { embedding, insertedAt: Date.now() });
            this.evict();
        }

        return embedding;
    }

    async embedBatch(texts: string[]): Promise<number[][]> {
        if (!this.config.enabled) {
            return this.inner.embedBatch(texts);
        }

        // Split into cached and uncached
        const results: (number[] | null)[] = new Array(texts.length).fill(null);
        const uncachedIndices: number[] = [];
        const uncachedTexts: string[] = [];

        for (let i = 0; i < texts.length; i++) {
            const key = this.hashKey(texts[i]);
            const cached = this.cache.get(key);
            if (cached && !this.isExpired(cached)) {
                this._hits++;
                results[i] = cached.embedding;
                this.cache.delete(key);
                this.cache.set(key, cached);
            } else {
                this._misses++;
                uncachedIndices.push(i);
                uncachedTexts.push(texts[i]);
            }
        }

        // Fetch uncached embeddings
        if (uncachedTexts.length > 0) {
            const newEmbeddings = await this.inner.embedBatch(uncachedTexts);
            for (let j = 0; j < uncachedIndices.length; j++) {
                results[uncachedIndices[j]] = newEmbeddings[j];
                if (newEmbeddings[j] && newEmbeddings[j].length > 0) {
                    const key = this.hashKey(uncachedTexts[j]);
                    this.cache.set(key, { embedding: newEmbeddings[j], insertedAt: Date.now() });
                }
            }
            this.evict();
        }

        return results as number[][];
    }

    /** Cache metrics for observability */
    get stats() {
        return {
            hits: this._hits,
            misses: this._misses,
            size: this.cache.size,
            hitRate: this._hits + this._misses > 0
                ? (this._hits / (this._hits + this._misses) * 100).toFixed(1) + "%"
                : "0%",
        };
    }

    /** Clear the cache */
    clear(): void {
        this.cache.clear();
        this._hits = 0;
        this._misses = 0;
    }
}
