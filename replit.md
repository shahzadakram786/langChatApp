# LangChat - Language Learning Video Chat Platform

## Overview
A real-time language learning platform that connects users with native speakers for practice through video and text chat. Users are matched based on their language preferences (where one person's target language matches another's native language). The platform is completely anonymous with no user accounts required.

## Current State
**MVP Complete**: Fully functional language learning video chat platform
- ✅ All frontend components with exceptional visual quality
- ✅ Backend WebSocket server with matching queue logic
- ✅ PeerJS integration for WebRTC video streaming
- ✅ Real-time text chat and messaging
- ✅ Dark mode support with theme toggle
- ✅ Comprehensive error handling and retry logic
- ✅ Responsive design for mobile and desktop
- ✅ All interactive elements have data-testid attributes for testing

## Recent Changes (Latest First)
- **2025-10-17**: Implemented WebSocket context provider for single shared connection
  - Created WebSocketProvider to manage a single WebSocket throughout app lifecycle
  - Fixed critical lifecycle issue where multiple WebSocket connections caused message loss
  - All pages now use shared WebSocket via useWebSocket hook
  - Proper connection state management and message routing
- **2025-10-17**: Fixed critical WebSocket lifecycle and PeerJS integration
  - Added register-room message type for proper chat room connection
  - Implemented PeerJS retry logic and error handling
  - Added comprehensive data-testid attributes for testing
  - Fixed WebSocket cleanup between matching and chat pages
- **2025-10-17**: Implemented complete backend WebSocket server
  - Smart matching algorithm (target language matches partner's native)
  - Message broadcasting and peer signaling support
  - Room registration and cleanup logic
- **2025-10-17**: Created comprehensive frontend with all components
  - Built Landing page with hero section and language selection
  - Created MatchingQueue component with timeout handling
  - Implemented ChatRoom with VideoChat and TextChat components
  - Added ChatControls with report/block functionality
  - Created FeedbackModal for post-chat experience
  - Implemented ThemeProvider for dark mode support
  - Configured design tokens in tailwind.config.ts
  - Added Inter and Manrope fonts

## Project Architecture

### Frontend Stack
- **Framework**: React with Vite
- **Routing**: Wouter
- **Styling**: Tailwind CSS + Shadcn UI components
- **State**: React hooks (useState, useEffect)
- **Fonts**: Inter (body), Manrope (headings)
- **Dark Mode**: Class-based theme switching with localStorage persistence

### Backend Stack (To be implemented)
- **Server**: Express.js
- **WebSockets**: Native WebSocket (ws package)
- **Storage**: In-memory (MemStorage)
- **Real-time**: WebSocket signaling for WebRTC

### Key Features
1. **Language Selection**: 12 languages supported with flag emojis
2. **Smart Matching**: Pairs users where target language matches partner's native language
3. **Video Chat**: WebRTC with camera/mic/screen sharing controls
4. **Text Chat**: Real-time messaging with timestamps
5. **Safety Features**: Report, block, and end chat controls
6. **Feedback System**: Post-chat rating and comments
7. **Anonymous Sessions**: No accounts, localStorage for preferences only

### File Structure
```
client/src/
├── pages/
│   ├── landing.tsx          # Hero, language selection, how it works
│   ├── matching.tsx         # Queue with timeout handling
│   ├── chat-room.tsx        # Main chat container
│   └── not-found.tsx        # 404 page
├── components/
│   ├── theme-provider.tsx   # Dark mode context
│   ├── theme-toggle.tsx     # Theme switcher button
│   ├── video-chat.tsx       # WebRTC video with controls
│   ├── text-chat.tsx        # Message list and input
│   ├── chat-controls.tsx    # End/report/block buttons
│   └── feedback-modal.tsx   # Post-chat feedback
└── ui/                      # Shadcn components

shared/
└── schema.ts                # Types and WebSocket message definitions

server/
├── routes.ts                # API and WebSocket server (to be implemented)
└── storage.ts               # In-memory storage interface
```

### Design System
- **Colors**: 
  - Primary: Trust blue (217 91% 60%)
  - Native language: Green (142 71% 45%)
  - Target language: Amber (43 87% 55%)
  - Destructive: Red (0 84% 60%)
- **Spacing**: 2, 4, 6, 8, 12, 16, 20, 24
- **Typography**: H1 (2.5rem), H2 (2rem), H3 (1.5rem), Body (1rem)
- **Interactions**: Hover elevate, subtle animations, 48px touch targets

### WebSocket Message Types
```typescript
- join-queue: User enters matching queue
- leave-queue: User exits queue
- register-room: Chat room registers connection with server
- match-found: Server sends match details
- chat-message: Text message broadcast
- peer-signal: WebRTC signaling data (future enhancement)
- end-chat: User ends conversation
- partner-left: Partner disconnected
- error: Server error messages
```

### PeerJS Video Streaming
- Direct peer-to-peer connection using PeerJS
- Google STUN servers for NAT traversal
- Automatic retry logic on connection failure
- Echo cancellation and noise suppression enabled
- HD video quality (1280x720 ideal resolution)
- Fallback handling for incoming calls

### User Flow
1. **Landing** → Select native and target languages → Click "Start Practicing"
2. **Matching** → WebSocket connects → Server finds compatible partner (30s timeout)
3. **Chat Room** → Video + text chat → WebRTC peer connection established
4. **End Chat** → Feedback modal → Queue again or exit

### Blocked Users Storage
- Stored in `localStorage.blockedUsers` as array of user IDs
- Checked during matching to prevent re-pairing
- Persists across sessions

### Error Handling
- Camera/mic permission denied: Modal with retry option
- No match found: Timeout after 30s with retry options
- WebRTC unsupported: Graceful fallback (to be implemented)
- Network errors: Reconnection logic (to be implemented)

## Development Notes
- All components follow design guidelines from `design_guidelines.md`
- Uses Shadcn UI components for consistency
- Dark mode is default, light mode available
- Mobile-first responsive design
- Accessibility: ARIA labels, keyboard navigation, focus states
- No mock data in final implementation
