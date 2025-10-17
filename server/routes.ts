import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { WSMessage, MatchData } from "@shared/schema";

interface QueueUser {
  userId: string;
  nativeLanguage: string;
  targetLanguage: string;
  ws: WebSocket;
  joinedAt: Date;
}

interface ConnectedUser {
  userId: string;
  roomId: string;
  ws: WebSocket;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Create WebSocket server on /ws path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const queue: QueueUser[] = [];
  const connectedUsers = new Map<string, ConnectedUser>();

  // Find a match for a user in the queue
  function findMatch(user: QueueUser): QueueUser | null {
    // Find someone whose target language is our native language
    // AND whose native language is our target language
    const match = queue.find(
      (other) =>
        other.userId !== user.userId &&
        other.targetLanguage === user.nativeLanguage &&
        other.nativeLanguage === user.targetLanguage
    );

    if (match) {
      // Remove from queue
      const index = queue.indexOf(match);
      if (index > -1) {
        queue.splice(index, 1);
      }
      return match;
    }

    // If no perfect match, find someone learning the same language
    const partialMatch = queue.find(
      (other) =>
        other.userId !== user.userId &&
        (other.targetLanguage === user.nativeLanguage ||
          other.nativeLanguage === user.targetLanguage)
    );

    if (partialMatch) {
      const index = queue.indexOf(partialMatch);
      if (index > -1) {
        queue.splice(index, 1);
      }
      return partialMatch;
    }

    return null;
  }

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());

        switch (message.type) {
          case 'register-room': {
            const { roomId, userId } = message.data;
            connectedUsers.set(userId, {
              userId,
              roomId,
              ws,
            });
            console.log(`User ${userId} registered for room ${roomId}`);
            break;
          }

          case 'join-queue': {
            const { userId, nativeLanguage, targetLanguage } = message.data;
            
            // Check if user is already in queue
            const existingIndex = queue.findIndex(u => u.userId === userId);
            if (existingIndex > -1) {
              queue.splice(existingIndex, 1);
            }

            // Try to find a match
            const queueUser: QueueUser = {
              userId,
              nativeLanguage,
              targetLanguage,
              ws,
              joinedAt: new Date(),
            };

            const match = findMatch(queueUser);

            if (match) {
              // Create a match
              const matchData = await storage.createMatch(
                {
                  id: queueUser.userId,
                  nativeLanguage: queueUser.nativeLanguage,
                  targetLanguage: queueUser.targetLanguage,
                },
                {
                  id: match.userId,
                  nativeLanguage: match.nativeLanguage,
                  targetLanguage: match.targetLanguage,
                }
              );

              // Store connected users
              connectedUsers.set(queueUser.userId, {
                userId: queueUser.userId,
                roomId: matchData.roomId,
                ws: queueUser.ws,
              });
              connectedUsers.set(match.userId, {
                userId: match.userId,
                roomId: matchData.roomId,
                ws: match.ws,
              });

              // Notify both users
              const matchMessage: WSMessage = {
                type: 'match-found',
                data: matchData,
              };

              if (queueUser.ws.readyState === WebSocket.OPEN) {
                queueUser.ws.send(JSON.stringify(matchMessage));
              }
              if (match.ws.readyState === WebSocket.OPEN) {
                match.ws.send(JSON.stringify(matchMessage));
              }

              console.log(`Match created: ${matchData.roomId}`);
            } else {
              // Add to queue
              queue.push(queueUser);
              console.log(`User ${userId} added to queue. Queue size: ${queue.length}`);
            }
            break;
          }

          case 'leave-queue': {
            const { userId } = message.data;
            const index = queue.findIndex(u => u.userId === userId);
            if (index > -1) {
              queue.splice(index, 1);
              console.log(`User ${userId} left queue. Queue size: ${queue.length}`);
            }
            break;
          }

          case 'chat-message': {
            const { roomId, senderId, text, timestamp } = message.data;
            
            // Store message
            await storage.addMessage(message.data);

            // Broadcast to room
            const match = await storage.getMatch(roomId);
            if (match) {
              const partnerId = match.user1.id === senderId ? match.user2.id : match.user1.id;
              const partner = connectedUsers.get(partnerId);

              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify(message));
              }
            }
            break;
          }

          case 'peer-signal': {
            const { roomId, signal, from } = message.data;
            
            // Forward signal to partner
            const match = await storage.getMatch(roomId);
            if (match) {
              const partnerId = match.user1.id === from ? match.user2.id : match.user1.id;
              const partner = connectedUsers.get(partnerId);

              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify(message));
              }
            }
            break;
          }

          case 'end-chat': {
            const { roomId, userId } = message.data;
            
            const match = await storage.getMatch(roomId);
            if (match) {
              const partnerId = match.user1.id === userId ? match.user2.id : match.user1.id;
              const partner = connectedUsers.get(partnerId);

              // Notify partner
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify({
                  type: 'partner-left',
                  data: { roomId },
                }));
              }

              // Cleanup
              connectedUsers.delete(userId);
              connectedUsers.delete(partnerId);
              await storage.deleteMatch(roomId);
              
              console.log(`Chat ended: ${roomId}`);
            }
            break;
          }

          default:
            console.log('Unknown message type:', message);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            data: { message: 'Server error' },
          }));
        }
      }
    });

    ws.on('close', () => {
      // Remove from queue if present
      const queueIndex = queue.findIndex(u => u.ws === ws);
      if (queueIndex > -1) {
        const user = queue[queueIndex];
        queue.splice(queueIndex, 1);
        console.log(`User ${user.userId} disconnected from queue`);
      }

      // Remove from connected users and notify partner
      connectedUsers.forEach(async (user, userId) => {
        if (user.ws === ws) {
          const match = await storage.getMatch(user.roomId);
          if (match) {
            const partnerId = match.user1.id === userId ? match.user2.id : match.user1.id;
            const partner = connectedUsers.get(partnerId);

            if (partner && partner.ws.readyState === WebSocket.OPEN) {
              partner.ws.send(JSON.stringify({
                type: 'partner-left',
                data: { roomId: user.roomId },
              }));
            }

            await storage.deleteMatch(user.roomId);
          }
          connectedUsers.delete(userId);
        }
      });

      console.log('WebSocket disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // API endpoint for reports (logging only)
  app.post('/api/report', (req, res) => {
    console.log('User report:', req.body);
    res.json({ success: true });
  });

  return httpServer;
}
