"use client";

import { Mic, MicOff, PhoneOff, Phone } from "lucide-react";
import { VoiceStatus, ChatMessage } from "./types";
// import { useVoiceSession } from "../../hooks/useVoiceSession";
import { useAudioVisualizer } from "../../hooks/useAudioVisualizer";
import { MessageBubble } from "./MessageBubble";

interface VoicePanelProps {
  messages: ChatMessage[];
  onMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
}

const STATUS_LABELS: Record<VoiceStatus, string> = {
  idle: "Press Start to begin",
  connecting: "Connecting…",
  listening: "Listening…",
  speaking: "Speaking…",
  error: "Connection error",
};

const STATUS_COLORS: Record<VoiceStatus, string> = {
  idle: "orb--idle",
  connecting: "orb--connecting",
  listening: "orb--listening",
  speaking: "orb--speaking",
  error: "orb--error",
};

export function VoicePanel({ messages, onMessage }: VoicePanelProps) {
  // const { status, isMuted, start, stop, toggleMute, error, localStream } = useVoiceSession({
  //   onMessage,
  // });

  // Mocking status and localStream for the visualizer to stay "idle" but keep the code
  const status = "idle" as VoiceStatus;
  const isMuted = false;
  const localStream = null;
  const error = null;
  const start = () => {};
  const stop = () => {};
  const toggleMute = () => {};

  const volume = useAudioVisualizer(localStream, isMuted);

  const isActive = status !== "idle" && status !== "error";
  const voiceMessages = messages.filter((m) => m.source === "voice");

  return (
    <div className="voice-panel">
      {/* Orb */}
      <div 
        className="orb-container" 
        style={{ "--volume": volume } as React.CSSProperties}
      >
        <div className={`orb ${STATUS_COLORS[status as VoiceStatus]}`}>
          <div className="orb-ring orb-ring-1" />
          <div className="orb-ring orb-ring-2" />
          <div className="orb-ring orb-ring-3" />
          <div className="orb-core">
            {isActive ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a9 9 0 100 18A9 9 0 0012 3zm-1 13V8l6 4-6 4z" />
              </svg>
            )}
          </div>
        </div>

        {/* Status */}
        <p className={`voice-status ${status === "error" ? "voice-status--error" : ""}`}>
          {STATUS_LABELS[status as VoiceStatus]}
        </p>
        {error && status === "error" && (
          <p className="voice-error-detail">{error}</p>
        )}
      </div>

      {/* Controls */}
      <div className="voice-controls">
        {!isActive ? (
          <button className="voice-btn voice-btn--start" onClick={start}>
            <Phone size={20} />
            <span>Start</span>
          </button>
        ) : (
          <>
            <button
              className={`voice-btn voice-btn--mute ${isMuted ? "voice-btn--muted" : ""}`}
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span>{isMuted ? "Unmute" : "Mute"}</span>
            </button>
            <button className="voice-btn voice-btn--stop" onClick={stop}>
              <PhoneOff size={20} />
              <span>End</span>
            </button>
          </>
        )}
      </div>


      <p className="voice-hint">
        {isActive
          ? isMuted
            ? "🔇 You are muted — AI cannot hear you"
            : "🎙️ Speak naturally — AI will respond in real time"
          : "Voice conversations are transcribed to the Chat tab"}
      </p>
    </div>
  );
}
