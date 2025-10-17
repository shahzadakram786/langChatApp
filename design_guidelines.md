# Design Guidelines: Language Learning Video Chat Platform

## Design Approach
**System-Based Approach**: Drawing from modern communication platforms (Zoom, Discord, Google Meet) with language learning aesthetics. Prioritizing clarity, accessibility, and trust-building for anonymous real-time interactions.

## Core Design Principles
1. **Clarity First**: Every control and status indicator must be immediately recognizable
2. **Trust Through Transparency**: Clear language information, anonymous by design
3. **Distraction-Free Learning**: Minimal UI that fades away during conversations
4. **Responsive Communication**: Design for both desktop (primary) and mobile contexts

---

## Color Palette

### Dark Mode Primary (Default)
- **Background Base**: 222 15% 10% (deep charcoal)
- **Surface**: 222 15% 15% (elevated surfaces)
- **Surface Elevated**: 222 15% 18% (cards, modals)
- **Primary**: 217 91% 60% (trust blue - video controls, CTAs)
- **Primary Hover**: 217 91% 55%
- **Success**: 142 71% 45% (connection status, positive feedback)
- **Destructive**: 0 84% 60% (end chat, report actions)
- **Text Primary**: 0 0% 98%
- **Text Secondary**: 0 0% 70%
- **Border**: 222 15% 25%

### Light Mode (Toggle Available)
- **Background Base**: 0 0% 98%
- **Surface**: 0 0% 100%
- **Primary**: 217 91% 50%
- **Text Primary**: 222 15% 15%
- **Border**: 0 0% 88%

### Accent Colors
- **Language Tag**: 142 71% 45% (native language indicator)
- **Learning Tag**: 43 87% 55% (target language indicator)
- **Warning**: 38 92% 50% (permission requests, errors)

---

## Typography

**Font Families**:
- Primary: 'Inter', system-ui, sans-serif (body, UI)
- Secondary: 'Manrope', sans-serif (headings, emphasis)

**Scale** (Desktop):
- H1: 2.5rem/1.1/700 (landing hero)
- H2: 2rem/1.2/700 (section headers)
- H3: 1.5rem/1.3/600 (card titles)
- Body Large: 1.125rem/1.5/400 (primary content)
- Body: 1rem/1.5/400 (chat messages, descriptions)
- Small: 0.875rem/1.4/400 (labels, metadata)
- Tiny: 0.75rem/1.3/500 (status indicators)

**Responsive Adjustments**:
- Mobile: Scale down headings by 20-25%
- Line heights increase slightly on mobile for readability

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing: 2, 4 (icon gaps, tight elements)
- Standard spacing: 6, 8 (component padding, gaps)
- Section spacing: 12, 16, 20 (between major elements)
- Page spacing: 24 (top-level sections)

**Container Strategy**:
- Landing/Onboarding: max-w-6xl centered
- Chat Interface: Full viewport (100vw/100vh) with fixed sidebars
- Modals: max-w-md to max-w-lg based on content

**Grid Patterns**:
- Language selector: 2 columns on desktop, stack on mobile
- Feature cards: 3 columns (lg), 2 columns (md), 1 column (sm)

---

## Component Library

### Landing Page Components

**Hero Section** (60vh min-height):
- Centered layout with gradient overlay (222 15% 10% to 217 91% 20% opacity 20%)
- H1 headline: "Practice Languages with Real People"
- Subheading: Clear value proposition
- Single primary CTA: "Start Practicing Now" (xl size, primary color)
- Trust indicators below: "100% Anonymous • No Signup Required • Free Forever"

**Language Selection Cards**:
- Elevated surface cards (p-6, rounded-2xl)
- Icon representation for native/target language (globe, graduation cap)
- Dropdown with flag emojis + language names
- Visual distinction: green border for native, amber border for target
- Validation state: subtle glow effect when both selected

**How It Works Section**:
- 3-column grid (icon + title + description)
- Icons: user-plus, video, message-circle (from Heroicons)
- Minimal, informative copy
- Numbers (1, 2, 3) in circles for sequence

### Chat Interface Components

