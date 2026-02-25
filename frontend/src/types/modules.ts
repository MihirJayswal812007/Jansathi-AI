// ===== JanSathi AI — Module Type Definitions =====

export type ModeName =
    | "janseva"
    | "janshiksha"
    | "jankrishi"
    | "janvyapar"
    | "jankaushal";

export type Language = "hi" | "en";

export interface ModeConfig {
    id: ModeName;
    name: string;
    nameHi: string;
    tagline: string;
    taglineHi: string;
    icon: string;
    primaryColor: string;
    gradient: string;
    surfaceColor: string;
    description: string;
    descriptionHi: string;
    quickActions: QuickAction[];
}

export interface QuickAction {
    label: string;
    labelHi: string;
    query: string;
}

export interface UserProfile {
    id: string;
    name: string;
    phone: string;
    location: {
        state: string;
        district: string;
        village: string;
    };
    preferredLanguage: Language;
    occupation: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    mode: ModeName | null;
    metadata?: {
        confidence?: number;
        language?: Language;
        intent?: string;
    };
}

export interface AIResponse {
    content: string;
    mode: ModeName;
    confidence: number;
    actions?: ResponseAction[];
}

export interface ResponseAction {
    label: string;
    type: "link" | "call" | "navigate" | "share";
    value: string;
}
