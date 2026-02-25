"use client";

import { MessageSquare, Star, ArrowRight } from "lucide-react";

interface InterviewCoachProps {
    onAskQuestion?: (question: string) => void;
}

const INTERVIEW_TOPICS = [
    {
        label: "Tell me about yourself",
        labelHi: "Apne baare mein batayein",
        icon: "👤",
        query: "Interview mein 'Tell me about yourself' ka jawab kaise dein?",
    },
    {
        label: "Why should we hire you?",
        labelHi: "Hum aapko kyun chunein?",
        icon: "🤝",
        query: "Interview mein 'Why hire you' ka jawab kaise dein?",
    },
    {
        label: "Strengths & Weaknesses",
        labelHi: "Aapki khoobiyan aur kamzoriyan",
        icon: "💪",
        query: "Interview mein strengths aur weaknesses kaise batayein?",
    },
    {
        label: "Salary expectations",
        labelHi: "Tankhwah ki umeed",
        icon: "💰",
        query: "Interview mein salary expectations kaise discuss karein?",
    },
    {
        label: "Body language tips",
        labelHi: "Shareerik bhaasha ke tips",
        icon: "🧍",
        query: "Interview mein body language kaise rakhein?",
    },
    {
        label: "Common mistakes",
        labelHi: "Aam galtiyan",
        icon: "⚠️",
        query: "Interview mein common mistakes kya hain?",
    },
];

const TIPS = [
    "Samay se 10 min pehle pahunchein ⏰",
    "Saaf kapde pehnein 👔",
    "Aankh mein aankh daal kar baat karein 👁️",
    "Phone silent rakhein 📱",
];

export default function InterviewCoach({ onAskQuestion }: InterviewCoachProps) {
    return (
        <div className="interview-coach">
            <div className="section-header">
                <MessageSquare size={20} />
                <h3>🎤 Interview Taiyari</h3>
            </div>
            <p className="desc">Common interview sawaalon ki taiyari karein!</p>

            {/* Quick tips */}
            <div className="tips-row">
                {TIPS.map((tip) => (
                    <span key={tip} className="tip-chip">
                        {tip}
                    </span>
                ))}
            </div>

            {/* Question cards */}
            <div className="question-grid">
                {INTERVIEW_TOPICS.map((t) => (
                    <button
                        key={t.query}
                        className="question-card"
                        onClick={() => onAskQuestion?.(t.query)}
                    >
                        <span className="q-icon">{t.icon}</span>
                        <div className="q-text">
                            <span className="q-en">{t.label}</span>
                            <span className="q-hi">{t.labelHi}</span>
                        </div>
                        <ArrowRight size={14} className="q-arrow" />
                    </button>
                ))}
            </div>

            <div className="mock-cta">
                <Star size={16} />
                <span>Mock interview shuru karein — hum interviewer banenge!</span>
            </div>

            <style jsx>{`
                .interview-coach { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .section-header { display: flex; align-items: center; gap: 8px; color: #F87171; }
                .section-header h3 { font-size: 16px; font-weight: 600; margin: 0; color: #F1F5F9; }
                .desc { color: #94A3B8; font-size: 13px; margin: 0; }
                .tips-row { display: flex; gap: 6px; flex-wrap: wrap; }
                .tip-chip {
                    font-size: 11px; padding: 4px 10px; border-radius: 6px;
                    background: rgba(220, 38, 38, 0.08); color: #F87171;
                }
                .question-grid { display: flex; flex-direction: column; gap: 8px; }
                .question-card {
                    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
                    background: #1E293B; border: 1px solid #334155; border-radius: 10px;
                    color: #F1F5F9; cursor: pointer; transition: all 0.2s;
                }
                .question-card:hover { border-color: #DC2626; background: rgba(220, 38, 38, 0.05); }
                .q-icon { font-size: 20px; }
                .q-text { flex: 1; display: flex; flex-direction: column; text-align: left; }
                .q-en { font-size: 13px; font-weight: 500; }
                .q-hi { font-size: 11px; color: #64748B; }
                .q-arrow { color: #64748B; }
                .mock-cta {
                    display: flex; align-items: center; gap: 8px; padding: 10px 14px;
                    background: rgba(220, 38, 38, 0.08); border-radius: 8px;
                    color: #F87171; font-size: 12px;
                }
            `}</style>
        </div>
    );
}
