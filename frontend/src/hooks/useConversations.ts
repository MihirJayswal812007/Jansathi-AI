"use client";

import { useState, useEffect, useCallback } from "react";
import {
    fetchConversations,
    type ConversationSummary,
} from "@/lib/apiClient";

interface UseConversationsReturn {
    conversations: ConversationSummary[];
    page: number;
    totalPages: number;
    total: number;
    isLoading: boolean;
    error: string | null;
    setPage: (page: number) => void;
    refetch: () => void;
}

export function useConversations(): UseConversationsReturn {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchConversations(page);
            setConversations(result.data);
            setTotalPages(result.pagination.totalPages);
            setTotal(result.pagination.total);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to load conversations";
            if (msg.includes("401")) {
                window.location.href = "/login?expired=1";
                return;
            }
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        conversations,
        page,
        totalPages,
        total,
        isLoading,
        error,
        setPage,
        refetch: fetchData,
    };
}

export default useConversations;
