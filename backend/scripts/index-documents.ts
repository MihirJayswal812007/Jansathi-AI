// ===== JanSathi AI — Document Indexing Script =====
// CLI tool to ingest documents into the pgvector store for RAG.
//
// Usage:
//   npx tsx scripts/index-documents.ts --module janseva --dir data/janseva/
//   npx tsx scripts/index-documents.ts --module jankrishi --file data/jankrishi/crop-guide.md
//
// Features:
//   - Reads .md and .txt files from a directory or single file
//   - Chunks text by double-newline paragraphs
//   - Generates embeddings via IEmbeddingProvider
//   - Upserts into documents table (idempotent via content hash ID)
//   - Progress logging

import { createHash } from "crypto";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { embeddingProvider } from "../src/providers/embedding";
import { postgresVectorStore } from "../src/retrieval/PostgresVectorStore";

// ── CLI Args ────────────────────────────────────────────────
const args = process.argv.slice(2);
const moduleIdx = args.indexOf("--module");
const dirIdx = args.indexOf("--dir");
const fileIdx = args.indexOf("--file");

const moduleName = moduleIdx >= 0 ? args[moduleIdx + 1] : null;
const dirPath = dirIdx >= 0 ? args[dirIdx + 1] : null;
const filePath = fileIdx >= 0 ? args[fileIdx + 1] : null;

if (!moduleName || (!dirPath && !filePath)) {
    console.error("Usage: npx tsx scripts/index-documents.ts --module <name> --dir <path> | --file <path>");
    process.exit(1);
}

if (!embeddingProvider) {
    console.error("Error: No embedding provider configured. Set EMBEDDING_API_KEY in .env");
    process.exit(1);
}

// ── Helpers ─────────────────────────────────────────────────
function contentHash(module: string, content: string): string {
    return createHash("sha256")
        .update(`${module}:${content}`)
        .digest("hex")
        .slice(0, 32);
}

function chunkText(text: string, maxChunkChars = 2000): string[] {
    // Split by double newline (paragraph boundaries)
    const paragraphs = text.split(/\n{2,}/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;

        if (currentChunk.length + trimmed.length > maxChunkChars && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = trimmed;
        } else {
            currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks.filter((c) => c.length > 50); // Skip tiny chunks
}

function readFiles(dir: string): { path: string; content: string }[] {
    const results: { path: string; content: string }[] = [];

    for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            results.push(...readFiles(fullPath));
        } else if ([".md", ".txt"].includes(extname(entry).toLowerCase())) {
            results.push({
                path: fullPath,
                content: readFileSync(fullPath, "utf-8"),
            });
        }
    }

    return results;
}

// ── Main ────────────────────────────────────────────────────
async function main() {
    console.log(`\n📄 Indexing documents for module: ${moduleName}`);

    // Collect files
    let files: { path: string; content: string }[] = [];

    if (dirPath) {
        files = readFiles(dirPath);
    } else if (filePath) {
        files = [{ path: filePath, content: readFileSync(filePath, "utf-8") }];
    }

    console.log(`  Found ${files.length} files`);

    // Chunk all files
    const allChunks: { content: string; metadata: Record<string, unknown> }[] = [];

    for (const file of files) {
        const chunks = chunkText(file.content);
        for (const chunk of chunks) {
            allChunks.push({
                content: chunk,
                metadata: { source: file.path, charCount: chunk.length },
            });
        }
    }

    console.log(`  Generated ${allChunks.length} chunks`);

    if (!allChunks.length) {
        console.log("  No chunks to index. Done.");
        return;
    }

    // Generate embeddings in batches
    const BATCH_SIZE = 20;
    let indexed = 0;

    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
        const batch = allChunks.slice(i, i + BATCH_SIZE);
        const texts = batch.map((c) => c.content);

        console.log(`  Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allChunks.length / BATCH_SIZE)}...`);

        const embeddings = await embeddingProvider!.embedBatch(texts);

        // Build upsert docs
        const docs = batch.map((chunk, j) => ({
            id: contentHash(moduleName!, chunk.content),
            module: moduleName!,
            content: chunk.content,
            embedding: embeddings[j],
            metadata: chunk.metadata,
        }));

        // Filter out failed embeddings
        const validDocs = docs.filter((d) => d.embedding.length > 0);

        if (validDocs.length > 0) {
            await postgresVectorStore.upsert(validDocs);
            indexed += validDocs.length;
        }

        if (validDocs.length < docs.length) {
            console.warn(`  ⚠️  ${docs.length - validDocs.length} chunks failed embedding`);
        }
    }

    console.log(`\n✅ Indexed ${indexed}/${allChunks.length} chunks for module "${moduleName}"\n`);
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
