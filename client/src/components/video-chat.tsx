import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/lib/websocket-context";
import Peer from "peerjs";

interface VideoProps {
  roomId: string;
  userId: string;
  partnerId: string;
}

export function VideoChat({ roomId, userId, partnerId }: VideoProps) {
  const { ws, sendMessage } = useWebSocket();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<"good" | "medium" | "poor">("medium");

  useEffect(() => {
    let peer: Peer | null = null;

    // Request media permissions and setup PeerJS
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize PeerJS with Google STUN server
        peer = new Peer(userId, {
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ]
          }
        });

        peerRef.current = peer;

        peer.on('open', (id) => {
          console.log('Peer connected with ID:', id);
          setConnectionQuality("good");
        });

        // Handle incoming calls
        peer.on('call', (call) => {
          console.log('Receiving call from:', call.peer);
          call.answer(stream);
          
          call.on('stream', (remoteStream) => {
            console.log('Received remote stream from incoming call');
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setConnectionQuality("good");
          });

          call.on('close', () => {
            console.log('Call closed');
            setConnectionQuality("poor");
          });

          call.on('error', (err) => {
            console.error('Call error:', err);
            setConnectionQuality("poor");
          });
        });

        // Make outgoing call after peer is ready (with delay to ensure both peers are ready)
        setTimeout(() => {
          if (peer && peer.id) {
            const call = peer.call(partnerId, stream);
            
            if (call) {
              call.on('stream', (remoteStream) => {
                console.log('Received remote stream from outgoing call');
                setRemoteStream(remoteStream);
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStream;
                }
                setConnectionQuality("good");
              });

              call.on('close', () => {
                console.log('Call closed');
                setConnectionQuality("poor");
              });

              call.on('error', (err) => {
                console.error('Call error:', err);
                // Try again after a short delay
                setTimeout(() => {
                  if (peer) {
                    const retryCall = peer.call(partnerId, stream);
                    if (retryCall) {
                      retryCall.on('stream', (remoteStream) => {
                        setRemoteStream(remoteStream);
                        if (remoteVideoRef.current) {
                          remoteVideoRef.current.srcObject = remoteStream;
                        }
                        setConnectionQuality("good");
                      });
                    }
                  }
                }, 2000);
              });
            }
          }
        }, 1000);

        peer.on('error', (err) => {
          console.error('Peer error:', err);
          setConnectionQuality("poor");
        });

      } catch (error) {
        console.error("Media permission error:", error);
        setPermissionDenied(true);
      }
    };

    initMedia();

    // Cleanup
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
    };
  }, [userId, partnerId]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        };
      } catch (error) {
        console.error("Screen share error:", error);
      }
    } else {
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      setIsScreenSharing(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Partner Video (Main) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${!remoteStream ? 'hidden' : ''}`}
        data-testid="video-partner"
      />
      
      {/* Placeholder for partner video */}
      {!remoteStream && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
              <Video className="h-12 w-12 text-primary" />
            </div>
            <p className="text-lg text-foreground/80">Connecting to partner...</p>
          </div>
        </div>
      )}

      {/* Self Video (Picture-in-Picture) */}
      <div className="absolute bottom-24 right-6 w-48 h-36 rounded-md overflow-hidden border-2 border-border bg-black shadow-xl">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror"
          data-testid="video-self"
        />
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <VideoOff className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Connection Quality Indicator */}
      <div className="absolute top-6 left-6">
        <Badge variant="outline" className="backdrop-blur-sm bg-black/40 border-border/50" data-testid="connection-status">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionQuality === "good" ? "bg-native-lang" :
              connectionQuality === "medium" ? "bg-target-lang" :
              "bg-destructive"
            } animate-pulse`} />
            <span className="text-xs text-foreground">
              {connectionQuality === "good" ? "Connected" :
               connectionQuality === "medium" ? "Connecting" :
               "Poor Connection"}
            </span>
          </div>
        </Badge>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-3 p-3 rounded-full backdrop-blur-xl bg-black/40 border border-border/30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={isMuted ? "destructive" : "secondary"}
                className="rounded-full h-12 w-12"
                onClick={toggleMute}
                data-testid="button-toggle-mic"
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={isVideoOff ? "destructive" : "secondary"}
                className="rounded-full h-12 w-12"
                onClick={toggleVideo}
                data-testid="button-toggle-video"
                aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isVideoOff ? "Turn on camera" : "Turn off camera"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={isScreenSharing ? "default" : "secondary"}
                className="rounded-full h-12 w-12"
                onClick={toggleScreenShare}
                data-testid="button-toggle-screen"
                aria-label={isScreenSharing ? "Stop sharing" : "Share screen"}
              >
                {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isScreenSharing ? "Stop sharing" : "Share screen"}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Permission Denied */}
      {permissionDenied && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="max-w-md p-6 rounded-lg bg-card text-center space-y-4">
            <VideoOff className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="text-lg font-semibold">Camera/Microphone Access Needed</h3>
            <p className="text-sm text-muted-foreground">
              Please enable camera and microphone permissions in your browser settings to use video chat.
            </p>
            <Button onClick={() => window.location.reload()} data-testid="button-retry-permissions">
              Try Again
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
