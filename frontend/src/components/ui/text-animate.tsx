"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

interface TextAnimateProps {
    children: string;
    className?: string;
    type?: "word" | "letter";
    delay?: number;
}

export function TextAnimate({
    children,
    className = "",
    type = "word",
    delay = 0,
}: TextAnimateProps) {
    const items = type === "word" ? children.split(" ") : children.split("");

    return (
        <span className={className}>
            <AnimatePresence>
                {items.map((item, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                            delay: delay + i * 0.04,
                            duration: 0.3,
                            ease: "easeOut",
                        }}
                        style={{ display: "inline-block", whiteSpace: "pre" }}
                    >
                        {item}
                        {type === "word" ? " " : ""}
                    </motion.span>
                ))}
            </AnimatePresence>
        </span>
    );
}

interface WordRotateProps {
    words: string[];
    className?: string;
    duration?: number;
}

export function WordRotate({
    words,
    className = "",
    duration = 3000,
}: WordRotateProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, duration);
        return () => clearInterval(timer);
    }, [words.length, duration]);

    return (
        <span className={className} style={{ display: "inline-block", position: "relative" }}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={words[index]}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "inline-block" }}
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

export { TextAnimate as default };
