// ===== JanSathi AI — Weather Service (Open-Meteo) =====
// Fetches 7-day forecast from Open-Meteo. No API key required.
// Includes farming-specific weather advisories in Hindi.

import logger from "../utils/logger";

// ── Indian City Geocoder ────────────────────────────────────
// Built-in coords for common Indian cities/districts. No external geocoding API needed.
const CITY_COORDS: Record<string, { lat: number; lng: number; nameHi: string }> = {
    delhi: { lat: 28.6139, lng: 77.2090, nameHi: "दिल्ली" },
    mumbai: { lat: 19.0760, lng: 72.8777, nameHi: "मुंबई" },
    kolkata: { lat: 22.5726, lng: 88.3639, nameHi: "कोलकाता" },
    chennai: { lat: 13.0827, lng: 80.2707, nameHi: "चेन्नई" },
    bangalore: { lat: 12.9716, lng: 77.5946, nameHi: "बेंगलुरु" },
    bengaluru: { lat: 12.9716, lng: 77.5946, nameHi: "बेंगलुरु" },
    hyderabad: { lat: 17.3850, lng: 78.4867, nameHi: "हैदराबाद" },
    lucknow: { lat: 26.8467, lng: 80.9462, nameHi: "लखनऊ" },
    jaipur: { lat: 26.9124, lng: 75.7873, nameHi: "जयपुर" },
    patna: { lat: 25.6093, lng: 85.1376, nameHi: "पटना" },
    bhopal: { lat: 23.2599, lng: 77.4126, nameHi: "भोपाल" },
    indore: { lat: 22.7196, lng: 75.8577, nameHi: "इंदौर" },
    ahmedabad: { lat: 23.0225, lng: 72.5714, nameHi: "अहमदाबाद" },
    pune: { lat: 18.5204, lng: 73.8567, nameHi: "पुणे" },
    nagpur: { lat: 21.1458, lng: 79.0882, nameHi: "नागपुर" },
    varanasi: { lat: 25.3176, lng: 83.0068, nameHi: "वाराणसी" },
    agra: { lat: 27.1767, lng: 78.0081, nameHi: "आगरा" },
    kanpur: { lat: 26.4499, lng: 80.3319, nameHi: "कानपुर" },
    chandigarh: { lat: 30.7333, lng: 76.7794, nameHi: "चंडीगढ़" },
    amritsar: { lat: 31.6340, lng: 74.8723, nameHi: "अमृतसर" },
    raipur: { lat: 21.2514, lng: 81.6296, nameHi: "रायपुर" },
    ranchi: { lat: 23.3441, lng: 85.3096, nameHi: "रांची" },
    dehradun: { lat: 30.3165, lng: 78.0322, nameHi: "देहरादून" },
    shimla: { lat: 31.1048, lng: 77.1734, nameHi: "शिमला" },
    guwahati: { lat: 26.1445, lng: 91.7362, nameHi: "गुवाहाटी" },
    bhubaneswar: { lat: 20.2961, lng: 85.8245, nameHi: "भुवनेश्वर" },
    jodhpur: { lat: 26.2389, lng: 73.0243, nameHi: "जोधपुर" },
    bikaner: { lat: 28.0229, lng: 73.3119, nameHi: "बीकानेर" },
    kota: { lat: 25.2138, lng: 75.8648, nameHi: "कोटा" },
    hapur: { lat: 28.7307, lng: 77.7759, nameHi: "हापुड़" },
    karnal: { lat: 29.6857, lng: 76.9905, nameHi: "करनाल" },
    muzaffarnagar: { lat: 29.4727, lng: 77.7085, nameHi: "मुजफ्फरनगर" },
    sirsa: { lat: 29.5349, lng: 75.0286, nameHi: "सिरसा" },
    rajkot: { lat: 22.3039, lng: 70.8022, nameHi: "राजकोट" },
    latur: { lat: 18.3968, lng: 76.5604, nameHi: "लातूर" },
    guntur: { lat: 16.3067, lng: 80.4365, nameHi: "गुंटूर" },
    hubli: { lat: 15.3647, lng: 75.1240, nameHi: "हुबली" },
    erode: { lat: 11.3410, lng: 77.7172, nameHi: "इरोड" },
    kolar: { lat: 13.1360, lng: 78.1290, nameHi: "कोलार" },
    davangere: { lat: 14.4644, lng: 75.9218, nameHi: "दावणगेरे" },
};

