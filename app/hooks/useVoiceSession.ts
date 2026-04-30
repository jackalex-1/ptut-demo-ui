"use client";

import { useRef, useState, useCallback } from "react";
import { ChatMessage, VoiceStatus } from "../components/chat/types";

interface UseVoiceSessionOptions {
  onMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
}

interface UseVoiceSessionReturn {
  status: VoiceStatus;
  isMuted: boolean;
  start: () => Promise<void>;
  stop: () => void;
  toggleMute: () => void;
  error: string | null;
  localStream: MediaStream | null;
}

export function useVoiceSession({ onMessage }: UseVoiceSessionOptions): UseVoiceSessionReturn {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Accumulate delta text per response item
  const transcriptBufferRef = useRef<Record<string, { role: "user" | "assistant"; text: string }>>({});

  const stop = useCallback(() => {
    dcRef.current?.close();
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    pcRef.current = null;
    dcRef.current = null;
    localStreamRef.current = null;
    transcriptBufferRef.current = {};
    setStatus("idle");
    setIsMuted(false);
  }, []);

  const start = useCallback(async () => {
    try {
      setStatus("connecting");
      setError(null);

      // 1. Get ephemeral token from our server
      const tokenRes = await fetch("/api/realtime-session", { method: "POST" });
      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        throw new Error(err.error || "Failed to get session token");
      }
      const { client_secret } = await tokenRes.json();
      const ephemeralKey = client_secret.value;

      // 2. Set up RTCPeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 3. Audio output — pipe remote track to hidden audio element
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioRef.current = audioEl;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      // 4. Mic input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 5. Data channel for events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.addEventListener("open", () => {
        setStatus("listening");
      });

      dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          handleRealtimeEvent(event);
        } catch {
          // ignore malformed
        }
      });

      dc.addEventListener("close", () => {
        setStatus("idle");
      });

      // 6. SDP Offer → OpenAI signaling
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      );

      if (!sdpRes.ok) {
        throw new Error(`SDP exchange failed: ${sdpRes.status}`);
      }

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Voice connection failed";
      setError(msg);
      setStatus("error");
      stop();
    }
  }, [stop]);

  const handleRealtimeEvent = useCallback(
    (event: Record<string, unknown>) => {
      const type = event.type as string;

      switch (type) {
        // User speech transcript (input audio)
        case "conversation.item.input_audio_transcription.completed": {
          const transcript = event.transcript as string;
          if (transcript?.trim()) {
            onMessage({ role: "user", content: transcript.trim(), source: "voice" });
          }
          break;
        }

        // AI response text delta — accumulate per item
        case "response.audio_transcript.delta": {
          const itemId = event.item_id as string;
          const delta = event.delta as string;
          if (!transcriptBufferRef.current[itemId]) {
            transcriptBufferRef.current[itemId] = { role: "assistant", text: "" };
          }
          transcriptBufferRef.current[itemId].text += delta;
          setStatus("speaking");
          break;
        }

        // AI response text complete — push to shared messages
        case "response.audio_transcript.done": {
          const itemId = event.item_id as string;
          const buffer = transcriptBufferRef.current[itemId];
          if (buffer?.text.trim()) {
            onMessage({ role: "assistant", content: buffer.text.trim(), source: "voice" });
            delete transcriptBufferRef.current[itemId];
          }
          setStatus("listening");
          break;
        }

        case "input_audio_buffer.speech_started": {
          setStatus("listening");
          break;
        }

        case "error": {
          const errObj = event.error as { message?: string };
          setError(errObj?.message || "Realtime API error");
          setStatus("error");
          break;
        }
      }
    },
    [onMessage]
  );

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTracks = localStreamRef.current.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted((prev) => !prev);
  }, []);

  return { status, isMuted, start, stop, toggleMute, error, localStream: localStreamRef.current };
}
