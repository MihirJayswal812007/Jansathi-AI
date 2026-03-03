// ===== JanSathi AI — Prisma Client Singleton =====
// Handles Neon serverless idle connection pruning by
// disconnecting/reconnecting when connections go stale.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

// Neon closes idle connections after ~5 min.
// This extension catches stale-connection errors and retries once.
const prismaWithRetry = prisma.$extends({
    query: {
        async $allOperations({ operation, model, args, query }) {
            try {
                return await query(args);
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : String(error);
                if (
                    msg.includes("Server has closed the connection") ||
                    msg.includes("Connection pool timeout") ||
                    msg.includes("kind: Closed") ||
                    msg.includes("Can't reach database server")
                ) {
                    // Reconnect and retry once
                    await prisma.$disconnect();
                    await prisma.$connect();
                    return query(args);
                }
                throw error;
            }
        },
    },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prismaWithRetry;
