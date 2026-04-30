"use client";

import { Mic, MicOff, PhoneOff, Phone } from "lucide-react";
import { useVapi, VapiStatus } from "../../hooks/useVapi";

const STATUS_LABELS: Record<VapiStatus, string> = {
  idle: "Press Start to begin",
  connecting: "Connecting…",
  listening: "Listening…",
  speaking: "Speaking…",
  error: "Connection error",
};

const STATUS_COLORS: Record<VapiStatus, string> = {
  idle: "orb--idle",
  connecting: "orb--connecting",
  listening: "orb--listening",
  speaking: "orb--speaking",
  error: "orb--error",
};

export function VapiVoicePanel() {
  const { status, isMuted, volume, error, start, stop, toggleMute } = useVapi();

  const isActive = status === "listening" || status === "speaking" || status === "connecting";

  return (
    <div className="voice-panel">
      {/* Orb with real-time volume from Vapi */}
      <div
        className="orb-container"
        style={{ "--volume": volume } as React.CSSProperties}
      >
        <div className={`orb ${STATUS_COLORS[status]}`}>
          <div className="orb-ring orb-ring-1" />
          <div className="orb-ring orb-ring-2" />
          <div className="orb-ring orb-ring-3" />
          <div className="orb-core">
            {isActive && status !== "connecting" ? (
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

        {/* Status text */}
        <p className={`voice-status ${status === "error" ? "voice-status--error" : ""}`}>
          {STATUS_LABELS[status]}
        </p>
        {error && status === "error" && (
          <p className="voice-error-detail">{error}</p>
        )}
      </div>

      {/* Controls */}
      <div className="voice-controls">
        {status === "idle" || status === "error" ? (
          <button className="voice-btn voice-btn--start" onClick={start}>
            <Phone size={20} />
            <span>Start Call</span>
          </button>
        ) : status === "connecting" ? (
          <button className="voice-btn voice-btn--start" disabled>
            <span>Connecting…</span>
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
              <span>End Call</span>
            </button>
          </>
        )}
      </div>

      <p className="voice-hint">
        {status === "listening"
          ? isMuted
            ? "🔇 You are muted — AI cannot hear you"
            : "🎙️ Speak naturally — AI is listening"
          : status === "speaking"
            ? "🤖 AI is responding…"
            : status === "connecting"
              ? "⏳ Establishing connection…"
              : "Voice conversations powered by GalaxAI Studio"}
      </p>
    </div>
  );
}
