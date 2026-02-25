"use client";

import { useState, useCallback } from "react";
import { Brain, CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface QuizQuestion {
    question: string;
    questionHi: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

const SAMPLE_QUIZZES: Record<string, QuizQuestion[]> = {
    science: [
        {
            question: "What do plants need for photosynthesis?",
            questionHi: "Paudhon ko photosynthesis ke liye kya chahiye?",
            options: ["Suraj ki roshni, paani, CO₂", "Sirf paani", "Sirf mitti", "Andhera"],
            correctIndex: 0,
            explanation: "Paudhe suraj ki roshni, paani aur CO₂ se apna bhojan banate hain!",
        },
        {
            question: "How many bones are in the human body?",
            questionHi: "Manav sharir mein kitni haddiyan hoti hain?",
            options: ["106", "206", "306", "506"],
            correctIndex: 1,
            explanation: "Ek vyask manav sharir mein 206 haddiyan hoti hain.",
        },
        {
            question: "Which gas do we breathe in?",
            questionHi: "Hum kaun si gas saans lete hain?",
            options: ["Nitrogen", "Carbon Dioxide", "Oxygen", "Hydrogen"],
            correctIndex: 2,
            explanation: "Hum Oxygen (O₂) saans lete hain aur Carbon Dioxide (CO₂) bahar chhhodte hain.",
        },
    ],
    math: [
        {
            question: "What is 15 × 12?",
            questionHi: "15 × 12 kitna hota hai?",
            options: ["170", "180", "190", "200"],
            correctIndex: 1,
            explanation: "15 × 12 = 15 × 10 + 15 × 2 = 150 + 30 = 180",
        },
        {
            question: "What is ½ + ¼?",
            questionHi: "½ + ¼ kitna hota hai?",
            options: ["²⁄₄", "¾", "¼", "1"],
            correctIndex: 1,
            explanation: "½ = ²⁄₄, toh ²⁄₄ + ¼ = ¾",
        },
    ],
};

export default function QuizBot() {
    const [subject, setSubject] = useState<string>("science");
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const questions = SAMPLE_QUIZZES[subject] || [];
    const question = questions[currentQ];
    const isAnswered = selected !== null;
    const isCorrect = selected === question?.correctIndex;
    const isFinished = currentQ >= questions.length || showResult;

    const handleSelect = useCallback(
        (idx: number) => {
            if (isAnswered) return;
            setSelected(idx);
            if (idx === question.correctIndex) setScore((s) => s + 1);
        },
        [isAnswered, question]
    );

    const handleNext = () => {
        if (currentQ + 1 >= questions.length) {
            setShowResult(true);
        } else {
            setCurrentQ((q) => q + 1);
            setSelected(null);
        }
    };

    const handleRestart = () => {
        setCurrentQ(0);
        setSelected(null);
        setScore(0);
        setShowResult(false);
    };

    if (!question || isFinished) {
        return (
            <div className="quiz-bot">
                <div className="result-card">
                    <h3>🎉 Quiz Complete!</h3>
                    <div className="score-display">
                        <span className="score-number">{score}</span>
                        <span className="score-total">/ {questions.length}</span>
                    </div>
                    <p className="score-label">
                        {score === questions.length
                            ? "Perfect! Bahut badhiya! 🌟"
                            : score >= questions.length / 2
                                ? "Achha score! Aur mehnat karo! 💪"
                                : "Koi baat nahi, dobara try karo! 📖"}
                    </p>
                    <button className="restart-btn" onClick={handleRestart}>
                        <RotateCcw size={16} /> Dobara shuru karein
                    </button>
                </div>
                <style jsx>{`
                    .quiz-bot { padding: 16px; }
                    .result-card {
                        text-align: center;
                        padding: 24px;
                        background: #1E293B;
                        border-radius: 16px;
                        border: 1px solid #334155;
                    }
                    .result-card h3 { color: #F1F5F9; margin: 0 0 16px; font-size: 18px; }
                    .score-display { margin: 16px 0; }
                    .score-number {
                        font-size: 48px;
                        font-weight: 700;
                        background: linear-gradient(135deg, #7C3AED, #A78BFA);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .score-total { font-size: 24px; color: #64748B; }
                    .score-label { color: #94A3B8; font-size: 14px; }
                    .restart-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        margin-top: 16px;
                        padding: 10px 20px;
                        background: linear-gradient(135deg, #7C3AED, #A78BFA);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        cursor: pointer;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="quiz-bot">
            <div className="quiz-header">
                <Brain size={20} />
                <h3>🧠 Quiz Time!</h3>
                <span className="progress">
                    {currentQ + 1}/{questions.length}
                </span>
            </div>

            {/* Subject tabs */}
            <div className="subject-tabs">
                {Object.keys(SAMPLE_QUIZZES).map((sub) => (
                    <button
                        key={sub}
                        className={`tab ${subject === sub ? "active" : ""}`}
                        onClick={() => {
                            setSubject(sub);
                            handleRestart();
                        }}
                    >
                        {sub === "science" ? "🔬 Science" : "🔢 Math"}
                    </button>
                ))}
            </div>

            <div className="question-card">
                <p className="question-text">{question.questionHi}</p>
                <p className="question-en">{question.question}</p>

                <div className="options">
                    {question.options.map((opt, idx) => (
                        <button
                            key={idx}
                            className={`option ${isAnswered
                                    ? idx === question.correctIndex
                                        ? "correct"
                                        : idx === selected
                                            ? "wrong"
                                            : ""
                                    : ""
                                }`}
                            onClick={() => handleSelect(idx)}
                            disabled={isAnswered}
                        >
                            <span className="option-letter">
                                {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="option-text">{opt}</span>
                            {isAnswered && idx === question.correctIndex && (
                                <CheckCircle size={16} className="icon-correct" />
                            )}
                            {isAnswered && idx === selected && idx !== question.correctIndex && (
                                <XCircle size={16} className="icon-wrong" />
                            )}
                        </button>
                    ))}
                </div>

                {isAnswered && (
                    <div className={`explanation ${isCorrect ? "correct" : "wrong"}`}>
                        <p>{isCorrect ? "✅ Sahi jawab!" : "❌ Galat!"}</p>
                        <p className="exp-text">{question.explanation}</p>
                        <button className="next-btn" onClick={handleNext}>
                            Agla sawal →
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .quiz-bot { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .quiz-header { display: flex; align-items: center; gap: 8px; color: #A78BFA; }
                .quiz-header h3 { flex: 1; font-size: 16px; font-weight: 600; margin: 0; color: #F1F5F9; }
                .progress { font-size: 13px; color: #64748B; background: #1E293B; padding: 4px 10px; border-radius: 8px; }
                .subject-tabs { display: flex; gap: 8px; }
                .tab {
                    flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #334155;
                    background: #1E293B; color: #94A3B8; font-size: 13px; cursor: pointer;
                    transition: all 0.2s;
                }
                .tab.active { background: linear-gradient(135deg, #7C3AED, #A78BFA); color: white; border-color: transparent; }
                .question-card { background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 16px; }
                .question-text { color: #F1F5F9; font-size: 15px; font-weight: 500; margin: 0 0 4px; }
                .question-en { color: #64748B; font-size: 12px; margin: 0 0 12px; font-style: italic; }
                .options { display: flex; flex-direction: column; gap: 8px; }
                .option {
                    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
                    background: #0F172A; border: 1px solid #334155; border-radius: 10px;
                    color: #F1F5F9; font-size: 14px; cursor: pointer; transition: all 0.2s;
                }
                .option:hover:not(:disabled) { border-color: #7C3AED; }
                .option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.1); }
                .option.wrong { border-color: #EF4444; background: rgba(239, 68, 68, 0.1); }
                .option-letter {
                    width: 24px; height: 24px; border-radius: 6px; background: #334155;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 12px; font-weight: 600; color: #94A3B8;
                }
                .option-text { flex: 1; }
                .icon-correct { color: #10B981; }
                .icon-wrong { color: #EF4444; }
                .explanation {
                    margin-top: 12px; padding: 12px; border-radius: 10px;
                    font-size: 13px; color: #F1F5F9;
                }
                .explanation.correct { background: rgba(16, 185, 129, 0.1); border: 1px solid #10B981; }
                .explanation.wrong { background: rgba(239, 68, 68, 0.1); border: 1px solid #EF4444; }
                .explanation p { margin: 0; }
                .exp-text { color: #94A3B8; margin-top: 4px !important; }
                .next-btn {
                    margin-top: 8px; padding: 8px 16px; background: #7C3AED; color: white;
                    border: none; border-radius: 8px; font-size: 13px; cursor: pointer;
                }
            `}</style>
        </div>
    );
}
