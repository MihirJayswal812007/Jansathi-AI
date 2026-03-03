"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface BlurFadeProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    yOffset?: number;
    inView?: boolean;
    blur?: string;
}

export function BlurFade({
    children,
    className,
    delay = 0,
    duration = 0.4,
    yOffset = 6,
    inView = true,
    blur = "6px",
}: BlurFadeProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inViewResult = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
    const isInView = !inView || inViewResult;

    return (
        <motion.div
            ref={ref}
            initial={{ y: yOffset, opacity: 0, filter: `blur(${blur})` }}
            animate={isInView ? { y: 0, opacity: 1, filter: "blur(0px)" } : undefined}
            transition={{
                delay: 0.04 + delay,
                duration,
                ease: "easeOut",
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default BlurFade;
