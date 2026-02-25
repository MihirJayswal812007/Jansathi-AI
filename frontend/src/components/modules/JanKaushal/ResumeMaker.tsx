"use client";

import { Briefcase, FileText, ArrowRight, Star } from "lucide-react";

interface ResumeMakerProps {
    onAskQuestion?: (question: string) => void;
}

const RESUME_TEMPLATES = [
    { label: "Driver / Delivery", labelHi: "ड्राइवर / डिलीवरी", icon: "🚗", query: "Driver ke liye resume banao" },
    { label: "Electrician", labelHi: "इलेक्ट्रीशियन", icon: "⚡", query: "Electrician ka resume banao" },
    { label: "Tailor / Darji", labelHi: "दर्जी", icon: "🪡", query: "Darji ka resume banao" },
    { label: "Data Entry", labelHi: "डाटा एंट्री", icon: "💻", query: "Data entry ka resume banao" },
    { label: "Retail / Dukan", labelHi: "दुकान", icon: "🏪", query: "Shop assistant ka resume banao" },
    { label: "Plumber", labelHi: "प्लम्बर", icon: "🔧", query: "Plumber ka resume banao" },
];

const STEPS = [
    { step: 1, label: "Naam aur Phone", icon: "👤" },
    { step: 2, label: "Padhai ki details", icon: "📚" },
    { step: 3, label: "Skills & experience", icon: "⭐" },
    { step: 4, label: "Resume ready!", icon: "✅" },
];

export default function ResumeMaker({ onAskQuestion }: ResumeMakerProps) {
    return (
        <div className="resume-maker">
            <div className="section-header">
                <FileText size={20} />
                <h3>📄 Resume Banao</h3>
            </div>
            <p className="desc">Apna job type chunein — hum professional resume banayenge!</p>

            {/* How it works */}
            <div className="steps-row">
                {STEPS.map((s, i) => (
                    <div key={s.step} className="step-item">
                        <div className="step-icon">{s.icon}</div>
                        <span className="step-label">{s.label}</span>
                        {i < STEPS.length - 1 && <ArrowRight size={12} className="step-arrow" />}
                    </div>
                ))}
            </div>

            {/* Job templates */}
            <div className="template-grid">
                {RESUME_TEMPLATES.map((t) => (
                    <button key={t.query} className="template-card" onClick={() => onAskQuestion?.(t.query)}>
                        <span className="t-icon">{t.icon}</span>
                        <div className="t-text">
                            <span className="t-label">{t.label}</span>
                            <span className="t-hi">{t.labelHi}</span>
                        </div>
                        <ArrowRight size={14} className="t-arrow" />
                    </button>
                ))}
            </div>

            <div className="custom-cta">
                <Briefcase size={16} />
                <span>Ya apna job type batayein — hum resume likhenge!</span>
            </div>

            <style jsx>{`
                .resume-maker { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .section-header { display: flex; align-items: center; gap: 8px; color: #F87171; }
                .section-header h3 { font-size: 16px; font-weight: 600; margin: 0; color: #F1F5F9; }
                .desc { color: #94A3B8; font-size: 13px; margin: 0; }
                .steps-row {
                    display: flex; align-items: center; gap: 4px; padding: 12px;
                    background: rgba(220, 38, 38, 0.06); border-radius: 10px;
                    overflow-x: auto;
                }
                .step-item { display: flex; align-items: center; gap: 4px; }
                .step-icon { font-size: 18px; }
                .step-label { font-size: 11px; color: #94A3B8; white-space: nowrap; }
                .step-arrow { color: #64748B; flex-shrink: 0; }
                .template-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .template-card {
                    display: flex; align-items: center; gap: 8px; padding: 10px 12px;
                    background: #1E293B; border: 1px solid #334155; border-radius: 10px;
                    color: #F1F5F9; font-size: 13px; cursor: pointer; transition: all 0.2s;
                }
                .template-card:hover { border-color: #DC2626; background: rgba(220, 38, 38, 0.06); }
                .t-icon { font-size: 22px; }
                .t-text { flex: 1; display: flex; flex-direction: column; text-align: left; }
                .t-label { font-size: 13px; font-weight: 500; }
                .t-hi { font-size: 11px; color: #64748B; }
                .t-arrow { color: #64748B; }
                .custom-cta {
                    display: flex; align-items: center; gap: 8px; padding: 10px 14px;
                    background: rgba(220, 38, 38, 0.08); border-radius: 8px;
                    color: #F87171; font-size: 12px;
                }
            `}</style>
        </div>
    );
}
