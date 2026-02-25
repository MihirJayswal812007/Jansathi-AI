// ===== JanSathi AI — Express Backend Entry Point =====

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import logger from "./utils/logger";
import { APP } from "./config/env";

// ── Route Imports ───────────────────────────────────────────
import { chatRouter } from "./routes/chat";
import { weatherRouter } from "./routes/weather";
import { mandiRouter } from "./routes/mandi";
import { analyticsRouter } from "./routes/analytics";
import { authRouter } from "./routes/auth";
import { dashboardRouter } from "./routes/dashboard";

// ── Background Jobs ─────────────────────────────────────────
import { startSessionCleanup } from "./jobs/sessionCleanup";

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// ── Global Middleware ───────────────────────────────────────
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

// ── Health Check ────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        service: APP.name,
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});

// ── Route Mounting ──────────────────────────────────────────
app.use("/api/chat", chatRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/mandi", mandiRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);

// ── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: "NOT_FOUND", message: "Route not found" });
});

// ── Global Error Handler ────────────────────────────────────
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

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
    logger.info("server.started", { port: PORT, env: APP.env });
    console.log(`\n  🚀 JanSathi AI Backend running on http://localhost:${PORT}\n`);

    // Start background jobs
    startSessionCleanup();
});
