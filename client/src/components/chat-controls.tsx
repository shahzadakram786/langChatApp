import { useState } from "react";
import { PhoneOff, Flag, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MoreVertical } from "lucide-react";

interface ChatControlsProps {
  onEndChat: () => void;
  onReport: (reason: string) => void;
  onBlock: () => void;
}

export function ChatControls({ onEndChat, onReport, onBlock }: ChatControlsProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [reportReason, setReportReason] = useState("inappropriate");

  const handleReport = () => {
    onReport(reportReason);
    setShowReportDialog(false);
  };

  const handleBlock = () => {
    onBlock();
    setShowBlockDialog(false);
  };

  return (
    <>
      {/* Main Controls - Top Right */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <Button
          variant="destructive"
          onClick={onEndChat}
          data-testid="button-end-chat"
          className="backdrop-blur-sm bg-destructive/90 hover:bg-destructive"
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          End Chat
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="backdrop-blur-sm bg-black/40 hover:bg-black/60"
              data-testid="button-more-options"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowReportDialog(true)} data-testid="button-report">
              <Flag className="h-4 w-4 mr-2" />
              Report User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowBlockDialog(true)} data-testid="button-block">
              <Ban className="h-4 w-4 mr-2" />
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report User</DialogTitle>
            <DialogDescription>
              Please select a reason for reporting this user. All reports are anonymous.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={reportReason} onValueChange={setReportReason}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inappropriate" id="inappropriate" />
              <Label htmlFor="inappropriate">Inappropriate behavior</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spam" id="spam" />
              <Label htmlFor="spam">Spam or advertising</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="harassment" id="harassment" />
              <Label htmlFor="harassment">Harassment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReport} data-testid="button-submit-report">
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
            <DialogDescription>
              You won't be matched with this user again. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlock} data-testid="button-confirm-block">
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
