import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { VideoChat } from "@/components/video-chat";
import { TextChat } from "@/components/text-chat";
import { ChatControls } from "@/components/chat-controls";
import { FeedbackModal } from "@/components/feedback-modal";
import { type MatchData, type ChatMessage } from "@shared/schema";
import { useWebSocket } from "@/lib/websocket-context";

export default function ChatRoom() {
  const { roomId } = useParams();
  const [, setLocation] = useLocation();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const { ws, isConnected, sendMessage } = useWebSocket();

  useEffect(() => {
    // Get match data
    const matchStr = localStorage.getItem("currentMatch");
    if (!matchStr) {
      setLocation("/");
      return;
    }

    const matchData = JSON.parse(matchStr) as MatchData;
    setMatch(matchData);

    if (!isConnected || !ws) {
      return;
    }

    const userId = localStorage.getItem("userId") || "";

    // Wait for connection to be ready before registering
    const registerRoom = () => {
      sendMessage({
        type: "register-room",
        data: { roomId: matchData.roomId, userId },
      });
    };

    // Register immediately if already connected, otherwise wait
    if (ws.readyState === WebSocket.OPEN) {
      registerRoom();
    } else {
      const handleOpen = () => {
        registerRoom();
        ws.removeEventListener("open", handleOpen);
      };
      ws.addEventListener("open", handleOpen);
    }

    // Listen for messages
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      
      if (message.type === "chat-message") {
        setMessages((prev) => [...prev, message.data]);
      } else if (message.type === "partner-left") {
        setPartnerLeft(true);
        setShowFeedback(true);
      } else if (message.type === "peer-signal") {
        // Forward to video chat component via custom event
        window.dispatchEvent(new CustomEvent("peer-signal", { detail: message.data }));
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      sendMessage({
        type: "end-chat",
        data: { roomId: matchData.roomId, userId },
      });
      ws.removeEventListener("message", handleMessage);
    };
  }, [roomId, setLocation, ws, isConnected, sendMessage]);

  const handleSendMessage = (text: string) => {
    if (match) {
      const userId = localStorage.getItem("userId") || "";
      const message: ChatMessage = {
        roomId: match.roomId,
        senderId: userId,
        text,
        timestamp: Date.now(),
      };

      sendMessage({
        type: "chat-message",
        data: message,
      });

      setMessages((prev) => [...prev, message]);
    }
  };

  const handleEndChat = () => {
    if (match) {
      const userId = localStorage.getItem("userId") || "";
      sendMessage({
        type: "end-chat",
        data: { roomId: match.roomId, userId },
      });
    }
    setShowFeedback(true);
  };

  const handleReport = (reason: string) => {
    if (match) {
      const userId = localStorage.getItem("userId") || "";
      const partnerId = match.user1.id === userId ? match.user2.id : match.user1.id;
      
      console.log("Report submitted:", { partnerId, reason });
      // In production, this would send to server
    }
  };

  const handleBlock = () => {
    if (match) {
      const userId = localStorage.getItem("userId") || "";
      const partnerId = match.user1.id === userId ? match.user2.id : match.user1.id;
      
      const blocked = JSON.parse(localStorage.getItem("blockedUsers") || "[]");
      blocked.push(partnerId);
      localStorage.setItem("blockedUsers", JSON.stringify(blocked));
      
      handleEndChat();
    }
  };

  const handleFeedbackComplete = (queueAgain: boolean) => {
    localStorage.removeItem("currentMatch");
    if (queueAgain) {
      setLocation("/matching");
    } else {
      setLocation("/");
    }
  };

  if (!match) return null;

  const userId = localStorage.getItem("userId") || "";
  const partner = match.user1.id === userId ? match.user2 : match.user1;

  return (
    <div className="h-screen flex">
      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        <VideoChat
          roomId={match.roomId}
          userId={userId}
          partnerId={partner.id}
        />
        <ChatControls
          onEndChat={handleEndChat}
          onReport={handleReport}
          onBlock={handleBlock}
        />
      </div>

      {/* Text Chat Sidebar */}
      <div className="w-full md:w-[400px] lg:w-[450px] border-l border-border bg-background flex flex-col">
        <TextChat
          messages={messages}
          userId={userId}
          partner={partner}
          onSendMessage={handleSendMessage}
          partnerLeft={partnerLeft}
        />
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          roomId={match.roomId}
          onComplete={handleFeedbackComplete}
        />
      )}
    </div>
  );
}
