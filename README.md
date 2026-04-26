# 🌊 Sandy's Treedome Lab — Frontend

> SpongeBob-themed research platform UI with real-time AI agent streaming, role-based access, and underwater aesthetics.

## Overview

The frontend is a **React 19** single-page application themed as Sandy Cheeks' underwater Treedome Lab. It features a real-time AI Lab Assistant with **SSE streaming** that shows agent reasoning, routing decisions, and tool calls as they happen.

### Key Highlights

- **Real-time AI Chat** — SSE streaming with live agent reasoning, routing visualization, and tool call progress
- **4 Role-Based Layouts** — Public (Auth), User (Bikini Bottom theme), Admin (Moai sidebar theme)
- **Bikini Bottom UI Theme** — Ocean gradients, sandy textures, pineapple panels, porthole buttons, moai sidebars
- **Full MFA Support** — TOTP authenticator setup with QR code, backup codes, email verification
- **11 Custom UI Components** — Button, Card, Input, Modal, Select, Table, Badge, Alert, Spinner, Pagination, ErrorBanner
- **Skeleton Loading & Suspense** — Lazy-loaded pages with underwater jellyfish animation fallback

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **UI** | React | 19.2.4 |
| **Routing** | React Router | 7.14.2 |
| **State** | Zustand (auth) + React Query (server) | 5.0.12 / 5.100.1 |
| **HTTP** | Axios | 1.15.2 |
| **Forms** | React Hook Form + Zod | 7.73.1 / 4.3.6 |
| **Styling** | Tailwind CSS | 4.2.4 |
| **Icons** | Lucide React | 1.9.0 |
| **Build** | Vite | 8.0.1 |
| **Type Checking** | TypeScript | 5.9 |

## Pages & Routes

### Public (GuestGuard)

| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | Login with email/password |
| `/register` | RegisterPage | Registration with email verification |
| `/forgot-password` | ForgotPasswordPage | Request password reset email |
| `/resend-verification` | ResendVerificationPage | Resend verification email |
| `/admin/login` | AdminLoginPage | Admin-only login page |

### Auth Recovery (no guard)

| Route | Page | Description |
|-------|------|-------------|
| `/verify-email` | VerifyEmailPage | Verify email with 6-digit code |
| `/reset-password` | ResetPasswordPage | Reset password with code |
| `/mfa/verify` | MfaVerifyPage | TOTP verification during login |

### Authenticated (AuthGuard + UserLayout)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | DashboardPage | Stats cards, recent projects, low stock alerts, challenge scenarios |
| `/research` | ResearchPage | Project CRUD with status badges and filters |
| `/research/:id` | ResearchDetailPage | Project detail with experiments |
| `/inventory` | InventoryPage | Inventory table with CRUD, category filter, low stock banner |
| `/assistant` | LabAssistantPage | AI chat with SSE streaming and agent flow visualization |
| `/profile` | ProfilePage | User profile management |
| `/profile/password` | ChangePasswordPage | Password change form |
| `/security` | SecurityPage | Security settings overview |
| `/security/mfa/setup` | MfaSetupPage | MFA setup with QR code generation |

### Admin (AdminGuard + AdminLayout)

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Overview | Admin dashboard with stats |
| `/admin/users` | UsersList | User list with pagination and search |
| `/admin/users/:id` | UserDetail | User detail view |
| `/admin/users/:id/edit` | UserEdit | Edit user (role, lock, deactivate) |

## UI Theme — Bikini Bottom

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `bb-ocean` | `#4AB5C4` | Primary background, links |
| `bb-sand` | `#D4B896` | Card backgrounds, panels |
| `bb-pineapple` | `#E8832A` | Primary buttons, accents, CTAs |
| `bb-tropical` | `#3A8C2F` | Success states, badges |
| `bb-porthole` | `#8AAFC8` | Info elements, borders |
| `bb-cartoon` | `#F0D020` | Warnings, highlights, active states |
| `bb-purple` | `#8878C8` | Research agent badges |
| `bb-stone` | `#5A6B7A` | Admin sidebar, secondary text |
| `bb-asphalt` | `#555566` | Headers, dark elements |
| `bb-bark` | `#2A1A0A` | Body text, dark text |

### Custom CSS Components

| Class | Description |
|-------|-------------|
| `.pineapple-panel` | Card style with diamond/crosshatch overlay |
| `.porthole-btn` | Double-border ring button effect |
| `.wooden-input` | Warm brown border, inset shadow input |
| `.moai-sidebar` | Dark gray rough texture sidebar |
| `.moai-icon-container` | Porthole-style icon holder |
| `.ocean-road-nav` | Dark gray nav with dashed yellow line separators |
| `.bubble-bg` | Floating bubble animation background |
| `.sandy-texture` | Sandy speckle noise texture overlay |
| `.sand-floor` | Sandy gradient floor section |
| `.sea-decorations` | Bubble + jellyfish overlay animations |
| `.flower-divider` | Flower/coral divider element |
| `.shadow-warm` / `.shadow-warm-lg` | Warm drop shadow (`rgba(90,60,20,0.18)`) |

### Animations

| Keyframe | Description |
|----------|-------------|
| `bubble-float` | Bubbles rising from bottom |
| `jellyfish` | Pulsing opacity jellyfish effect |
| `kelp-sway` | Swaying kelp animation |
| `flower-drift` | Floating flower petals |
| `wave` | Wave motion |
| `shimmer` | Shimmering light effect |
| `pulse-glow` | Glowing pulse |

### Fonts

