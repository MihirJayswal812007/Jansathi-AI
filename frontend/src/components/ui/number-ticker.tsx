"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface NumberTickerProps {
    value: number;
    direction?: "up" | "down";
    duration?: number;
    delay?: number;
    className?: string;
    decimalPlaces?: number;
    suffix?: string;
    prefix?: string;
}

export function NumberTicker({
    value,
    direction = "up",
    duration = 2000,
    delay = 0,
    className = "",
    decimalPlaces = 0,
    suffix = "",
    prefix = "",
}: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "0px" });
    const [displayValue, setDisplayValue] = useState(direction === "down" ? value : 0);

    useEffect(() => {
        if (!isInView) return;

        const startTime = Date.now();
        const startValue = direction === "down" ? value : 0;
        const endValue = direction === "down" ? 0 : value;

        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime - delay;
                if (elapsed < 0) return;

                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = startValue + (endValue - startValue) * eased;

                setDisplayValue(current);

                if (progress >= 1) {
                    clearInterval(interval);
                    setDisplayValue(endValue);
                }
            }, 16);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timer);
    }, [isInView, value, direction, duration, delay]);

    return (
        <span
            ref={ref}
            className={className}
            aria-label={`${prefix}${value.toFixed(decimalPlaces)}${suffix}`}
        >
            {prefix}
            {displayValue.toFixed(decimalPlaces)}
            {suffix}
        </span>
    );
}

export default NumberTicker;
