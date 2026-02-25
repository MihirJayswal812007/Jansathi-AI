"use client";

import { useState } from "react";
import { BookOpen, Lightbulb, ArrowRight } from "lucide-react";

interface ConceptExplainerProps {
    onAskQuestion?: (question: string) => void;
}

const SAMPLE_TOPICS = [
    { label: "Photosynthesis 🌱", query: "Photosynthesis samjhao", icon: "🌱" },
    { label: "Gravity 🌍", query: "Gravity kya hai?", icon: "🌍" },
    { label: "Water Cycle 💧", query: "Paani ka chakra samjhao", icon: "💧" },
    { label: "Fractions ½", query: "Bhinn (fractions) samjhao", icon: "½" },
    { label: "Body Parts 🫁", query: "Sharir ke ang samjhao", icon: "🫁" },
    { label: "Solar System ☀️", query: "Saurmandal ke greh", icon: "☀️" },
];

export default function ConceptExplainer({ onAskQuestion }: ConceptExplainerProps) {
    const [selectedClass, setSelectedClass] = useState<number>(5);

    return (
        <div className="concept-explainer">
            <div className="section-header">
                <BookOpen size={20} />
                <h3>📚 Concept Samjho</h3>
            </div>
            <p className="section-desc">
                Koi bhi topic chunein — hum gaon ki bhaasha mein samjhayenge!
            </p>

            {/* Class selector */}
            <div className="class-selector">
                <span className="label">Kaksha:</span>
                <div className="class-chips">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cls) => (
                        <button
                            key={cls}
                            className={`class-chip ${selectedClass === cls ? "active" : ""}`}
                            onClick={() => setSelectedClass(cls)}
                        >
                            {cls}
                        </button>
                    ))}
                </div>
            </div>

            {/* Topic chips */}
            <div className="topic-grid">
                {SAMPLE_TOPICS.map((topic) => (
                    <button
                        key={topic.query}
                        className="topic-card"
                        onClick={() => onAskQuestion?.(`Class ${selectedClass}: ${topic.query}`)}
                    >
                        <span className="topic-icon">{topic.icon}</span>
                        <span className="topic-label">{topic.label}</span>
                        <ArrowRight size={14} className="topic-arrow" />
                    </button>
                ))}
            </div>

            <div className="tip-box">
                <Lightbulb size={16} />
                <span>Aap apna sawal bhi type ya bol sakte hain!</span>
            </div>

            <style jsx>{`
                .concept-explainer {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #A78BFA;
                }
                .section-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0;
                    color: #F1F5F9;
                }
                .section-desc {
                    color: #94A3B8;
                    font-size: 13px;
                    margin: 0;
                }
                .class-selector {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .label {
                    color: #94A3B8;
                    font-size: 13px;
                    font-weight: 500;
                }
                .class-chips {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                }
                .class-chip {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: 1px solid #334155;
                    background: #1E293B;
                    color: #94A3B8;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .class-chip:hover {
                    border-color: #7C3AED;
                    color: #A78BFA;
                }
                .class-chip.active {
                    background: linear-gradient(135deg, #7C3AED, #A78BFA);
                    color: white;
                    border-color: transparent;
                }
                .topic-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .topic-card {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 10px;
                    color: #F1F5F9;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .topic-card:hover {
                    border-color: #7C3AED;
                    background: rgba(124, 58, 237, 0.08);
                }
                .topic-icon { font-size: 18px; }
                .topic-label { flex: 1; text-align: left; }
                .topic-arrow { color: #64748B; }
                .tip-box {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: rgba(124, 58, 237, 0.08);
                    border-radius: 8px;
                    color: #A78BFA;
                    font-size: 12px;
                }
            `}</style>
        </div>
    );
}