| Usage | Font | Weight |
|-------|------|--------|
| **Display** | Fredoka | 600, 700 |
| **Body** | Nunito | 400, 500, 600, 700 |
| **Alternative** | Baloo 2 | 600 |

## Project Structure

```
src/
├── App.tsx                          # Root: QueryClientProvider + RouterProvider
├── main.tsx                         # Entry point
├── index.css                        # Full theme: bb-* palette, animations, CSS classes
├── routes/
│   └── index.tsx                    # All routes with lazy-loaded pages
├── api/
│   ├── client.ts                    # Axios instance + JWT refresh interceptor
│   ├── auth.api.ts                  # Auth API calls
│   ├── chat.api.ts                  # Chat SSE API
│   ├── research.api.ts              # Research CRUD
│   ├── inventory.api.ts             # Inventory CRUD
│   ├── admin.api.ts                 # Admin API
│   ├── users.api.ts                 # User profile API
│   └── index.ts                     # Barrel export
├── components/
│   ├── layout/
│   │   ├── AuthLayout.tsx           # Ocean gradient auth pages
│   │   ├── UserLayout.tsx           # Ocean floor nav layout
│   │   └── AdminLayout.tsx          # Moai sidebar admin layout
│   ├── guards/
│   │   ├── AuthGuard.tsx            # Redirects to login if unauthenticated
│   │   ├── AdminGuard.tsx           # Redirects to dashboard if not admin
│   │   └── GuestGuard.tsx          # Redirects away from auth pages if logged in
│   └── ui/
│       ├── Button.tsx               # Porthole-style buttons
│       ├── Card.tsx                 # Pineapple panel cards
│       ├── Input.tsx                # Wooden door inputs
│       ├── Select.tsx               # Wooden door select
│       ├── Modal.tsx                # Sandy backdrop modal
│       ├── Table.tsx                # Themed table
│       ├── Badge.tsx                # Themed badges
│       ├── Alert.tsx                # Themed alerts
│       ├── Spinner.tsx              # Pineapple spinner
│       ├── Pagination.tsx           # Themed pagination
│       ├── ErrorBanner.tsx          # Themed error banner
│       └── index.ts                 # Barrel export
├── hooks/
│   ├── useAuth.ts                   # Auth hook (wraps Zustand store)
│   ├── useAgentChat.ts              # SSE streaming hook for AI chat
│   ├── useAdmin.ts                  # Admin API hooks
│   └── useUser.ts                   # User API hooks
├── stores/
│   └── auth.store.ts                # Zustand persisted auth store
├── pages/
│   ├── auth/                        # 7 auth pages
│   ├── user/                        # 9 user pages
│   └── admin/                       # 4 admin pages + admin login
├── types/
│   └── index.ts                     # TypeScript type definitions
└── lib/
    └── utils.ts                     # Utility functions
```

## Key Features

### 🤖 Lab Assistant (AI Chat)

The `/assistant` page features a real-time chat interface powered by the multi-agent backend:

- **SSE Streaming** — Messages stream in character by character
- **Thinking Panel** — "Plankton's Brain Activity" expandable panel shows:
  - Agent reasoning tokens (chain-of-thought)
  - Routing decisions (Planner → Research/Inventory/Database)
  - Tool calls and their results in real-time
- **Agent Badges** — Color-coded badges per agent (🧠 Planner, 🔬 Research, 📦 Inventory, 🗄️ Database)
- **Conversation History** — Sidebar with saved conversations
- **Challenge Scenarios** — Pre-built prompts demonstrating each agent

### 🔐 Authentication Flow

1. **Register** → Email with 6-digit verification code
2. **Verify Email** → Account activated
3. **Login** → JWT access token (15min) + refresh token (7d)
4. **MFA Setup** (optional) → TOTP QR code + backup codes
5. **Auto Refresh** → Axios interceptor queues failed requests during token refresh

### 🎨 Layout Themes

| Layout | Theme | Key Elements |
|--------|-------|-------------|
| **AuthLayout** | Ocean gradient | Full-screen blue gradient, centered card, floating bubbles |
| **UserLayout** | Bikini Bottom | Ocean floor navigation bar with dashed road lines, sandy textures, flower clouds |
| **AdminLayout** | Moai Island | Dark gray sidebar with porthole icons, stone textures, ocean accent bars |

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:3000`

### Installation

```bash
cd hackathon-frontend

# Install dependencies
npm install

# Start development server (port 5173, proxies API to :3000)
npm run dev
```

The Vite dev server proxies all `/api` requests to the backend at `http://localhost:3000`, so no CORS issues in development.

### Environment Variables

```env
# For local development, leave empty (uses Vite proxy)
# For production, set to your backend URL
VITE_API_BASE_URL=
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | TypeScript check + Vite build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

## API Client Architecture

The Axios client (`src/api/client.ts`) includes:

- **JWT Interceptor** — Automatically attaches `Bearer` token to all requests
- **Auto-Refresh** — On 401, queues failed requests, refreshes token, then replays
- **Response Unwrap** — Automatically unwraps `{ statusCode, data }` envelope from NestJS responses
- **Zustand Integration** — Reads tokens from persisted Zustand auth store

## Component Customization

All UI components use Tailwind classes with the `bb-*` theme tokens:

```tsx
// Example: Pineapple panel card with porthole button
<Card className="pineapple-panel">
  <h2 className="text-bb-bark font-fredoka">Project Title</h2>
  <Button variant="primary" className="porthole-btn">
    Create Project
  </Button>
</Card>

// Example: Wooden door input
<Input label="Project Name" className="wooden-input" />
```

---

*built for CodeItUp 6.0 — "I'm ready! I'm ready!"* 🧽