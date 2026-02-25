// ===== JanSathi AI — Mandi Route (Express) =====

import { Router, Request, Response } from "express";
import { searchByCrop, searchByState, searchByMandi, getAvailableCrops } from "../services/mandi";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
import { sendError } from "../middleware/errorHandler";
import logger from "../utils/logger";

export const mandiRouter = Router();

mandiRouter.use(rateLimitMiddleware);

mandiRouter.get("/", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();
    const { crop, state, mandi } = req.query;

    try {
        if (crop && typeof crop === "string") {
            const results = searchByCrop(crop);
            if (!results) {
                return res.json({ success: true, query: { crop }, results: null, message: "Crop not found", requestId });
            }
            logger.info("api.mandi.search", { requestId, type: "crop", query: crop, count: results.entries.length });
            return res.json({ success: true, query: { crop }, results, requestId });
        }

        if (state && typeof state === "string") {
            const results = searchByState(state);
            return res.json({ success: true, query: { state }, results, requestId });
        }

        if (mandi && typeof mandi === "string") {
            const results = searchByMandi(mandi);
            return res.json({ success: true, query: { mandi }, results, requestId });
        }

        // No params — return available crops
        const crops = getAvailableCrops();
        res.json({ success: true, availableCrops: crops, requestId });
    } catch (error) {
        logger.error("api.mandi.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});
