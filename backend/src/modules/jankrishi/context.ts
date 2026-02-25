// ===== JanKrishi Module — Agriculture Context Builder =====

import { CROPS_DATA } from "../../knowledge-bases/crops";
import { resolveCity, getWeatherForecast } from "../../services/weather";
import { buildMandiContext } from "../../services/mandi";
import logger from "../../utils/logger";

const WEATHER_KEYWORDS = [
    "mausam", "weather", "barish", "rain", "garmi", "thand", "sardi",
    "dhoop", "aandhi", "toofan", "मौसम", "बारिश", "गर्मी", "ठंड",
    "सर्दी", "धूप", "आंधी", "तूफान",
];

const PRICE_KEYWORDS = [
    "bhav", "price", "rate", "daam", "mandi", "bazar",
    "भाव", "दाम", "कीमत", "मंडी", "बाजार", "bech", "bikri",
];

export async function buildJankrishiContext(message: string): Promise<string> {
    const lowerMsg = message.toLowerCase();
    const contextParts: string[] = [];

    // ── Weather context ─────────────────────────────────────
    const hasWeatherQuery = WEATHER_KEYWORDS.some((kw) => lowerMsg.includes(kw));
    if (hasWeatherQuery) {
        try {
            let resolved = null;
            for (const word of message.split(/\s+/)) {
                resolved = resolveCity(word);
                if (resolved) break;
            }
            if (!resolved) resolved = resolveCity("delhi");
            if (resolved) {
                const forecast = await getWeatherForecast(resolved.lat, resolved.lng, resolved.city, resolved.cityHi);
                contextParts.push(
                    `🌤️ LIVE WEATHER — ${forecast.cityHi} (${forecast.city})`,
                    `Current: ${forecast.current.temperature}°C, ${forecast.current.weatherDescHi}, Humidity: ${forecast.current.humidity}%`,
                    ``, `7-Day Forecast:`,
                    ...forecast.daily.map((d) => `  ${d.date}: ${d.tempMin}°-${d.tempMax}°C, ${d.weatherDescHi}, Rain: ${d.rainProbability}% (${d.rainMm}mm)`),
                    ``, `🌾 Farming Advisory:`, forecast.farmingAdvisoryHi, ``
                );
            }
        } catch (err) {
            logger.warn("module.jankrishi.weather_failed", { error: err instanceof Error ? err.message : String(err) });
        }
    }

    // ── Mandi prices context ────────────────────────────────
    const hasPriceQuery = PRICE_KEYWORDS.some((kw) => lowerMsg.includes(kw));
    if (hasPriceQuery) {
        const words = message.split(/\s+/);
        for (const word of words) {
            const mandiCtx = buildMandiContext(word);
            if (mandiCtx) { contextParts.push(mandiCtx, ""); break; }
        }
    }

    // ── Crop disease context ────────────────────────────────
    const relevantCrops = CROPS_DATA.filter(
        (crop) =>
            lowerMsg.includes(crop.name.toLowerCase()) ||
            lowerMsg.includes(crop.nameHi) ||
            lowerMsg.includes(crop.id) ||
            crop.diseases.some(
                (d) =>
                    d.symptoms.some((s) => lowerMsg.includes(s.toLowerCase())) ||
                    lowerMsg.includes(d.nameHi)
            )
    );

    if (relevantCrops.length > 0) {
        contextParts.push(
            ...relevantCrops.map(
                (crop) =>
                    `Crop: ${crop.name} (${crop.nameHi})\nSeason: ${crop.season}\nStates: ${crop.states.join(", ")}\nDiseases:\n${crop.diseases
                        .map(
                            (d) =>
                                `  - ${d.name} (${d.nameHi}): Symptoms: ${d.symptoms.join(", ")}. Chemical: ${d.treatment.chemical}. Organic: ${d.treatment.organic}. Urgency: ${d.urgency}. Prevention: ${d.prevention}`
                        )
                        .join("\n")}`
            )
        );
    } else if (contextParts.length === 0) {
        // Fallback: list all crops
        contextParts.push(
            ...CROPS_DATA.map((c) => `• ${c.name} (${c.nameHi}) — ${c.season}, diseases: ${c.diseases.map((d) => d.nameHi).join(", ")}`)
        );
    }

    return contextParts.join("\n");
}
