"use client";

import { useRef, useState, useEffect } from "react";

export function useAudioVisualizer(stream: MediaStream | null, isMuted: boolean) {
  const [volume, setVolume] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream || isMuted) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      return;
    }

    // Initialize AudioContext if not already created
    if (!audioContextRef.current) {
      type AudioContextConstructor = typeof globalThis.AudioContext;
      const win = window as Window & { webkitAudioContext?: AudioContextConstructor };
      const AudioContextCtor: AudioContextConstructor = win.webkitAudioContext ?? globalThis.AudioContext;
      audioContextRef.current = new AudioContextCtor();
    }

    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    // Connect stream to analyser
    analyserRef.current = audioCtx.createAnalyser();
    analyserRef.current.fftSize = 256;
    sourceRef.current = audioCtx.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkVolume = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      let maxVal = 0;
      // Focus on the lower half of frequencies where human voice resides
      const voiceRangeLength = Math.floor(bufferLength / 2);
      for (let i = 0; i < voiceRangeLength; i++) {
        if (dataArray[i] > maxVal) {
          maxVal = dataArray[i];
        }
      }
      
      // Normalize to 0-1 scale. Max value of byte frequency is 255.
      // We add a tiny threshold (e.g. 10) to ignore background static.
      const normalizedVolume = Math.max(0, (maxVal - 10) / 245);
      
      setVolume(normalizedVolume);

      animationFrameRef.current = requestAnimationFrame(checkVolume);
    };

    checkVolume();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
    };
  }, [stream, isMuted]);

  // Clean up full context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  return volume;
}
