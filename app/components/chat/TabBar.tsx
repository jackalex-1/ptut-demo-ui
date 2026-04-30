"use client";

import { MessageSquare, Mic } from "lucide-react";

type Tab = "chat" | "voice";

interface TabBarProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div className="tab-bar">
      <button
        className={`tab-btn ${activeTab === "chat" ? "tab-btn--active" : ""}`}
        onClick={() => onChange("chat")}
      >
        <MessageSquare size={15} />
        <span>Chat</span>
      </button>
      <button
        className={`tab-btn ${activeTab === "voice" ? "tab-btn--active" : ""}`}
        onClick={() => onChange("voice")}
      >
        <Mic size={15} />
        <span>Voice</span>
      </button>
    </div>
  );
}
