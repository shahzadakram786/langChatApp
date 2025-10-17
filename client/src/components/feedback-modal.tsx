import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackModalProps {
  roomId: string;
  onComplete: (queueAgain: boolean) => void;
}

export function FeedbackModal({ roomId, onComplete }: FeedbackModalProps) {
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);

  const handleRating = (value: "positive" | "negative") => {
    setRating(value);
    setShowComment(true);
  };

  const handleSubmit = (queueAgain: boolean) => {
    if (rating) {
      console.log("Feedback submitted:", { roomId, rating, comment });
      // In production, this would send to server
    }
    onComplete(queueAgain);
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">How was your conversation?</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve the experience for everyone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!showComment ? (
            <div className="flex items-center justify-center gap-8">
              <Button
                variant="outline"
                size="lg"
                className="h-24 w-24 rounded-full flex-col gap-2 hover:bg-native-lang/10 hover:border-native-lang"
                onClick={() => handleRating("positive")}
                data-testid="button-feedback-positive"
              >
                <ThumbsUp className="h-10 w-10" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-24 w-24 rounded-full flex-col gap-2 hover:bg-destructive/10 hover:border-destructive"
                onClick={() => handleRating("negative")}
                data-testid="button-feedback-negative"
              >
                <ThumbsDown className="h-10 w-10" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                {rating === "positive" ? (
                  <div className="inline-flex items-center gap-2 text-native-lang">
                    <ThumbsUp className="h-6 w-6" />
                    <span className="font-semibold">Great!</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 text-destructive">
                    <ThumbsDown className="h-6 w-6" />
                    <span className="font-semibold">We're sorry to hear that</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Any suggestions? (optional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us more..."
                  className="resize-none"
                  rows={3}
                  data-testid="textarea-feedback-comment"
                />
              </div>
            </div>
          )}
        </div>

        {showComment && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => handleSubmit(false)}
              data-testid="button-exit"
            >
              Exit
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => handleSubmit(true)}
              data-testid="button-queue-again"
            >
              Queue Again
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
