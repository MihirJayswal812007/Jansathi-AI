// ===== JanSathi AI — Activity Chart (7-Day DAU) =====
// CSS bar chart with Framer Motion entrance.

"use client";

import { motion } from "framer-motion";

interface ActivityChartProps {
    dailyActiveUsers: { date: string; count: number }[];
}

export default function ActivityChart({ dailyActiveUsers }: ActivityChartProps) {
    const maxDay = Math.max(...dailyActiveUsers.map((d) => d.count), 1);

    return (
        <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
        >
            <h3 className="dashboard-section-title">
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    trending_up
                </span>
                Daily Active Users
            </h3>
            <div className="dashboard-activity-bars">
                {dailyActiveUsers.map((day, i) => {
                    const height = (day.count / maxDay) * 100;
                    const dateLabel = new Date(day.date).toLocaleDateString("en", {
                        weekday: "short",
                    });
                    const isLast = i === dailyActiveUsers.length - 1;
                    return (
                        <motion.div
                            key={day.date}
                            className="dashboard-activity-col"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.6 + i * 0.06 }}
                            style={{ transformOrigin: "bottom" }}
                        >
                            <span className="dashboard-activity-count">{day.count}</span>
                            <div
                                className={`dashboard-activity-bar${isLast ? " today" : ""}`}
                                style={{ height: `${Math.max(height, 8)}%` }}
                            />
                            <span className="dashboard-activity-label">{dateLabel}</span>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
