"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Vapi from "@vapi-ai/web";

export type VapiStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

interface UseVapiReturn {
  status: VapiStatus;
  isMuted: boolean;
  volume: number; // 0-1 from Vapi's volume-level event
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  toggleMute: () => void;
}

export function useVapi(): UseVapiReturn {
  const [status, setStatus] = useState<VapiStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!key) return;
    vapiRef.current = new Vapi(key);

    const vapi = vapiRef.current;

    vapi.on("call-start", () => {
      setStatus("listening");
      setError(null);
    });

    vapi.on("call-end", () => {
      setStatus("idle");
      setIsMuted(false);
      setVolume(0);
    });

    // AI is speaking (vapi-ai/web speech-start refers to the assistant)
    vapi.on("speech-start", () => {
      setStatus("speaking");
    });

    // AI stopped speaking (assistant end of turn)
    vapi.on("speech-end", () => {
      setStatus("listening");
    });

    // volume-level fires 0-1 float
    vapi.on("volume-level", (v: number) => {
      setVolume(v);
    });

    vapi.on("error", (e: Error) => {
      setError(e?.message ?? "Vapi error");
      setStatus("error");
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const start = useCallback(async () => {
    const vapi = vapiRef.current;
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!vapi || !assistantId) {
      setError("Vapi not initialised or Assistant ID missing.");
      setStatus("error");
      return;
    }
    try {
      setStatus("connecting");
      setError(null);
      await vapi.start(assistantId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start");
      setStatus("error");
    }
  }, []);

  const stop = useCallback(() => {
    vapiRef.current?.stop();
    setStatus("idle");
    setIsMuted(false);
    setVolume(0);
  }, []);

  const toggleMute = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    const next = !isMuted;
    vapi.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  return { status, isMuted, volume, error, start, stop, toggleMute };
}
