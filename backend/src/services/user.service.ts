// ===== JanSathi AI — User Profile Service =====
// CRUD operations for user profiles and preferences.
// All user data mutations flow through this service.

import prisma from "../models/prisma";
import logger from "../utils/logger";

// ── Public Types ────────────────────────────────────────────
export interface UserProfile {
    id: string;
    phone: string | null;
    email: string | null;
    name: string | null;
    role: string;
    language: string;
    village: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
    age: number | null;
    gender: string | null;
    category: string | null;
    occupation: string | null;
    createdAt: Date;
    lastActiveAt: Date;
}

export interface UserPreferences {
    favoriteModules: string[];
    voiceEnabled: boolean;
    fontSize: string;
    language: string;
}

export interface UpdateProfileData {
    name?: string;
    language?: "hi" | "en";
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
    age?: number;
    gender?: "male" | "female" | "other";
    category?: string;
    occupation?: string;
}

export interface UpdatePreferencesData {
    favoriteModules?: string[];
    voiceEnabled?: boolean;
    fontSize?: "small" | "normal" | "large";
    language?: "hi" | "en";
}

// ── Allowed field whitelist (prevents mass-assignment) ───────
const ALLOWED_PROFILE_FIELDS = new Set([
    "name", "language", "village", "district", "state",
    "pincode", "age", "gender", "category", "occupation",
]);

const ALLOWED_PREFERENCE_FIELDS = new Set([
    "favoriteModules", "voiceEnabled", "fontSize", "language",
]);

const ALLOWED_MODULES = new Set([
    "janseva", "janshiksha", "jankrishi", "janvyapar", "jankaushal",
]);

// ── Service ─────────────────────────────────────────────────
class UserService {
    /**
     * Get user profile by ID. Returns null if not found.
     */
    async getProfile(userId: string): Promise<UserProfile | null> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                email: true,
                name: true,
                role: true,
                language: true,
                village: true,
                district: true,
                state: true,
                pincode: true,
                age: true,
                gender: true,
                category: true,
                occupation: true,
                createdAt: true,
                lastActiveAt: true,
            },
        });

        return user;
    }

    /**
     * Update user profile fields (whitelist-validated).
     */
    async updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile> {
        // Strip any fields not in the whitelist
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
            if (ALLOWED_PROFILE_FIELDS.has(key) && value !== undefined) {
                sanitized[key] = value;
            }
        }

        if (Object.keys(sanitized).length === 0) {
            throw new Error("No valid fields to update");
        }

        // Validate specific fields
        if (sanitized.age !== undefined) {
            const age = sanitized.age as number;
            if (!Number.isInteger(age) || age < 1 || age > 150) {
                throw new Error("Age must be an integer between 1 and 150");
            }
        }

        if (sanitized.pincode !== undefined) {
            const pincode = sanitized.pincode as string;
            if (!/^\d{6}$/.test(pincode)) {
                throw new Error("Pincode must be exactly 6 digits");
            }
        }

        if (sanitized.language !== undefined && !["hi", "en"].includes(sanitized.language as string)) {
            throw new Error("Language must be 'hi' or 'en'");
        }

        if (sanitized.gender !== undefined && !["male", "female", "other"].includes(sanitized.gender as string)) {
            throw new Error("Gender must be 'male', 'female', or 'other'");
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            select: {
                id: true, phone: true, email: true, name: true, role: true,
                language: true, village: true, district: true, state: true,
                pincode: true, age: true, gender: true, category: true,
                occupation: true, createdAt: true, lastActiveAt: true,
            },
            data: sanitized,
        });

        logger.info("user.profile.updated", { userId, fields: Object.keys(sanitized) });
        return updated;
    }

    /**
     * Get user preferences.
     */
    async getPreferences(userId: string): Promise<UserPreferences | null> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                favoriteModules: true,
                voiceEnabled: true,
                fontSize: true,
                language: true,
            },
        });

        return user;
    }

    /**
     * Update user preferences (whitelist-validated).
     */
    async updatePreferences(userId: string, data: UpdatePreferencesData): Promise<UserPreferences> {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
            if (ALLOWED_PREFERENCE_FIELDS.has(key) && value !== undefined) {
                sanitized[key] = value;
            }
        }

        if (Object.keys(sanitized).length === 0) {
            throw new Error("No valid preferences to update");
        }

        // Validate favoriteModules
        if (sanitized.favoriteModules !== undefined) {
            const modules = sanitized.favoriteModules as string[];
            if (!Array.isArray(modules) || modules.some(m => !ALLOWED_MODULES.has(m))) {
                throw new Error("Invalid module in favoriteModules");
            }
        }

        // Validate fontSize
        if (sanitized.fontSize !== undefined && !["small", "normal", "large"].includes(sanitized.fontSize as string)) {
            throw new Error("fontSize must be 'small', 'normal', or 'large'");
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            select: {
                favoriteModules: true,
                voiceEnabled: true,
                fontSize: true,
                language: true,
            },
            data: sanitized,
        });

        logger.info("user.preferences.updated", { userId, fields: Object.keys(sanitized) });
        return updated;
    }

    /**
     * Update lastActiveAt timestamp. Fire-and-forget — never throws.
     * Debounced: only writes if last update was >5 minutes ago.
     */
    async updateLastActive(userId: string): Promise<void> {
        try {
            const DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes
            await prisma.user.updateMany({
                where: {
                    id: userId,
                    lastActiveAt: { lt: new Date(Date.now() - DEBOUNCE_MS) },
                },
                data: { lastActiveAt: new Date() },
            });
        } catch {
            // Swallow — activity tracking must never break user flow
            logger.warn("user.last_active.failed", { userId });
        }
    }
}

// ── Singleton ───────────────────────────────────────────────
export const userService = new UserService();
