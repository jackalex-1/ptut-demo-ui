import { useState, useRef, useCallback, useEffect } from "react";

interface UseWhisperOptions {
  onTranscribe?: (text: string) => void;
}

export function useWhisper(options?: UseWhisperOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Audio analysis refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track recording state safely for callbacks
  const isRecordingRef = useRef(false);
  
  // Options ref to ensure latest callback is used without dependency loops
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const cleanupAudioTools = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(console.error);
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    isRecordingRef.current = false;
  };

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
        resolve(null);
        return;
      }

      cleanupAudioTools();
      setIsRecording(false);
      setIsTranscribing(true);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        
        try {
          const formData = new FormData();
          formData.append("file", audioBlob);

          const response = await fetch("/api/whisper", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Transcription failed");
          }

          const data = await response.json();
          if (data.text && optionsRef.current?.onTranscribe) {
            optionsRef.current.onTranscribe(data.text);
          }
          resolve(data.text);
        } catch (error) {
          console.error("Transcription error:", error);
          resolve(null);
        } finally {
          setIsTranscribing(false);
          // Stop all streams
          mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
          mediaRecorderRef.current = null;
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // Set up Audio Context for Silence Detection
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.minDecibels = -70;
      analyser.maxDecibels = -10;
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      mediaRecorder.start();
      setIsRecording(true);
      isRecordingRef.current = true;

      // 1-minute max recording limit
      maxDurationTimerRef.current = setTimeout(() => {
        stopRecording();
      }, 60000);

      // Silence detection loop
      const checkSilence = () => {
        if (!isRecordingRef.current) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avgVolume = sum / bufferLength;

        // If speaking (volume above a small noise floor)
        if (avgVolume > 15) {
          // Clear silence timer because the user is speaking
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else {
          // It's silent, start silence timer if not already ticking
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              stopRecording();
            }, 3000); // 3 seconds of silence
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkSilence);
      };

      checkSilence();

    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone.");
    }
  }, [stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupAudioTools();
  }, []);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
  };
}
