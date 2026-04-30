export type MessageRole = "user" | "assistant";
export type MessageSource = "chat" | "voice";
export type VoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  source?: MessageSource;
}
