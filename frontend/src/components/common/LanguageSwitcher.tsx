// ===== JanSathi AI — Language Switcher Component =====

"use client";

import { useModeStore } from "@/store/modeStore";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useModeStore();

    return (
        <div className="lang-toggle">
            <button
                className={language === "hi" ? "active" : ""}
                onClick={() => setLanguage("hi")}
                aria-label="Switch to Hindi"
            >
                हिंदी
            </button>
            <button
                className={language === "en" ? "active" : ""}
                onClick={() => setLanguage("en")}
                aria-label="Switch to English"
            >
                EN
            </button>
        </div>
    );
}
