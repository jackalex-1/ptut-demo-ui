"use client";

import { useState, useEffect } from "react";

const MESSAGE_POOLS = {
  early: [
    "✨ Working on it... Just a moment!",
    "🧠 Processing your request...",
    "⚡ Gathering information...",
    "🔍 Searching for the best answer...",
    "💭 Thinking hard about this...",
    "🎯 Analyzing your question...",
  ],
  mid: [
    "🚀 Processing your request... Almost there!",
    "⏳ The servers are working hard... Hang tight!",
    "🌐 Connecting to our knowledge base...",
    "📚 Digging through the archives...",
    "🎯 Analyzing the best response...",
    "🔮 Consulting the crystal ball...",
  ],
  late: [
    "⏳ The servers are working hard... Hang tight!",
    "🔥 Things are heating up... Almost ready!",
    "💫 Still working on it... We're getting close!",
    "🎨 Crafting the perfect response...",
    "⚙️ Fine-tuning the details...",
    "🌊 Riding the wave of data...",
  ],
  final: [
    "🎯 We're almost done... Just a few more seconds!",
    "🏁 Final touches... Almost there!",
    "✨ Polishing the response... Just a moment!",
    "🎪 The grand finale is coming...",
    "🌟 Almost ready to dazzle you...",
    "🎭 Preparing the perfect answer...",
  ],
};

export function TypingIndicator() {
  const [message, setMessage] = useState(MESSAGE_POOLS.early[0]);

  useEffect(() => {
    // Pick an initial random message for early
    setMessage(MESSAGE_POOLS.early[Math.floor(Math.random() * MESSAGE_POOLS.early.length)]);
    
    let elapsedSeconds = 0;
    const interval = setInterval(() => {
      elapsedSeconds++;
      let pool = MESSAGE_POOLS.early;
      if (elapsedSeconds >= 15) pool = MESSAGE_POOLS.final;
      else if (elapsedSeconds >= 8) pool = MESSAGE_POOLS.late;
      else if (elapsedSeconds >= 3) pool = MESSAGE_POOLS.mid;
      
      // Randomly change message every 3 seconds
      if (elapsedSeconds % 3 === 0) {
         setMessage(pool[Math.floor(Math.random() * pool.length)]);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="message-row message-row--assistant">
      <div className="message-avatar message-avatar--assistant">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>
      <div className="typing-indicator">
        {message}
      </div>
    </div>
  );
}
