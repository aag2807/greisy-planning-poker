# Greisy's Planning Poker

## Overview
Real-time planning poker app built for scrum teams. Dark glassmorphism UI with animations, SSE-based real-time sync, and PWA support. Built for Vercel deployment.

## Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 (uses `@theme inline` directive, not `tailwind.config`)
- **Animations**: Framer Motion
- **Real-time**: Server-Sent Events (SSE) — NOT WebSockets (Vercel doesn't support long-lived WS)
- **Persistence**: In-memory cache (globalThis) + Prisma ORM with Turso (hosted libSQL/SQLite)
- **Effects**: canvas-confetti, Web Audio API for sounds

## Architecture

### Room System
- Rooms use 6-char alphanumeric codes (no ambiguous chars like O/0/I/1)
- In-memory store in `lib/store.ts` using `globalThis` for hot-reload persistence
- SSE endpoint at `app/api/rooms/[id]/events/route.ts` — uses `ReadableStream` with heartbeat
- State broadcasts via callback Sets (subscribeState/subscribeEvents pattern)
- `toPublicRoom()` sanitizes internal data (hides votes until revealed, strips passwords)

### Key Patterns
- Next.js 16 async params: `{ params }: { params: Promise<{ id: string }> }` — must `await params`
- SSE route requires `export const runtime = 'nodejs'` and `export const dynamic = 'force-dynamic'`
- `useRef<ReturnType<typeof setTimeout>>(undefined)` — TS requires the argument in Next.js 16
- localStorage stores `pp-{roomId}` → participantId for session persistence

### Prisma + Turso Persistence
- Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` env vars for hosted Turso DB
- Falls back to local SQLite file (`prisma/dev.db`) if Turso env vars are missing
- `DATABASE_URL` env var used by Prisma CLI commands (`db push`, `studio`)
- Rooms persist indefinitely (no TTL), connections reset to 0 on cold start load
- Schema: `Room` + `Participant` tables, history stored as JSON string in `historyJson` column
- In-memory cache + SSE listeners stay in globalThis (ephemeral, not persisted)

## File Structure
```
app/
  page.tsx              — Landing page (create/join session)
  layout.tsx            — Root layout, PWA metadata, dark theme
  globals.css           — Tailwind v4 theme, keyframes, glass utilities
  room/[id]/page.tsx    — Room page (server component wrapper)
  api/rooms/
    route.ts            — POST to create rooms
    [id]/route.ts       — GET room state, POST actions (join/vote/reveal/reset/nudge/throw/react/kick/leave/topic)
    [id]/events/route.ts — SSE endpoint
components/
  BackgroundEffects.tsx — Animated gradient orbs + grid
  RoomClient.tsx        — Main room UI (~1400 lines, all sub-components inline)
hooks/
  useRoom.ts            — SSE hook with auto-reconnect
lib/
  types.ts              — Room, Participant, HistoryRound interfaces + constants
  store.ts              — In-memory cache + Prisma persistence
  prisma.ts             — Prisma client singleton with Turso adapter
prisma/
  schema.prisma         — Database schema (Room + Participant models)
public/
  manifest.json         — PWA manifest
  icon.svg              — App icon
  icon-maskable.svg     — Maskable PWA icon
```

## Features
- Card voting (Fibonacci: 0-34 + ? + ☕)
- Emoji switcher card (cycles through emojis, hoverable + pickable)
- Auto-reveal when all voters submit
- Spectator mode (watch only, no card slot)
- Confetti + sound on perfect consensus
- Sound effects (nudge, throw, reveal) via Web Audio API
- Emoji reactions bar (float up for all participants)
- Vote change indicator (amber pulse dot)
- Nudge participants who haven't voted
- Throw items at each other (random projectile animations)
- Host controls: kick, reveal, reset, set topic
- History panel (slide-out, shows past rounds with averages)
- Room codes + optional passwords
- PWA installable

## Design
- **Theme**: Dark (`#0d0b14` background, white text with opacity levels)
- **Glass morphism**: `.glass` and `.glass-strong` classes with backdrop-filter blur
- **Gradient text**: `.gradient-text` for headings (violet → cyan → pink)
- **Mobile-first**: `100dvh`, safe-area-inset-bottom, scroll-snap on card deck, responsive grid

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
npx prisma db push  # Push schema to Turso (or local SQLite)
npx prisma studio   # Open Prisma Studio (DB browser)
```