// Hindi city name aliases
const CITY_ALIASES: Record<string, string> = {
    "दिल्ली": "delhi", "मुंबई": "mumbai", "कोलकाता": "kolkata",
    "चेन्नई": "chennai", "बेंगलुरु": "bangalore", "हैदराबाद": "hyderabad",
    "लखनऊ": "lucknow", "जयपुर": "jaipur", "पटना": "patna",
    "भोपाल": "bhopal", "इंदौर": "indore", "अहमदाबाद": "ahmedabad",
    "पुणे": "pune", "नागपुर": "nagpur", "वाराणसी": "varanasi",
    "आगरा": "agra", "कानपुर": "kanpur",
};

// ── Types ───────────────────────────────────────────────────
export interface WeatherForecast {
    city: string;
    cityHi: string;
    lat: number;
    lng: number;
    current: {
        temperature: number;
        humidity: number;
        windSpeed: number;
        weatherCode: number;
        weatherDesc: string;
        weatherDescHi: string;
    };
    daily: Array<{
        date: string;
        tempMax: number;
        tempMin: number;
        rainProbability: number;
        rainMm: number;
        weatherCode: number;
        weatherDesc: string;
        weatherDescHi: string;
    }>;
    farmingAdvisory: string;
    farmingAdvisoryHi: string;
}

// ── WMO Weather Code Descriptions ───────────────────────────
function weatherCodeToDesc(code: number): { en: string; hi: string } {
    const descriptions: Record<number, { en: string; hi: string }> = {
        0: { en: "Clear sky", hi: "साफ आसमान" },
        1: { en: "Mainly clear", hi: "ज़्यादातर साफ" },
        2: { en: "Partly cloudy", hi: "आंशिक बादल" },
        3: { en: "Overcast", hi: "पूरा बादल" },
        45: { en: "Foggy", hi: "कोहरा" },
        48: { en: "Depositing rime fog", hi: "घना कोहरा" },
        51: { en: "Light drizzle", hi: "हल्की बूंदाबांदी" },
        53: { en: "Moderate drizzle", hi: "बूंदाबांदी" },
        55: { en: "Dense drizzle", hi: "तेज़ बूंदाबांदी" },
        61: { en: "Slight rain", hi: "हल्की बारिश" },
        63: { en: "Moderate rain", hi: "बारिश" },
        65: { en: "Heavy rain", hi: "तेज़ बारिश" },
        71: { en: "Slight snowfall", hi: "हल्की बर्फबारी" },
        73: { en: "Moderate snowfall", hi: "बर्फबारी" },
        75: { en: "Heavy snowfall", hi: "तेज़ बर्फबारी" },
        80: { en: "Slight rain showers", hi: "हल्की बारिश की बौछार" },
        81: { en: "Moderate rain showers", hi: "बारिश की बौछार" },
        82: { en: "Violent rain showers", hi: "मूसलाधार बारिश" },
        95: { en: "Thunderstorm", hi: "आंधी-तूफान" },
        96: { en: "Thunderstorm with hail", hi: "ओलावृष्टि के साथ तूफान" },
        99: { en: "Thunderstorm with heavy hail", hi: "भारी ओलावृष्टि" },
    };
    return descriptions[code] || { en: "Unknown", hi: "अज्ञात" };
}

// ── Farming Advisory Generator ──────────────────────────────
function generateFarmingAdvisory(daily: WeatherForecast["daily"]): { en: string; hi: string } {
    const hasRain = daily.some((d) => d.rainProbability > 50);
    const hasHeavyRain = daily.some((d) => d.rainMm > 20);
    const hasHeat = daily.some((d) => d.tempMax > 40);
    const hasCold = daily.some((d) => d.tempMin < 5);
    const hasFrost = daily.some((d) => d.tempMin < 2);

    const advisories: string[] = [];
    const advisoriesHi: string[] = [];

    if (hasHeavyRain) {
        advisories.push("⚠️ Heavy rain expected — delay pesticide/fertilizer spray. Ensure drainage in fields.");
        advisoriesHi.push("⚠️ भारी बारिश की संभावना — कीटनाशक/उर्वरक छिड़काव को टालें। खेत में जल निकासी सुनिश्चित करें।");
    } else if (hasRain) {
        advisories.push("🌧️ Rain expected — avoid spraying chemicals. Good time for sowing if soil is prepared.");
        advisoriesHi.push("🌧️ बारिश की संभावना — रासायनिक छिड़काव न करें। अगर मिट्टी तैयार है तो बुवाई का अच्छा समय है।");
    }

    if (hasHeat) {
        advisories.push("🔥 High temperature alert — irrigate crops in evening. Use mulching to retain moisture.");
        advisoriesHi.push("🔥 तेज़ गर्मी की चेतावनी — शाम को सिंचाई करें। नमी बनाए रखने के लिए पलवार (मल्चिंग) का उपयोग करें।");
    }

    if (hasFrost) {
        advisories.push("❄️ Frost warning — cover nursery plants. Light irrigation in evening can protect crops.");
        advisoriesHi.push("❄️ पाला चेतावनी — नर्सरी पौधों को ढकें। शाम को हल्की सिंचाई फसल की रक्षा कर सकती है।");
    } else if (hasCold) {
        advisories.push("🥶 Cold weather — protect young crops. Avoid irrigation in early morning.");
        advisoriesHi.push("🥶 ठंड का मौसम — छोटी फसलों को बचाएं। सुबह जल्दी सिंचाई न करें।");
    }

    if (advisories.length === 0) {
        advisories.push("✅ Weather looks favorable for farming activities. Normal operations can continue.");
        advisoriesHi.push("✅ मौसम खेती के लिए अनुकूल है। सामान्य कार्य जारी रख सकते हैं।");
    }

    return { en: advisories.join("\n"), hi: advisoriesHi.join("\n") };
}

