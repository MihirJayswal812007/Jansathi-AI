// ===== JanSathi AI — Express Backend Entry Point =====

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import prisma from "./models/prisma";
import logger from "./utils/logger";
import { APP } from "./config/env";
import { registerShutdownHandlers } from "./utils/shutdown";

// ── Route Imports ───────────────────────────────────────────
import { chatRouter } from "./routes/chat";
import { weatherRouter } from "./routes/weather";
import { mandiRouter } from "./routes/mandi";
import { analyticsRouter } from "./routes/analytics";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";
import { userRouter } from "./routes/user";

// ── Background Jobs ─────────────────────────────────────────
import { startSessionCleanup } from "./jobs/sessionCleanup";
import { startDailySnapshotJob } from "./jobs/dailySnapshot";

// ── Sprint 1+2: Orchestration + Observability + Auth ──────
import { registerAllModuleTools } from "./modules";
import { metricsCollector } from "./observability/MetricsCollector";
import { llmProvider } from "./providers/llm";
import { LLM } from "./config/env";

// ── App Factory (testable) ──────────────────────────────────
export function createApp() {
    const app = express();

    // ── Global Middleware ────────────────────────────────────
    app.use(helmet());
    app.use(
        cors({
            origin: APP.allowedOrigins.includes("*")
                ? true
                : APP.allowedOrigins,
            credentials: true,
        })
    );
    app.use(express.json({ limit: "1mb" }));
    app.use(cookieParser());

    // ── Health Check (with DB probe) ────────────────────────
    app.get("/api/health", async (_req, res) => {
        let dbStatus = "ok";
        try {
            await prisma.$queryRaw`SELECT 1`;
        } catch {
            dbStatus = "unreachable";
        }

        const isHealthy = dbStatus === "ok";
        res.status(isHealthy ? 200 : 503).json({
            status: isHealthy ? "ok" : "degraded",
            service: APP.name,
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            db: dbStatus,
            memory: {
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
                heap: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            },
        });
    });

    // ── Route Mounting ──────────────────────────────────────
    app.use("/api/chat", chatRouter);
    app.use("/api/weather", weatherRouter);
    app.use("/api/mandi", mandiRouter);
    app.use("/api/analytics", analyticsRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/user", userRouter);

    // ── 404 Handler ─────────────────────────────────────────
    app.use((_req, res) => {
        res.status(404).json({ error: "NOT_FOUND", message: "Route not found" });
    });

    // ── Global Error Handler ────────────────────────────────
    app.use(
        (
            err: Error,
            _req: express.Request,
            res: express.Response,
            _next: express.NextFunction
        ) => {
            logger.error("server.unhandled_error", {
                error: err.message,
                stack: err.stack,
            });
            res.status(500).json({ error: "INTERNAL_ERROR", message: "An unexpected error occurred" });
        }
    );

    return app;
}

// ── Singleton app instance ──────────────────────────────────
export const app = createApp();

// ── Start Server (only when run directly, not imported by tests) ──
if (require.main === module) {
    const PORT = parseInt(process.env.PORT || "4000", 10);

    const server = app.listen(PORT, async () => {
        logger.info("server.started", { port: PORT, env: APP.env });
        console.log(`\n  🚀 JanSathi AI Backend running on http://localhost:${PORT}\n`);

        // Provider health check — fail-fast if provider is configured but unhealthy
        const health = await llmProvider.healthCheck();
        if (health.healthy) {
            logger.info("provider.health_check.passed", { provider: llmProvider.name, latencyMs: health.latencyMs });
        } else {
            logger.error("provider.health_check.failed", { provider: llmProvider.name, ...health });
            // Fail-fast: exit only if a real API key was configured (not demo mode)
            if (LLM.isAvailable) {
                logger.error("server.fatal", { reason: "LLM provider configured but unreachable. Shutting down." });
                process.exit(1);
            }
        }

        // Start background jobs
        startSessionCleanup();
        startDailySnapshotJob();

        // Register module tools with the orchestration layer
        registerAllModuleTools();

        // Start metrics collection
        metricsCollector.start();
    });

    // Graceful shutdown on SIGTERM/SIGINT
    registerShutdownHandlers(server);
}
