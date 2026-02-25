// ===== JanKrishi Module — Tool Definitions =====
// Agriculture tools for weather, mandi prices, and crop disease diagnosis.

import type { ToolDefinition } from "../../providers/types";
import { resolveCity, getWeatherForecast } from "../../services/weather";
import { buildMandiContext } from "../../services/mandi";
import { CROPS_DATA } from "../../knowledge-bases/crops";

export const jankrishiTools: ToolDefinition[] = [
    {
        name: "get_weather_forecast",
        description: "Get current weather and 7-day forecast for a specific city/location. Includes farming advisory.",
        parameters: {
            city: { type: "string", description: "City or location name in Hindi or English", required: true },
        },
        handler: async (args) => {
            const cityName = String(args.city || "delhi");
            const resolved = resolveCity(cityName);
            if (!resolved) return `City "${cityName}" not found. Try a major city name.`;

            const forecast = await getWeatherForecast(resolved.lat, resolved.lng, resolved.city, resolved.cityHi);
            const daily = forecast.daily
                .slice(0, 5)
                .map((d) => `  ${d.date}: ${d.tempMin}°-${d.tempMax}°C, ${d.weatherDescHi}, Rain: ${d.rainProbability}%`)
                .join("\n");

            return `🌤️ ${forecast.cityHi} (${forecast.city})\nNow: ${forecast.current.temperature}°C, ${forecast.current.weatherDescHi}\nHumidity: ${forecast.current.humidity}%\n\n5-Day:\n${daily}\n\n🌾 Advisory: ${forecast.farmingAdvisoryHi}`;
        },
    },
    {
        name: "get_mandi_prices",
        description: "Get current market (mandi) prices for a specific crop or commodity.",
        parameters: {
            crop: { type: "string", description: "Crop or commodity name (e.g., wheat, rice, onion)", required: true },
        },
        handler: async (args) => {
            const crop = String(args.crop || "");
            const context = buildMandiContext(crop);
            return context || `No mandi price data found for "${crop}".`;
        },
    },
    {
        name: "diagnose_crop_disease",
        description: "Diagnose crop diseases based on symptoms and provide treatment recommendations.",
        parameters: {
            crop: { type: "string", description: "Crop name", required: true },
            symptoms: { type: "string", description: "Observed symptoms in the crop" },
        },
        handler: async (args) => {
            const cropName = String(args.crop || "").toLowerCase();
            const symptoms = String(args.symptoms || "").toLowerCase();

            const crop = CROPS_DATA.find(
                (c) => c.name.toLowerCase() === cropName || c.nameHi === cropName || c.id === cropName
            );
            if (!crop) return `Crop "${args.crop}" not found in database.`;

            const matchingDiseases = crop.diseases.filter(
                (d) => d.symptoms.some((s) => symptoms.includes(s.toLowerCase())) || !symptoms
            );

            if (matchingDiseases.length === 0) return `No matching diseases found for ${crop.name} with those symptoms.`;

            return matchingDiseases
                .map(
                    (d) =>
                        `⚠️ ${d.name} (${d.nameHi}) [${d.urgency}]\nSymptoms: ${d.symptoms.join(", ")}\n💊 Chemical: ${d.treatment.chemical}\n🌿 Organic: ${d.treatment.organic}\n🛡️ Prevention: ${d.prevention}`
                )
                .join("\n\n");
        },
    },
];
