import { randomUUID } from "crypto";
import { type MatchData, type ChatMessage } from "@shared/schema";

export interface IStorage {
  // Match/Room management
  createMatch(user1: MatchData["user1"], user2: MatchData["user2"]): Promise<MatchData>;
  getMatch(roomId: string): Promise<MatchData | undefined>;
  deleteMatch(roomId: string): Promise<void>;
  
  // Message management
  addMessage(message: ChatMessage): Promise<void>;
  getMessages(roomId: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private matches: Map<string, MatchData>;
  private messages: Map<string, ChatMessage[]>;

  constructor() {
    this.matches = new Map();
    this.messages = new Map();
  }

  async createMatch(
    user1: MatchData["user1"],
    user2: MatchData["user2"]
  ): Promise<MatchData> {
    const roomId = randomUUID();
    const match: MatchData = {
      roomId,
      user1,
      user2,
      createdAt: new Date(),
    };
    
    this.matches.set(roomId, match);
    this.messages.set(roomId, []);
    
    return match;
  }

  async getMatch(roomId: string): Promise<MatchData | undefined> {
    return this.matches.get(roomId);
  }

  async deleteMatch(roomId: string): Promise<void> {
    this.matches.delete(roomId);
    this.messages.delete(roomId);
  }

  async addMessage(message: ChatMessage): Promise<void> {
    const roomMessages = this.messages.get(message.roomId) || [];
    roomMessages.push(message);
    this.messages.set(message.roomId, roomMessages);
  }

  async getMessages(roomId: string): Promise<ChatMessage[]> {
    return this.messages.get(roomId) || [];
  }
}

export const storage = new MemStorage();
