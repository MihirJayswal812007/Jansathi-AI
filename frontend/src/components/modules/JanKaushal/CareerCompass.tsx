"use client";

import { Compass, TrendingUp, ArrowRight } from "lucide-react";

interface CareerCompassProps {
    onAskQuestion?: (question: string) => void;
}

const CAREER_PATHS = [
    {
        title: "🚗 Driving & Transport",
        titleHi: "ड्राइविंग और ट्रांसपोर्ट",
        roles: ["Ola/Uber Driver", "Delivery Boy", "Truck Driver"],
        salary: "₹12,000 – ₹25,000/month",
        query: "Driver banne ke liye kya karna hoga?",
    },
    {
        title: "⚡ Electrical & Plumbing",
        titleHi: "इलेक्ट्रिकल और प्लम्बिंग",
        roles: ["Electrician", "AC Mechanic", "Plumber"],
        salary: "₹15,000 – ₹35,000/month",
        query: "Electrician kaise bane?",
    },
    {
        title: "💻 Digital & IT",
        titleHi: "डिजिटल और आईटी",
        roles: ["Data Entry", "Social Media", "Computer Operator"],
        salary: "₹10,000 – ₹20,000/month",
        query: "Data entry ka kaam kaise milega?",
    },
    {
        title: "🪡 Handcraft & Tailoring",
        titleHi: "हस्तकला और सिलाई",
        roles: ["Darji", "Embroidery", "Boutique Owner"],
        salary: "₹8,000 – ₹30,000/month",
        query: "Tailoring ka business kaise shuru karein?",
    },
    {
        title: "🏥 Healthcare",
        titleHi: "स्वास्थ्य सेवा",
        roles: ["ANM Nurse", "Lab Technician", "Pharmacy Assistant"],
        salary: "₹12,000 – ₹25,000/month",
        query: "Health mein job kaise lein?",
    },
    {
        title: "🌾 Agri-business",
        titleHi: "कृषि व्यापार",
        roles: ["Organic Farming", "Dairy", "Fishery"],
        salary: "₹10,000 – ₹50,000/month",
        query: "Kheti se paisa kaise kamayein?",
    },
];

export default function CareerCompass({ onAskQuestion }: CareerCompassProps) {
    return (
        <div className="career-compass">
            <div className="section-header">
                <Compass size={20} />
                <h3>🧭 Career Guide</h3>
            </div>
            <p className="desc">Apni pasand ka career path chunein — hum raasta dikhayenge!</p>

            <div className="career-grid">
                {CAREER_PATHS.map((path) => (
                    <button
                        key={path.title}
                        className="career-card"
                        onClick={() => onAskQuestion?.(path.query)}
                    >
                        <div className="card-header">
                            <span className="card-title">{path.title}</span>
                            <span className="card-hi">{path.titleHi}</span>
                        </div>
                        <div className="roles">
                            {path.roles.map((r) => (
                                <span key={r} className="role-tag">{r}</span>
                            ))}
                        </div>
                        <div className="salary-row">
                            <TrendingUp size={14} />
                            <span>{path.salary}</span>
                            <ArrowRight size={14} className="arrow" />
                        </div>
                    </button>
                ))}
            </div>

            <style jsx>{`
                .career-compass { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .section-header { display: flex; align-items: center; gap: 8px; color: #F87171; }
                .section-header h3 { font-size: 16px; font-weight: 600; margin: 0; color: #F1F5F9; }
                .desc { color: #94A3B8; font-size: 13px; margin: 0; }
                .career-grid { display: flex; flex-direction: column; gap: 8px; }
                .career-card {
                    padding: 12px; background: #1E293B; border: 1px solid #334155;
                    border-radius: 12px; cursor: pointer; transition: all 0.2s;
                    display: flex; flex-direction: column; gap: 8px; text-align: left;
                }
                .career-card:hover { border-color: #DC2626; background: rgba(220, 38, 38, 0.05); }
                .card-header { display: flex; flex-direction: column; gap: 2px; }
                .card-title { font-size: 14px; font-weight: 600; color: #F1F5F9; }
                .card-hi { font-size: 12px; color: #64748B; }
                .roles { display: flex; flex-wrap: wrap; gap: 4px; }
                .role-tag {
                    font-size: 11px; padding: 2px 8px; border-radius: 6px;
                    background: rgba(220, 38, 38, 0.1); color: #F87171;
                }
                .salary-row {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 12px; color: #10B981; font-weight: 500;
                }
                .arrow { color: #64748B; margin-left: auto; }
            `}</style>
        </div>
    );
}
