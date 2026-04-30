"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { ChatMessage } from "./types";
import { ChatPanel } from "./ChatPanel";
import { TermsOverlay } from "./TermsOverlay";
import { RotateCcw, GraduationCap } from "lucide-react";

const WELCOME_MESSAGE_CONTENT = "👋 **Welcome!** I am **PTUT Sovereign AI**, your official **AI assistant for Punjab Tianjin University of Technology**.\n\nI'm here to help you with admissions, academic programs, campus information, and answer your university-related queries. How can I assist you today?";

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);

  // Persistence for GalaxAI Studio Studio API
  const generateSessionId = () => `session-${Math.random().toString(36).slice(2, 11)}`;
  const [sessionToken, setSessionToken] = useState(generateSessionId());
  const conversationId = useMemo(() => sessionToken, [sessionToken]);

  // Initial welcome message with client-side timestamp
  useEffect(() => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE_CONTENT,
      timestamp: new Date(),
      source: "chat",
    }]);
  }, []);

  const sendChatMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        source: "chat",
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsLoading(true);
      setError(null);

      try {
        const apiKey = process.env.NEXT_PUBLIC_GalaxAI_Studio_API_KEY;
        if (!apiKey) {
          throw new Error("Chat API Key is missing. Check .env.local");
        }

        const workflowUrl = process.env.NEXT_PUBLIC_WORKFLOW_URL;
        if (!workflowUrl) {
          throw new Error("Workflow URL is missing. Check .env.local");
        }

        const res = await fetch(
          workflowUrl,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": apiKey,
            },
            body: JSON.stringify({
              input: content.trim(),
              conversationId: conversationId || "ptut-sovereign-default",
            }),
          }
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch from GalaxAI Studio API");
        }

        const result = await res.json();

        const text =
          result.output?.result ||
          result.output?.content ||
          result.output?.reply ||
          result.output?.text ||
          result.text ||
          result.reply ||
          result.message ||
          result.data?.outputs?.answer ||
          result.data?.outputs?.text ||
          result.answer ||
          "Could not get a response from AI.";

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: text,
            timestamp: new Date(),
            source: "chat",
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, isLoading]
  );

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE_CONTENT,
      timestamp: new Date(),
      source: "chat",
    }]);
    setError(null);
    setSessionToken(generateSessionId());
  };

  return (
    <div className="chat-window">
      {showTerms && <TermsOverlay onClose={() => setShowTerms(false)} />}

      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-brand">
          <div className="chat-header-logo">
            <GraduationCap size={20} />
          </div>
          <div>
            <h1 className="chat-header-title">PTUT Sovereign AI</h1>
            <p className="chat-header-subtitle">AI Agent for Punjab Tianjin University of Technology</p>
          </div>
        </div>
        <div className="chat-header-actions">
          <div className="chat-status-dot" />
          <button type="button" onClick={clearChat} className="chat-clear-btn" title="Reset conversation" aria-label="Reset conversation">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="tab-content flex-1 flex flex-col overflow-hidden">
        <ChatPanel
          messages={messages}
          inputValue={inputValue}
          isLoading={isLoading}
          error={error}
          onInputChange={setInputValue}
          onSend={sendChatMessage}
          onShowTerms={() => setShowTerms(true)}
        />
      </div>
    </div>
  );
}