// ── In-memory cache ─────────────────────────────────────────
const cache = new Map<string, { data: WeatherForecast; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ── Public API ──────────────────────────────────────────────

export function resolveCity(query: string): { lat: number; lng: number; city: string; cityHi: string } | null {
    const normalised = query.toLowerCase().trim();

    // Check direct match
    if (CITY_COORDS[normalised]) {
        const c = CITY_COORDS[normalised];
        return { lat: c.lat, lng: c.lng, city: normalised, cityHi: c.nameHi };
    }

    // Check Hindi aliases
    if (CITY_ALIASES[query.trim()]) {
        const key = CITY_ALIASES[query.trim()];
        const c = CITY_COORDS[key];
        return { lat: c.lat, lng: c.lng, city: key, cityHi: c.nameHi };
    }

    // Fuzzy match — check if query is a substring of any city
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
        if (key.includes(normalised) || coords.nameHi.includes(query.trim())) {
            return { lat: coords.lat, lng: coords.lng, city: key, cityHi: coords.nameHi };
        }
    }

    return null;
}

export async function getWeatherForecast(
    lat: number,
    lng: number,
    city: string = "unknown",
    cityHi: string = "अज्ञात"
): Promise<WeatherForecast> {
    // Check cache
    const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        logger.debug("weather.cache.hit", { city, cacheKey });
        return cached.data;
    }

    // Fetch from Open-Meteo (no API key needed!)
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lng));
    url.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code");
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code");
    url.searchParams.set("timezone", "Asia/Kolkata");
    url.searchParams.set("forecast_days", "7");

    logger.info("weather.fetch", { city, lat, lng });

    const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
        throw new Error(`Open-Meteo returned ${response.status}: ${response.statusText}`);
    }

    const data: any = await response.json();

    // Parse daily forecast
    const daily: WeatherForecast["daily"] = [];
    for (let i = 0; i < (data.daily?.time?.length || 0); i++) {
        const code = data.daily.weather_code[i] || 0;
        const desc = weatherCodeToDesc(code);
        daily.push({
            date: data.daily.time[i],
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
            rainProbability: data.daily.precipitation_probability_max[i] || 0,
            rainMm: Math.round(data.daily.precipitation_sum[i] * 10) / 10,
            weatherCode: code,
            weatherDesc: desc.en,
            weatherDescHi: desc.hi,
        });
    }

    const currentCode = data.current?.weather_code || 0;
    const currentDesc = weatherCodeToDesc(currentCode);
    const advisory = generateFarmingAdvisory(daily);

    const forecast: WeatherForecast = {
        city,
        cityHi,
        lat,
        lng,
        current: {
            temperature: Math.round(data.current?.temperature_2m || 0),
            humidity: Math.round(data.current?.relative_humidity_2m || 0),
            windSpeed: Math.round(data.current?.wind_speed_10m || 0),
            weatherCode: currentCode,
            weatherDesc: currentDesc.en,
            weatherDescHi: currentDesc.hi,
        },
        daily,
        farmingAdvisory: advisory.en,
        farmingAdvisoryHi: advisory.hi,
    };

    // Cache the result
    cache.set(cacheKey, { data: forecast, expiresAt: Date.now() + CACHE_TTL_MS });

    return forecast;
}
