// ===== JanSathi AI — Home Page (V2 Stitch Design) =====
// Premium voice-first interface with glassmorphism, bento grid, and color psychology

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import VoiceButton from "@/components/common/VoiceButton";
import ModeSelector from "@/components/common/ModeSelector";
import ChatBubble from "@/components/common/ChatBubble";
import QuickActions from "@/components/common/QuickActions";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import LoadingDots from "@/components/common/LoadingDots";
import ModulePanel from "@/components/common/ModulePanel";
import MobileMenu from "@/components/common/MobileMenu";
import FeedbackBar from "@/components/chat/FeedbackBar";

import { useModeStore } from "@/store/modeStore";
import { useChatStore } from "@/store/chatStore";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import { useAuth } from "@/hooks/useAuth";
import { sendChatMessage } from "@/lib/apiClient";
import { MODE_CONFIGS, APP_NAME, APP_TAGLINE, APP_TAGLINE_HI } from "@/lib/constants";
import { ChatMessage } from "@/types/modules";
import { cleanTextForTTS } from "@/lib/cleanTextForTTS";

// ── Main Page Component ──────────────────────────────────────
export default function HomePage() {
  const { activeMode, language, isProcessing, setActiveMode, setIsProcessing } =
    useModeStore();
  const { messages, addMessage, clearMessages, conversationId, setConversationId } = useChatStore();
  const { isAuthenticated, isAdmin, handleLogout } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [textInput, setTextInput] = useState("");
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeModeConfig = activeMode ? MODE_CONFIGS[activeMode] : null;

  // Audio feedback
  const { playSound } = useAudioFeedback();

  // Voice recognition
  const handleVoiceResult = useCallback(
    (transcript: string) => {
      playSound("stopListening");
      handleSendMessage(transcript);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeMode]
  );

  const {
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    isSupported: voiceSupported,
  } = useVoiceRecognition({
    language,
    onResult: handleVoiceResult,
  });

  // Text to speech
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech({ language });

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Auto-read AI responses when voice mode is active
  useEffect(() => {
    if (!voiceModeActive) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && !isProcessing) {
      playSound("responseReceived");
      speak(cleanTextForTTS(lastMsg.content));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isProcessing]);

  // Focus input after response
  useEffect(() => {
    if (!isProcessing && messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [isProcessing, messages.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "V") {
        e.preventDefault();
        if (isListening) {
          stopListening();
        } else if (voiceSupported) {
          setVoiceModeActive(true);
          startListening();
          playSound("startListening");
        }
        return;
      }
      if (e.key === "Escape") {
        if (isListening) { stopListening(); playSound("stopListening"); }
        if (isSpeaking) { stopSpeaking(); }
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [isListening, isSpeaking, voiceSupported, startListening, stopListening, stopSpeaking, playSound]);

  // Send message handler
  async function handleSendMessage(text: string) {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
      mode: activeMode,
    };

    addMessage(userMessage);
    setTextInput("");
    setIsProcessing(true);
    playSound("messageSent");

    try {
      const response = await sendChatMessage(text, activeMode, messages, language, conversationId ?? undefined);

      // Track conversation thread
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      if (response.mode !== activeMode) {
        setActiveMode(response.mode);
        playSound("modeSwitch");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        mode: response.mode,
        conversationId: response.conversationId,
      };

      addMessage(assistantMessage);
    } catch {
      playSound("error");
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          language === "hi"
            ? "Maaf kijiye, kuch gadbad ho gayi. Kripya dobara koshish karein."
            : "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
        mode: activeMode,
      };
      addMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(textInput);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      playSound("stopListening");
    } else {
      setVoiceModeActive(true);
      startListening();
      playSound("startListening");
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{
        background: activeModeConfig
          ? `radial-gradient(ellipse at top, ${activeModeConfig.surfaceColor}, var(--bg-primary) 70%)`
          : "var(--bg-primary)",
        transition: "background 0.5s ease",
      }}
    >
      {/* Skip to content — accessibility */}
      <a href="#chat-content" className="skip-to-content">
        {language === "hi" ? "मुख्य सामग्री पर जाएं" : "Skip to content"}
      </a>

      {/* ── Glassmorphic Header ─────────────────────── */}
      <header className="app-header" role="banner">
        <div style={{ maxWidth: "80rem", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              background: `${activeModeConfig?.primaryColor || "#2563EB"}20`,
              padding: "8px",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span className="material-symbols-outlined" style={{ color: activeModeConfig?.primaryColor || "#2563EB", fontSize: "24px" }}>
                auto_awesome
              </span>
            </div>
            <h1 className="font-display" style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              {APP_NAME}
            </h1>
          </div>

          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Hamburger button — mobile only */}
            <button
              className="nav-hamburger"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={language === "hi" ? "मेनू खोलें" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              style={{
                padding: "8px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: "var(--bg-surface)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>menu</span>
            </button>
            {/* Mode badge pill */}
            {activeModeConfig && (
              <div className="mode-badge" style={{
                background: `${activeModeConfig.primaryColor}20`,
                border: `1px solid ${activeModeConfig.primaryColor}30`,
                color: activeModeConfig.primaryColor,
                display: hasMessages ? "inline-flex" : "none",
              }}>
                <span style={{ fontSize: "14px" }}>{activeModeConfig.icon}</span>
                <span>{language === "hi" ? activeModeConfig.nameHi : activeModeConfig.name}</span>
              </div>
            )}
            <button
              className="glass-card"
              style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }}
              title="Home"
              aria-label="Go to home page"
              onClick={() => {
                clearMessages();
                setActiveMode(null);
                window.scrollTo(0, 0);
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "var(--text-secondary)", fontSize: "20px" }}>
                home
              </span>
            </button>
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="glass-card"
                style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}
                title="CommPulse Dashboard (Admin)"
                aria-label="Open admin analytics dashboard"
              >
                <span className="material-symbols-outlined" style={{ color: "var(--text-secondary)", fontSize: "20px" }}>
                  dashboard
                </span>
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href="/history"
                className="glass-card"
                style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}
                title={language === "hi" ? "इतिहास" : "History"}
                aria-label="Conversation history"
              >
                <span className="material-symbols-outlined" style={{ color: "var(--text-secondary)", fontSize: "20px" }}>
                  history
                </span>
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="glass-card"
                  style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title={language === "hi" ? "प्रोफ़ाइल" : "Profile"}
                  aria-label="View profile"
                >
                  <span className="material-symbols-outlined" style={{ color: "#10B981", fontSize: "20px" }}>
                    person
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="glass-card"
                  style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }}
                  title={language === "hi" ? "लॉग आउट" : "Logout"}
                  aria-label="Logout"
                >
                  <span className="material-symbols-outlined" style={{ color: "var(--text-muted)", fontSize: "20px" }}>
                    logout
                  </span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="glass-card"
                style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}
                title={language === "hi" ? "लॉग इन" : "Login"}
                aria-label="Login"
              >
                <span className="material-symbols-outlined" style={{ color: "var(--text-secondary)", fontSize: "20px" }}>
                  login
                </span>
              </Link>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        language={language}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onHomeClick={() => {
          clearMessages();
          setActiveMode(null);
          window.scrollTo(0, 0);
        }}
      />

      {/* ── Main Content ───────────────────────── */}
      <main id="chat-content" className="flex flex-col flex-1 overflow-y-auto" role="main">
        {!hasMessages ? (
          /* ── Welcome View (Stitch Bento Layout) ──── */
          <motion.div
            className="flex flex-col items-center flex-1 px-4 py-8"
            style={{ maxWidth: "80rem", margin: "0 auto", width: "100%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <section style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 0 32px" }}>
              {/* Voice Orb Button */}
              <div style={{ position: "relative" }}>
                {voiceSupported && (
                  <VoiceButton
                    isListening={isListening}
                    isProcessing={isProcessing}
                    onToggle={handleVoiceToggle}
                    accentColor={activeModeConfig?.primaryColor}
                    language={language}
                    interimTranscript={interimTranscript}
                  />
                )}
              </div>

              <h2 className="font-display" style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 700,
                marginTop: "28px",
                letterSpacing: "-0.02em",
              }}>
                {language === "hi" ? "🙏 नमस्ते! बोलिए या टैप करें" : "🙏 Namaste! Tap to speak"}
              </h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "1.125rem", maxWidth: "32rem" }}>
                {language === "hi" ? APP_TAGLINE_HI : APP_TAGLINE}
              </p>
            </section>

            {/* Mode Selection — Bento Grid */}
            <div style={{ width: "100%", maxWidth: "56rem", marginBottom: "24px" }}>
              <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.875rem", marginBottom: "16px" }}>
                {language === "hi" ? "या कोई विषय चुनें:" : "Or choose a topic:"}
              </p>
              <ModeSelector />
            </div>

            {/* Quick Actions (if mode selected) */}
            <AnimatePresence>
              {activeMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ width: "100%", maxWidth: "56rem" }}
                >
                  <QuickActions
                    mode={activeMode}
                    onActionSelect={handleSendMessage}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Module-specific widgets */}
            <div style={{ width: "100%", maxWidth: "56rem" }}>
              <ModulePanel
                mode={activeMode}
                onAskQuestion={handleSendMessage}
                language={language}
              />
            </div>
          </motion.div>
        ) : (
          /* ── Chat View ─────────────────────── */
          <>
            {/* Mode indicator bar */}
            {activeModeConfig && (
              <div
                className="mode-badge"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: 0,
                  width: "100%",
                  background: activeModeConfig.surfaceColor,
                  color: activeModeConfig.primaryColor,
                  borderBottom: `2px solid ${activeModeConfig.primaryColor}30`,
                }}
                role="status"
                aria-label={`Active module: ${activeModeConfig.name}`}
              >
                <span aria-hidden="true" style={{ fontSize: "16px" }}>{activeModeConfig.icon}</span>
                <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.75rem" }}>
                  {language === "hi" ? activeModeConfig.nameHi : activeModeConfig.name}
                  {" "}Mode
                </span>
                {voiceModeActive && (
                  <span style={{
                    fontSize: "0.7rem",
                    marginLeft: "4px",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--bg-elevated)",
                    color: "var(--text-muted)",
                  }}>
                    🔊 {language === "hi" ? "ऑटो-रीड" : "Auto-read"}
                  </span>
                )}
                <span
                  style={{ marginLeft: "auto", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.875rem" }}
                  onClick={() => setActiveMode(null)}
                  role="button"
                  aria-label={language === "hi" ? "मॉड्यूल बंद करें" : "Close module"}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") setActiveMode(null); }}
                >
                  ✕
                </span>
              </div>
            )}

            {/* Chat messages */}
            <div className="chat-container flex-1"
              role="log"
              aria-live="polite"
              aria-label={language === "hi" ? "चैट संदेश" : "Chat messages"}>
              {messages.map((msg, i) => (
                <div key={msg.id}>
                  <ChatBubble
                    message={msg}
                    onSpeak={msg.role === "assistant" ? speak : undefined}
                    isSpeaking={isSpeaking}
                    onStopSpeaking={stopSpeaking}
                    language={language}
                  />
                  {msg.role === "assistant" && msg.conversationId && i === messages.length - 1 && (
                    <div style={{ paddingLeft: "12px", marginBottom: "4px" }}>
                      <FeedbackBar conversationId={msg.conversationId} />
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && <LoadingDots />}

              <div ref={chatEndRef} />
            </div>

            {/* Quick actions for current mode */}
            {activeMode && (
              <QuickActions
                mode={activeMode}
                onActionSelect={handleSendMessage}
              />
            )}

            {/* Module-specific widgets */}
            <ModulePanel
              mode={activeMode}
              onAskQuestion={handleSendMessage}
              language={language}
            />
          </>
        )}
      </main>

      {/* ── Sticky Bottom Input Bar (Stitch V2) ──── */}
      <div className="input-bar" role="toolbar" aria-label={language === "hi" ? "संदेश भेजें" : "Send message"}>
        <div className="input-bar-inner">
          {/* Mic button */}
          <button
            className="mic-btn"
            onClick={handleVoiceToggle}
            disabled={!voiceSupported || isProcessing}
            style={{
              background: activeModeConfig?.primaryColor || "var(--info)",
              boxShadow: `0 0 20px ${activeModeConfig?.primaryColor || "rgba(59,130,246,0.4)"}40`,
              position: "relative",
            }}
            aria-label={isListening
              ? (language === "hi" ? "सुनना बंद करें" : "Stop voice input")
              : (language === "hi" ? "आवाज़ से बोलें" : "Voice input")
            }
            aria-pressed={isListening}
            title="Ctrl+Shift+V"
          >
            {isListening ? (
              <>
                <div className="voice-waveform" style={{ color: "white" }}>
                  <span className="bar" /><span className="bar" /><span className="bar" />
                </div>
                <span style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "var(--radius-full)",
                  background: activeModeConfig?.primaryColor || "var(--info)",
                  opacity: 0.2,
                  animation: "voice-pulse 1.5s ease-in-out infinite",
                }} />
              </>
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>mic</span>
            )}
          </button>

          {/* Show interim transcript while listening */}
          {isListening && interimTranscript ? (
            <div className="flex-1 interim-transcript px-3">
              &ldquo;{interimTranscript}&rdquo;
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} style={{ display: "flex", flex: 1, gap: "12px" }}>
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={
                  language === "hi"
                    ? "अपना सवाल लिखें..."
                    : "Type your question..."
                }
                disabled={isProcessing}
                aria-label={language === "hi" ? "अपना सवाल लिखें" : "Type your question"}
              />

              <button
                type="submit"
                className="send-btn"
                disabled={!textInput.trim() || isProcessing}
                style={{
                  background: activeModeConfig?.primaryColor || "var(--info)",
                  boxShadow: `0 0 15px ${activeModeConfig?.primaryColor || "rgba(59,130,246,0.3)"}40`,
                  opacity: !textInput.trim() || isProcessing ? 0.5 : 1,
                }}
                aria-label={language === "hi" ? "भेजें" : "Send message"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px", transform: "rotate(-45deg) translate(1px, -1px)" }}>send</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Keyboard shortcut hint (sr-only) */}
      <div className="sr-only" aria-live="assertive">
        {isListening && (language === "hi" ? "सुन रहा है। Escape दबाकर रोकें।" : "Listening. Press Escape to stop.")}
      </div>
    </div>
  );
}
