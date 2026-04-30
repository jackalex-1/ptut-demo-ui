"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChatMessage } from "./types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Send, Trash2, Sparkles } from "lucide-react";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "👋 **Assalam-o-Alaikum!** I am **Rehbar**, your official **Digital Front Desk AI Assistant** for **CBD Punjab**.\n\nI'm here to guide you through our projects, respond to your queries, and assist you with your requirements. How can I help you today?",
  timestamp: new Date(),
};

const SUGGESTED_PROMPTS = [
  "Who are you?",
  "What services does CBD Punjab offer?",
  "Tell me about loan facilities",
  "What are the working hours?",
];

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persistence for GalaxAI Studio Studio API
  const generateSessionId = () => `session-${Math.random().toString(36).slice(2, 11)}`;
  const [sessionToken, setSessionToken] = useState(generateSessionId());
  const conversationId = useMemo(() => sessionToken, [sessionToken]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GalaxAI_Studio_API_KEY;
      if (!apiKey) {
        throw new Error("Chat API Key is missing. Check .env.local");
      }

      const response = await fetch(
        "https://cbd-dev.galaxai.ae/api/workflows/e5463ce8-71b6-4aff-b2f2-3a6c400e0d25/execute",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({
            input: content.trim(),
            conversationId: conversationId || "cbd-web-widget-default",
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to fetch from GalaxAI Studio API");
      }

      const result = await response.json();
      
      // Extracting the reply based on the logic from route.ts
      const text = 
        result.output?.content ||
        result.text ||
        result.reply ||
        result.message ||
        result.output?.reply || 
        result.data?.outputs?.answer || 
        result.data?.outputs?.text || 
        result.answer || 
        "";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: text }
            : m
        )
      );
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMsg);
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantMessageId)
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    setSessionToken(generateSessionId());
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-brand">
          <div className="chat-header-logo">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="chat-header-title">Rehbar</h1>
            <p className="chat-header-subtitle">Digital Front Desk AI • CBD Punjab</p>
          </div>
        </div>
        <div className="chat-header-actions">
          <div className="chat-status-dot" />
          <button
            onClick={clearChat}
            className="chat-clear-btn"
            title="Clear conversation"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && messages[messages.length - 1]?.content === "" && (
          <TypingIndicator />
        )}

        {error && (
          <div className="chat-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="chat-suggestions">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            className="suggestion-chip"
            onClick={() => sendMessage(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask Rehbar anything about CBD Punjab..."
            className="chat-textarea"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="chat-send-btn"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="chat-footer-note">
          AI may provide inaccurate information. Rehbar is an AI assistant.
        </p>
      </div>
    </div>
  );
}