**Video Layout** (Primary Focus):
- **Main video**: 70% width, full height (partner's feed)
- **Self video**: Picture-in-picture, bottom-right, 240px width, draggable
- **Text chat sidebar**: 30% width, fixed right (collapsible on mobile)
- Black background (#000) for video areas to prevent light bleed

**Video Controls Bar** (Fixed bottom overlay):
- Frosted glass effect (backdrop-blur-xl, bg-black/40)
- Controls centered: Mic toggle, Camera toggle, Screen share, End call
- Icon-only buttons with tooltips (48px touch targets)
- Active state: Primary color, Inactive: text-secondary with slash-through
- Red destructive color for "End Chat"

**Text Chat Sidebar**:
- Header: Partner info card (native: green tag, learning: amber tag)
- Messages area: Scroll container, alternating alignment (you: right, partner: left)
- Message bubbles: Your messages (primary blue), Partner (surface elevated)
- Timestamps: Small, text-secondary, bottom of bubbles
- Input: Fixed bottom, emoji picker button, send button (primary)

**Status Indicators**:
- Connection quality: 3-dot indicator (green/amber/red) top-left
- Matching spinner: Center screen, pulsing rings animation, "Finding partner..." text
- Countdown timer: If no match in 20s, show "Still searching... 10s remaining"

### Matching Queue Experience

**Loading State**:
- Full-screen centered card (max-w-md)
- Animated gradient orb (primary colors, gentle pulse)
- Progress text: "Matching you with a language partner..."
- Language preferences shown below (locked, with edit button)
- Cancel button (ghost variant) at bottom

**No Match State**:
- Same card layout
- Icon: frown or clock
- Message: "No partners available right now"
- Two action buttons: "Try Different Languages" | "Keep Waiting"

### Post-Chat Components

**Feedback Modal**:
- Dialog overlay (backdrop-blur-sm)
- Card: "How was your conversation?"
- Emoji reaction buttons: 👍 👎 (large, 64px)
- Optional text field: "Any suggestions?" (expandable)
- Action buttons: "Queue Again" (primary) | "Exit" (ghost)

**Controls Modal** (Report/Block):
- Compact dialog (max-w-sm)
- Clear, direct language: "Report this user?" with reason checkboxes
- Block confirmation: "You won't be matched with this user again"
- Destructive action button (red)

---

## Animations & Interactions

**Use Sparingly**:
- Video control hover: Scale 1.05, duration-150
- Connection status pulse: Gentle opacity fade (1s interval)
- Modal entry: Fade + scale from 95% to 100%, duration-200
- Message send: Slide in from right, duration-300
- Loading orb: Continuous rotation + scale pulse, duration-2000

**No Animations**:
- Video feed transitions (instant)
- Chat scroll (native)
- Language dropdowns (instant)

---

## Images & Visual Assets

**Hero Background Image**:
- Scene: Diverse people in casual video call setting (bright, friendly)
- Overlay: Dark gradient (bottom to top, 60% opacity)
- Position: Background cover, center
- Alternative: Abstract geometric pattern in primary colors if photo unavailable

**Icons**:
- Library: Heroicons (outline variant)
- Size: 24px default, 20px for compact UI, 32px for large buttons
- Color: Inherit from parent (text-primary, text-secondary, or primary)

**Language Flags**:
- Small flag emojis in dropdowns (via Unicode)
- 24px size, inline with text

**Trust Badges** (Landing Footer):
- Anonymous icon, Lock icon, Free tag
- Monochrome, text-secondary color
- 20px icon size with label

---

## Accessibility & Quality

**Focus States**: 
- Visible ring (ring-2 ring-primary ring-offset-2 ring-offset-background)
- Keyboard navigation through all controls

**Media Control Labels**:
- ARIA labels: "Mute microphone", "Turn off camera", "End chat"
- Screen reader announcements for connection status changes

**Contrast**:
- All text meets WCAG AA (4.5:1 for body, 3:1 for large)
- Video controls: white text on dark overlay (7:1 minimum)

**Error States**:
- Permission denied: Modal with clear instructions + browser settings link
- Network error: Retry button with countdown, graceful fallback to text-only
- WebRTC unsupported: Prominent banner with supported browsers list

---

## Responsive Behavior

**Desktop (≥1024px)**:
- Side-by-side video + chat layout
- Floating video controls
- All features visible

**Tablet (768-1023px)**:
- Stacked: Video on top, chat below (tabs to switch)
- Compact controls (40px buttons)

**Mobile (<768px)**:
- Full-screen video
- Chat as overlay drawer (slide up from bottom)
- Larger touch targets (56px)
- Self-video: Minimize to corner thumbnail

---

## Platform-Specific Patterns

**Trust Building**:
- Clear "Anonymous" badge always visible
- "No data stored" message in footer
- Visible partner language info to set expectations

**Safety Controls**:
- "Report" and "Block" always accessible (3-dot menu in header)
- One-click end chat (always visible, never hidden)

**Language Learning Focus**:
- Language tags color-coded throughout
- Quick reference: Your native (green), Your learning (amber), Partner native, Partner learning
- Subtle hints: "Try asking about..." suggestions in chat (opt-in, collapsible)

This design creates a professional, trustworthy platform optimized for focused language practice through video chat, with every element purposefully supporting real-time communication and learning.