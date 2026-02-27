"use client";

import { useState, useEffect, useCallback } from "react";
import {
    fetchDashboardStats,
    fetchTrends,
    type DashboardData,
    type TrendData,
} from "@/lib/apiClient";

interface UseDashboardReturn {
    stats: DashboardData | null;
    trends: TrendData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useDashboard(trendDays = 7): UseDashboardReturn {
    const [stats, setStats] = useState<DashboardData | null>(null);
    const [trends, setTrends] = useState<TrendData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [statsData, trendsData] = await Promise.all([
                fetchDashboardStats(),
                fetchTrends(trendDays),
            ]);
            setStats(statsData);
            setTrends(trendsData);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to load dashboard data";
            // Check for auth expiry
            if (msg.includes("401")) {
                window.location.href = "/login?expired=1";
                return;
            }
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [trendDays]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { stats, trends, isLoading, error, refetch: fetchData };
}

export default useDashboard;
