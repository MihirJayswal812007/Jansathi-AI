// ===== JanSathi AI — Interactive MCQ Quiz Card =====
// Glassmorphic, framer-motion animated quiz component

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface QuizData {
    type: "quiz";
    title: string;
    questions: QuizQuestion[];
}

interface QuizCardProps {
    data: QuizData;
    primaryColor?: string;
}

export default function QuizCard({ data, primaryColor = "#3B82F6" }: QuizCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const question = data.questions[currentIndex];
    const totalQuestions = data.questions.length;

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;

        setSelectedOption(index);
        setIsAnswered(true);

        if (index === question.correctIndex) {
            setScore((s) => s + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((i) => i + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setIsFinished(false);
    };

    if (isFinished) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md rounded-2xl overflow-hidden mt-2 mb-4"
                style={{
                    background: "rgba(22, 22, 44, 0.7)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid color-mix(in srgb, ${primaryColor} 30%, transparent)`,
                    boxShadow: `0 8px 32px color-mix(in srgb, ${primaryColor} 10%, transparent)`,
                }}
            >
                <div className="p-6 flex flex-col items-center text-center">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ background: `color-mix(in srgb, ${primaryColor} 20%, transparent)` }}
                    >
                        <span className="material-symbols-outlined text-4xl" style={{ color: primaryColor }}>
                            emoji_events
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Quiz Completed!</h3>
                    <p className="text-gray-300 mb-6">
                        You scored <span className="text-white font-bold text-lg">{score}</span> out of {totalQuestions}
                    </p>
                    <button
                        onClick={handleRestart}
                        className="px-6 py-2.5 rounded-xl font-medium text-white transition-all hover:scale-105 active:scale-95"
                        style={{ background: primaryColor }}
                    >
                        Try Again
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl overflow-hidden mt-2 mb-4"
            style={{
                background: "rgba(22, 22, 44, 0.5)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
        >
            {/* Header / Progress */}
            <div
                className="px-5 py-4 border-b flex justify-between items-center"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
                <h4 className="font-semibold text-white/90 truncate mr-4">
                    {data.title || "Quiz"}
                </h4>
                <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-white/70 whitespace-nowrap">
                    <span>{currentIndex + 1} of {totalQuestions}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/5">
                <motion.div
                    className="h-full"
                    style={{ background: primaryColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>

            <div className="p-5">
                {/* Question Text */}
                <h3 className="text-[1.05rem] leading-relaxed text-white font-medium mb-5">
                    {question.question}
                </h3>

                {/* Options List */}
                <div className="flex flex-col gap-2.5">
                    <AnimatePresence mode="wait">
                        {question.options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            const isCorrect = index === question.correctIndex;

                            let optionBg = "rgba(255,255,255,0.04)";
                            let optionBorder = "rgba(255,255,255,0.06)";
                            let icon = "radio_button_unchecked";
                            let iconColor = "rgba(255,255,255,0.4)";

                            if (isAnswered) {
                                if (isCorrect) {
                                    optionBg = "rgba(16, 185, 129, 0.15)";
                                    optionBorder = "rgba(16, 185, 129, 0.4)";
                                    icon = "check_circle";
                                    iconColor = "#10B981";
                                } else if (isSelected) {
                                    optionBg = "rgba(239, 68, 68, 0.15)";
                                    optionBorder = "rgba(239, 68, 68, 0.4)";
                                    icon = "cancel";
                                    iconColor = "#EF4444";
                                }
                            } else if (isSelected) {
                                optionBg = `color-mix(in srgb, ${primaryColor} 15%, transparent)`;
                                optionBorder = primaryColor;
                                icon = "radio_button_checked";
                                iconColor = primaryColor;
                            }

                            return (
                                <motion.button
                                    key={`q${currentIndex}-opt${index}`}
                                    onClick={() => handleOptionSelect(index)}
                                    disabled={isAnswered}
                                    whileHover={!isAnswered ? { scale: 1.01, backgroundColor: "rgba(255,255,255,0.08)" } : {}}
                                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                    className="w-full flex items-start gap-3 p-3.5 rounded-xl transition-colors text-left"
                                    style={{
                                        background: optionBg,
                                        border: `1px solid ${optionBorder}`,
                                    }}
                                >
                                    <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ color: iconColor, fontSize: "20px" }}>
                                        {icon}
                                    </span>
                                    <span className={`text-sm ${isAnswered && (isCorrect || isSelected) ? "text-white" : "text-gray-300"}`}>
                                        {option}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Explanation & Next Button Container */}
                <AnimatePresence>
                    {isAnswered && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="material-symbols-outlined text-[18px]" style={{ color: primaryColor }}>
                                        lightbulb
                                    </span>
                                    <span className="text-sm font-bold text-white">Explanation</span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    {question.explanation}
                                </p>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full py-3 rounded-xl font-medium text-white transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                                style={{ background: primaryColor }}
                            >
                                <span>{currentIndex < totalQuestions - 1 ? "Next Question" : "See Results"}</span>
                                <span className="material-symbols-outlined text-[20px]">
                                    arrow_forward
                                </span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
