import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, GraduationCap, Video, MessageCircle, Shield, Lock, DollarSign } from "lucide-react";
import { LANGUAGES, type LanguagePreferences } from "@shared/schema";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [preferences, setPreferences] = useState<Partial<LanguagePreferences>>({
    nativeLanguage: "",
    targetLanguage: "",
  });

  const handleStartChat = () => {
    if (preferences.nativeLanguage && preferences.targetLanguage) {
      localStorage.setItem("languagePreferences", JSON.stringify(preferences));
      setLocation("/matching");
    }
  };

  const isValid = preferences.nativeLanguage && preferences.targetLanguage && 
                  preferences.nativeLanguage !== preferences.targetLanguage;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold">LangChat</h2>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-4 pt-24 pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background -z-10" />
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
            Practice Languages with Real People
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect instantly with native speakers worldwide. Learn through conversation, not textbooks.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              100% Anonymous
            </span>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              No Signup Required
            </span>
            <span className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Free Forever
            </span>
          </div>
        </div>
      </section>

      {/* Language Selection */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h3 className="text-2xl font-serif font-semibold mb-6 text-center">
              Choose Your Languages
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Native Language */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-5 w-5 text-native-lang" />
                  I speak
                </label>
                <Select
                  value={preferences.nativeLanguage}
                  onValueChange={(value) =>
                    setPreferences((prev) => ({ ...prev, nativeLanguage: value }))
                  }
                >
                  <SelectTrigger 
                    className="w-full border-native-lang/30 focus:border-native-lang"
                    data-testid="select-native-language"
                  >
                    <SelectValue placeholder="Select your native language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} data-testid={`option-native-${lang.code}`}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Language */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <GraduationCap className="h-5 w-5 text-target-lang" />
                  I want to practice
                </label>
                <Select
                  value={preferences.targetLanguage}
                  onValueChange={(value) =>
                    setPreferences((prev) => ({ ...prev, targetLanguage: value }))
                  }
                >
                  <SelectTrigger 
                    className="w-full border-target-lang/30 focus:border-target-lang"
                    data-testid="select-target-language"
                  >
                    <SelectValue placeholder="Select language to learn" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} data-testid={`option-target-${lang.code}`}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={!isValid}
              onClick={handleStartChat}
              data-testid="button-start-practicing"
            >
              Start Practicing Now
            </Button>

            {preferences.nativeLanguage && preferences.targetLanguage === preferences.nativeLanguage && (
              <p className="text-sm text-destructive text-center mt-4">
                Please select different languages for native and target
              </p>
            )}
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                <span className="text-2xl font-bold">1</span>
              </div>
              <Globe className="h-8 w-8 mx-auto text-primary" />
              <h4 className="text-lg font-semibold">Select Languages</h4>
              <p className="text-sm text-muted-foreground">
                Choose your native language and the language you want to practice
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                <span className="text-2xl font-bold">2</span>
              </div>
              <Video className="h-8 w-8 mx-auto text-primary" />
              <h4 className="text-lg font-semibold">Get Matched</h4>
              <p className="text-sm text-muted-foreground">
                We connect you with someone learning your native language
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                <span className="text-2xl font-bold">3</span>
              </div>
              <MessageCircle className="h-8 w-8 mx-auto text-primary" />
              <h4 className="text-lg font-semibold">Start Practicing</h4>
              <p className="text-sm text-muted-foreground">
                Practice through video and text chat in a safe environment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>All chats are anonymous and temporary. No data is stored.</p>
        </div>
      </footer>
    </div>
  );
}
