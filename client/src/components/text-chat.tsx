import { useState, useRef, useEffect } from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type ChatMessage } from "@shared/schema";
import { LANGUAGES } from "@shared/schema";
import { format } from "date-fns";

interface TextChatProps {
  messages: ChatMessage[];
  userId: string;
  partner: {
    id: string;
    nativeLanguage: string;
    targetLanguage: string;
  };
  onSendMessage: (text: string) => void;
  partnerLeft: boolean;
}

export function TextChat({ messages, userId, partner, onSendMessage, partnerLeft }: TextChatProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() && !partnerLeft) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const partnerNativeLang = LANGUAGES.find((l) => l.code === partner.nativeLanguage);
  const partnerTargetLang = LANGUAGES.find((l) => l.code === partner.targetLanguage);

  return (
    <div className="flex flex-col h-full">
      {/* Header with Partner Info */}
      <div className="p-4 border-b border-border space-y-3">
        <h3 className="font-semibold">Chat</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm" data-testid="partner-native-language">
            <span className="text-muted-foreground">Partner speaks:</span>
            <Badge variant="outline" className="border-native-lang/50 text-native-lang">
              {partnerNativeLang?.flag} {partnerNativeLang?.name}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm" data-testid="partner-target-language">
            <span className="text-muted-foreground">Learning:</span>
            <Badge variant="outline" className="border-target-lang/50 text-target-lang">
              {partnerTargetLang?.flag} {partnerTargetLang?.name}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Say hello to your partner!
            </div>
          )}
          
          {messages.map((message, index) => {
            const isOwn = message.senderId === userId;
            return (
              <div
                key={`${message.timestamp}-${index}`}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                data-testid={`message-${isOwn ? "own" : "partner"}-${index}`}
              >
                <div className={`max-w-[80%] space-y-1 ${isOwn ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-card-border"
                    }`}
                  >
                    <p className="text-sm break-words">{message.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground px-2">
                    {format(new Date(message.timestamp), "HH:mm")}
                  </span>
                </div>
              </div>
            );
          })}

          {partnerLeft && (
            <div className="text-center py-4">
              <Badge variant="outline" className="border-destructive/50 text-destructive">
                Partner has left the chat
              </Badge>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={partnerLeft ? "Partner left the chat" : "Type a message..."}
            disabled={partnerLeft}
            className="flex-1"
            data-testid="input-message"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputText.trim() || partnerLeft}
            data-testid="button-send-message"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
