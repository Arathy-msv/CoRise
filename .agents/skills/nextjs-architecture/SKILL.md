---
name: nextjs-architecture
description: Use when scaffolding or structuring the Corise Next.js App Router prototype—TypeScript layout, server/client boundaries, folder organization, dependencies, and frontend-only constraints.
---

# Corise Next.js Architecture

## Goal

Keep the Corise prototype **simple, typed, and demo-reliable**: Next.js App Router + TypeScript, frontend only, easy to extend later without overengineering now.

---

## Stack (fixed for this prototype)

| Layer | Choice |
|---|---|
| Framework | Next.js |
| Routing | App Router |
| Language | TypeScript |
| Rendering | Prefer Server Components by default; Client Components for interactivity and `sessionStorage` |
| Backend | None |
| Database | None |
| Auth | None |
| Real AI | None |

Do not add Express, Prisma, NextAuth, tRPC, or LLM SDKs for the core demonstration.

---

## App Router structure (suggested)

```text
app/
  layout.tsx          # Shell, fonts, global styles
  page.tsx            # Entry / start demo
  organization/       # Step 1
  campaign/           # Step 2
  assist/             # Step 3 writing help (name flexible)
  review/             # Step 4 campaign review
  website/            # Steps 5–6 website preview + refine
  globals.css
components/
  ui/                 # Reusable primitives (Button, TextField, Progress)
  campaign/
  website/
  layout/
lib/
  storage.ts          # sessionStorage helpers
  suggestions/        # Deterministic AI simulation
  sample-data.ts      # Presales sample content
types/
  corise.ts           # Domain types
public/
  images/             # Default hero and community imagery
```

Exact folder names may vary; keep **types**, **storage**, **suggestions**, and **UI** separated.

A single wizard route with step state is acceptable if clearer—prefer explicitness for demos.

---

## Server / client component boundaries

### Server Components (default)

- Static marketing/entry framing
- Layout chrome that needs no browser APIs
- Presentational composition that receives no storage-bound state at SSR

### Client Components (`'use client'`)

- Forms and wizards
- Anything reading/writing `sessionStorage`
- Desktop/mobile preview toggles
- AI suggestion panels with apply/reject
- Reset demo controls

### Rules

- Do not pass non-serializable values from server to client carelessly.
- Load storage after mount (`session-state` hydration rules).
- Keep suggestion functions in `lib/` free of React so both sides can import if needed (prefer calling them from client UI).

### Avoid

- API routes that fake a backend for the core path (unnecessary)
- Server Actions that persist data (no database)
- `useEffect` sprawl for unrelated concerns—prefer clear event handlers for saves

---

## Reusable UI components

Build a small set of primitives aligned with `visual-design` and `accessible-simple-ux`:

- Button (primary / secondary)
- TextField, TextArea
- ChoiceCard / RadioGroup
- StepProgress
- Notice / Banner (for demo honesty labels)
- PreviewFrame (desktop/mobile)

Do not install a heavy component library unless it clearly speeds the demo without fighting the visual system. Prefer CSS modules, Tailwind, or simple global CSS—pick one approach and stay consistent.

---

## Separation of concerns

| Concern | Location |
|---|---|
| Domain types | `types/` |
| Persistence | `lib/storage.ts` (or similar) |
| Suggestions | `lib/suggestions/*` |
| Sample demo data | `lib/sample-data.ts` |
| Visual sections | `components/*` |
| Routes / steps | `app/*` |

Forms should call storage helpers; components should not scatter raw `sessionStorage` calls.

---

## Frontend-only restrictions

**Do not add** for the prototype core:

- Environment-required third-party APIs
- Auth provider SDKs
- Database clients
- Real payment widgets
- CMS integrations
- Analytics that block rendering

Static assets and fonts (self-hosted or otherwise demo-reliable) are fine.

Feature flags or thin adapters for “future AI” may exist as interfaces—but production demo path must run offline of those services.

---

## Code quality expectations

- TypeScript `strict` recommended
- No `any` unless justified and isolated
- Prefer explicit props types for public components
- Meaningful names (`organizationName` not `n1`)
- Avoid premature abstraction (no mega “CoreEngine”)
- Delete dead code; do not leave fake API stubs that imply live services
- Keep dependencies minimal; justify each addition

---

## Styling and assets

- Global design tokens via CSS variables (see `visual-design`)
- Responsive layouts without horizontal scroll on core pages
- Images in `public/` with sensible defaults for hero
- Respect reduced-motion preferences for any animation

---

## Required behavior

- Next.js App Router + TypeScript
- Clear folder separation
- Correct client boundaries for storage and interactivity
- Zero required external services for the demo journey
- Architecture ready to swap storage/suggestions later

## Prohibited behavior

- Backend/database/auth/real AI in the core path
- Overengineering (microservices mindset in a demo)
- Hydration-breaking storage reads
- Unnecessary dependencies
- Product naming other than Corise in code and comments

---

## Related skills

- `session-state` — persistence details
- `ai-assistance` — suggestion modules
- `visual-design` — tokens and UI polish
- `quality-check` — build/lint/typecheck gates
