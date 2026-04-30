"use client";

import { ChatMessage } from "./types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isRTL(text: string): boolean {
  // Arabic, Urdu matching characters
  const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFC]/;
  return rtlChars.test(text);
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const rtl = isRTL(message.content);

  return (
    <div
      className={`message-row ${isUser ? "message-row--user" : "message-row--assistant"}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="message-avatar message-avatar--assistant">
          <Bot size={16} />
        </div>
      )}

      <div className={`message-bubble ${isUser ? "message-bubble--user" : "message-bubble--assistant"}`}>
        {/* Markdown content */}
        <div className={`prose-content ${rtl ? 'prose-rtl' : ''}`} dir={rtl ? 'rtl' : 'ltr'}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <span className="message-time" suppressHydrationWarning>
          {message.timestamp ? formatTime(message.timestamp) : ""}
        </span>
      </div>

      {isUser && (
        <div className="message-avatar message-avatar--user">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
