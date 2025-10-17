import { z } from "zod";

// Language options for the platform
export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "zh", name: "Mandarin", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
] as const;

export type LanguageCode = typeof LANGUAGES[number]["code"];

// User language preferences
export const languagePreferencesSchema = z.object({
  nativeLanguage: z.string(),
  targetLanguage: z.string(),
});

export type LanguagePreferences = z.infer<typeof languagePreferencesSchema>;

// Match/Room data
export interface MatchData {
  roomId: string;
  user1: {
    id: string;
    nativeLanguage: string;
    targetLanguage: string;
  };
  user2: {
    id: string;
    nativeLanguage: string;
    targetLanguage: string;
  };
  createdAt: Date;
}

// Chat message
export const messageSchema = z.object({
  roomId: z.string(),
  senderId: z.string(),
  text: z.string().min(1).max(1000),
  timestamp: z.number(),
});

export type ChatMessage = z.infer<typeof messageSchema>;

// Report user
export const reportSchema = z.object({
  roomId: z.string(),
  reportedUserId: z.string(),
  reason: z.enum(["inappropriate", "spam", "harassment", "other"]),
  description: z.string().optional(),
});

export type Report = z.infer<typeof reportSchema>;

// Feedback
export const feedbackSchema = z.object({
  roomId: z.string(),
  rating: z.enum(["positive", "negative"]),
  comment: z.string().optional(),
});

export type Feedback = z.infer<typeof feedbackSchema>;

// WebSocket message types
export type WSMessage = 
  | { type: "join-queue"; data: { userId: string; nativeLanguage: string; targetLanguage: string } }
  | { type: "leave-queue"; data: { userId: string } }
  | { type: "register-room"; data: { roomId: string; userId: string } }
  | { type: "match-found"; data: MatchData }
  | { type: "chat-message"; data: ChatMessage }
  | { type: "peer-signal"; data: { roomId: string; signal: any; from: string; to: string } }
  | { type: "end-chat"; data: { roomId: string; userId: string } }
  | { type: "partner-left"; data: { roomId: string } }
  | { type: "error"; data: { message: string } };
