"use client";

import { useState, useEffect, useCallback } from "react";
import {
    fetchProfile,
    updateProfile,
    fetchPreferences,
    updatePreferences,
    type UserProfile,
    type UserPreferences,
} from "@/lib/apiClient";

interface UseProfileReturn {
    profile: UserProfile | null;
    preferences: UserPreferences | null;
    isLoading: boolean;
    error: string | null;
    isSaving: boolean;
    saveSuccess: boolean;
    updateProfileField: (data: Parameters<typeof updateProfile>[0]) => Promise<void>;
    updatePrefs: (data: Parameters<typeof updatePreferences>[0]) => Promise<void>;
    refetch: () => void;
}

export function useProfile(): UseProfileReturn {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [profileData, prefsData] = await Promise.all([
                fetchProfile(),
                fetchPreferences(),
            ]);
            setProfile(profileData);
            setPreferences(prefsData);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to load profile";
            if (msg.includes("401")) {
                window.location.href = "/login?expired=1";
                return;
            }
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateProfileField = useCallback(async (data: Parameters<typeof updateProfile>[0]) => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const updated = await updateProfile(data);
            setProfile(updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to update profile";
            setError(msg);
        } finally {
            setIsSaving(false);
        }
    }, []);

    const updatePrefs = useCallback(async (data: Parameters<typeof updatePreferences>[0]) => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const updated = await updatePreferences(data);
            setPreferences(updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to update preferences";
            setError(msg);
        } finally {
            setIsSaving(false);
        }
    }, []);

    return {
        profile,
        preferences,
        isLoading,
        error,
        isSaving,
        saveSuccess,
        updateProfileField,
        updatePrefs,
        refetch: fetchData,
    };
}

export default useProfile;
