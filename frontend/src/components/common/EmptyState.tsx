"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    ctaLabel?: string;
    ctaHref?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    ctaLabel,
    ctaHref,
}: EmptyStateProps) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                {icon || <MessageSquare size={28} />}
            </div>
            <h3 className="empty-state-title font-display">{title}</h3>
            <p className="empty-state-desc">{description}</p>
            {ctaLabel && ctaHref && (
                <Link href={ctaHref} className="shimmer-btn" style={{ marginTop: "8px", fontSize: "0.875rem", padding: "10px 20px" }}>
                    {ctaLabel}
                </Link>
            )}
        </div>
    );
}

export default EmptyState;
