// ===== JanSathi AI — Weather Route (Express) =====

import { Router, Request, Response } from "express";
import { getWeatherForecast, resolveCity } from "../services/weather";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
import { sendError } from "../middleware/errorHandler";
import logger from "../utils/logger";

export const weatherRouter = Router();

weatherRouter.use(rateLimitMiddleware);

weatherRouter.get("/", async (req: Request, res: Response) => {
    const requestId = logger.generateRequestId();
    const { city, lat, lng } = req.query;

    try {
        let latitude: number;
        let longitude: number;
        let cityName: string;
        let cityHi: string = "";

        if (city && typeof city === "string") {
            const geo = resolveCity(city);
            if (!geo) {
                return sendError(res, "INVALID_INPUT", `Unknown city: ${city}`, requestId);
            }
            latitude = geo.lat;
            longitude = geo.lng;
            cityName = geo.city;
            cityHi = geo.cityHi;
        } else if (lat && lng) {
            latitude = parseFloat(lat as string);
            longitude = parseFloat(lng as string);
            cityName = `${latitude},${longitude}`;
            if (isNaN(latitude) || isNaN(longitude)) {
                return sendError(res, "INVALID_INPUT", "Invalid lat/lng", requestId);
            }
        } else {
            return sendError(res, "INVALID_INPUT", "Provide city or lat+lng", requestId);
        }

        const forecast = await getWeatherForecast(latitude, longitude, cityName, cityHi);

        logger.info("api.weather.served", { requestId, city: cityName });
        res.json({ success: true, city: cityName, forecast, requestId });
    } catch (error) {
        logger.error("api.weather.error", {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        sendError(res, "INTERNAL_ERROR", undefined, requestId);
    }
});
