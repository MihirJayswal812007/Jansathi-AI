"use client";

import { useState, useEffect } from "react";
import { Cloud, Droplets, Wind, Thermometer, Sun } from "lucide-react";

interface WeatherData {
    city: string;
    cityHi: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherDesc: string;
    weatherDescHi: string;
    farmingAdvice: string;
}

interface WeatherWidgetProps {
    onAskQuestion?: (question: string) => void;
}

const QUICK_CITIES = [
    { label: "Delhi", query: "Delhi ka mausam" },
    { label: "Lucknow", query: "Lucknow ka mausam" },
    { label: "Jaipur", query: "Jaipur ka mausam" },
    { label: "Patna", query: "Patna ka mausam" },
    { label: "Bhopal", query: "Bhopal ka mausam" },
    { label: "Varanasi", query: "Varanasi ka mausam" },
];

export default function WeatherWidget({ onAskQuestion }: WeatherWidgetProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedCity, setSelectedCity] = useState("Delhi");

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

    const fetchWeather = async (city: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/weather?city=${encodeURIComponent(city)}`, {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                // API shape: { success, city, forecast: { current: {...}, daily: [...], farmingAdvisoryHi } }
                const forecast = data.forecast;
                if (forecast && forecast.current) {
                    setWeather({
                        city: forecast.city || data.city || city,
                        cityHi: forecast.cityHi || "",
                        temperature: forecast.current.temperature,
                        humidity: forecast.current.humidity,
                        windSpeed: forecast.current.windSpeed,
                        weatherDesc: forecast.current.weatherDesc,
                        weatherDescHi: forecast.current.weatherDescHi,
                        farmingAdvice: forecast.farmingAdvisoryHi || "",
                    });
                }
            }
        } catch {
            // Silently fail — user can still ask via chat
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather(selectedCity);
    }, [selectedCity]);

    return (
        <div className="weather-widget">
            <div className="section-header">
                <Cloud size={20} />
                <h3>🌤️ Mausam</h3>
            </div>

            {/* City chips */}
            <div className="city-chips">
                {QUICK_CITIES.map((c) => (
                    <button
                        key={c.label}
                        className={`city-chip ${selectedCity === c.label ? "active" : ""}`}
                        onClick={() => setSelectedCity(c.label)}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {/* Weather display */}
            {loading ? (
                <div className="loading-state">Loading...</div>
            ) : weather ? (
                <div className="weather-card">
                    <div className="weather-main">
                        <div className="temp-display">
                            <Thermometer size={20} />
                            <span className="temp">{weather.temperature}°C</span>
                        </div>
                        <span className="weather-desc">{weather.weatherDescHi}</span>
                    </div>
                    <div className="weather-details">
                        <div className="detail">
                            <Droplets size={14} />
                            <span>Nami: {weather.humidity}%</span>
                        </div>
                        <div className="detail">
                            <Wind size={14} />
                            <span>Hawa: {weather.windSpeed} km/h</span>
                        </div>
                    </div>
                    {weather.farmingAdvice && (
                        <div className="farming-advice">
                            <Sun size={14} />
                            <span>{weather.farmingAdvice.slice(0, 150)}...</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="empty-state">
                    <p>Mausam data load nahi hua</p>
                    <button
                        className="ask-btn"
                        onClick={() => onAskQuestion?.(`${selectedCity} ka mausam kaisa hai?`)}
                    >
                        Chat mein poochein →
                    </button>
                </div>
            )}

            <style jsx>{`
                .weather-widget { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .section-header { display: flex; align-items: center; gap: 8px; color: #34D399; }
                .section-header h3 { font-size: 16px; font-weight: 600; margin: 0; color: #F1F5F9; }
                .city-chips { display: flex; gap: 6px; flex-wrap: wrap; }
                .city-chip {
                    padding: 6px 12px; border-radius: 8px; border: 1px solid #334155;
                    background: #1E293B; color: #94A3B8; font-size: 12px;
                    cursor: pointer; transition: all 0.2s;
                }
                .city-chip:hover { border-color: #059669; color: #34D399; }
                .city-chip.active {
                    background: linear-gradient(135deg, #059669, #34D399);
                    color: white; border-color: transparent;
                }
                .weather-card {
                    background: #1E293B; border: 1px solid #334155;
                    border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px;
                }
                .weather-main { display: flex; align-items: center; justify-content: space-between; }
                .temp-display { display: flex; align-items: center; gap: 8px; color: #34D399; }
                .temp { font-size: 28px; font-weight: 700; color: #F1F5F9; }
                .weather-desc { color: #94A3B8; font-size: 14px; }
                .weather-details { display: flex; gap: 16px; }
                .detail { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #94A3B8; }
                .farming-advice {
                    display: flex; gap: 8px; padding: 10px; background: rgba(5, 150, 105, 0.08);
                    border-radius: 8px; font-size: 12px; color: #34D399; align-items: start;
                }
                .loading-state { text-align: center; color: #64748B; padding: 24px; font-size: 13px; }
                .empty-state { text-align: center; color: #64748B; padding: 16px; }
                .empty-state p { margin: 0 0 8px; font-size: 13px; }
                .ask-btn {
                    padding: 8px 16px; background: #059669; color: white;
                    border: none; border-radius: 8px; font-size: 13px; cursor: pointer;
                }
            `}</style>
        </div>
    );
}
