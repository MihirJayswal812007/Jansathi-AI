// ===== JanSathi AI — Graceful Shutdown Handler =====
// Ensures clean disconnection of DB, HTTP server, and background jobs
// on SIGTERM (container orchestrator) and SIGINT (Ctrl+C).

import { Server } from "http";
import prisma from "../models/prisma";
import logger from "./logger";

let isShuttingDown = false;

export function registerShutdownHandlers(server: Server): void {
    const shutdown = async (signal: string) => {
        if (isShuttingDown) return; // Prevent double-shutdown
        isShuttingDown = true;

        logger.info("server.shutdown.start", { signal });
        console.log(`\n  ⏳ Graceful shutdown initiated (${signal})...\n`);

        // 1. Stop accepting new connections
        server.close((err) => {
            if (err) {
                logger.error("server.shutdown.http_close_error", { error: err.message });
            } else {
                logger.info("server.shutdown.http_closed");
            }
        });

        // 2. Disconnect Prisma (close DB connection pool)
        try {
            await prisma.$disconnect();
            logger.info("server.shutdown.db_disconnected");
        } catch (err) {
            logger.error("server.shutdown.db_error", {
                error: err instanceof Error ? err.message : String(err),
            });
        }

        // 3. Exit
        logger.info("server.shutdown.complete", { signal });
        console.log("  ✅ Shutdown complete.\n");
        process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}
