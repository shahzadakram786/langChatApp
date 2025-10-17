import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, GraduationCap, ArrowLeft, Clock } from "lucide-react";
import { LANGUAGES } from "@shared/schema";
import { useWebSocket } from "@/lib/websocket-context";

export default function Matching() {
  const [, setLocation] = useLocation();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [noMatchTimeout, setNoMatchTimeout] = useState(false);
  const { ws, isConnected, sendMessage } = useWebSocket();

  // Get language preferences
  const preferencesStr = localStorage.getItem("languagePreferences");
  const preferences = preferencesStr ? JSON.parse(preferencesStr) : null;

  useEffect(() => {
    if (!preferences) {
      setLocation("/");
      return;
    }

    if (!isConnected || !ws) {
      return;
    }

    // Timer for elapsed time
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    // Timeout after 30 seconds
    const timeout = setTimeout(() => {
      setNoMatchTimeout(true);
    }, 30000);

    const userId = Math.random().toString(36).substring(7);
    localStorage.setItem("userId", userId);

    // Join queue
    sendMessage({
      type: "join-queue",
      data: {
        userId,
        nativeLanguage: preferences.nativeLanguage,
        targetLanguage: preferences.targetLanguage,
      },
    });

    // Listen for match
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      if (message.type === "match-found") {
        localStorage.setItem("currentMatch", JSON.stringify(message.data));
        setLocation(`/chat/${message.data.roomId}`);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
      // Leave queue but keep WebSocket open
      sendMessage({ type: "leave-queue", data: { userId } });
      ws.removeEventListener("message", handleMessage);
    };
  }, [preferences, setLocation, ws, isConnected, sendMessage]);

  const nativeLang = LANGUAGES.find((l) => l.code === preferences?.nativeLanguage);
  const targetLang = LANGUAGES.find((l) => l.code === preferences?.targetLanguage);

  const handleCancel = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      sendMessage({ type: "leave-queue", data: { userId } });
    }
    setLocation("/");
  };

  const handleChangeLanguages = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      sendMessage({ type: "leave-queue", data: { userId } });
    }
    setLocation("/");
  };

  if (!preferences) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {!noMatchTimeout ? (
          <>
            {/* Animated Loading Orb */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 text-primary-foreground animate-spin" />
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif font-semibold">
                Finding your partner...
              </h2>
              <p className="text-sm text-muted-foreground">
                Matching you with a language partner
              </p>
              {timeElapsed > 20 && (
                <p className="text-sm text-warning flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  Still searching... {30 - timeElapsed}s remaining
                </p>
              )}
            </div>

            {/* Language Preferences */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50" data-testid="display-native-language">
                <span className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-native-lang" />
                  <span className="text-muted-foreground">Native:</span>
                </span>
                <Badge variant="outline" className="border-native-lang/50">
                  {nativeLang?.flag} {nativeLang?.name}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50" data-testid="display-target-language">
                <span className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-target-lang" />
                  <span className="text-muted-foreground">Learning:</span>
                </span>
                <Badge variant="outline" className="border-target-lang/50">
                  {targetLang?.flag} {targetLang?.name}
                </Badge>
              </div>
            </div>

            {/* Cancel Button */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleCancel}
              data-testid="button-cancel-matching"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            {/* No Match Found */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-semibold">
                  No partners available
                </h2>
                <p className="text-sm text-muted-foreground">
                  We couldn't find a match right now. Try different languages or wait a bit longer.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                className="w-full"
                onClick={handleChangeLanguages}
                data-testid="button-change-languages"
              >
                Try Different Languages
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setNoMatchTimeout(false);
                  setTimeElapsed(0);
                  window.location.reload();
                }}
                data-testid="button-keep-waiting"
              >
                Keep Waiting
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
