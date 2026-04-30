"use client";

import { useRef, useEffect } from "react";
import { ChatMessage } from "./types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Send, Loader2 } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "Tell me about PTUT",
  "What programs does PTUT offer?",
  "How do I apply for admission?",
  "I want to talk to human",
];

interface ChatPanelProps {
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  error: string | null;
  onInputChange: (val: string) => void;
  onSend: (content: string) => void;
  onShowTerms: () => void;
}

export function ChatPanel({
  messages,
  inputValue,
  isLoading,
  error,
  onInputChange,
  onSend,
  onShowTerms,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!isLoading) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [messages, isLoading]);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSend(inputValue.trim());
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSend(inputValue.trim());
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <>
      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isLoading && (
          <TypingIndicator />
        )}
        {error && (
          <div className="chat-error">
            <span>⚠️ {error}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div className="chat-suggestions">
        {SUGGESTED_PROMPTS.map((p) => (
          <button key={p} className="suggestion-chip" onClick={() => onSend(p)}>
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              onInputChange(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask PTUT Sovereign AI anything..."
            className="chat-textarea"
            rows={1}
            disabled={isLoading}
          />
          <div className="chat-input-actions">
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="chat-send-btn"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <p className="chat-footer-note">
          PTUT Sovereign AI uses AI, mistakes may occur.{" "}
          <button type="button" onClick={onShowTerms} className="link-btn">
            T&amp;Cs Apply
          </button>
        </p>
      </div>
    </>
  );
}
