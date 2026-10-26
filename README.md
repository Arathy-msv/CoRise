# Corise

**Your idea. Your campaign. Your impact.**

Corise is a frontend-only Next.js presales prototype that helps organizations create campaigns, engage supporters, and explore sponsors, rewards, and cause products—without requiring technical knowledge.

## Run the demo

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in to the demo (no password), and walk the dashboard → create campaign → publish → public page flow (~7–10 minutes).

```bash
npm run build
npm start
```

## What’s included

- Demo sign-in (no real auth)
- Overview dashboard for **GreenSteps Community Foundation**
- Campaign management and 7-step creation wizard
- Local deterministic “demo AI” writing help
- Interactive quiz, challenge, and poll modules
- Illustrative sponsors & rewards
- Cause marketplace concepts
- Analytics and organization settings
- Public-facing campaign pages at `/c/[slug]`
- `sessionStorage` persistence (`corise-demo-v1`)

## Honesty labels

Simulated AI, demo analytics, and “publish” actions are labeled clearly. Publishing updates demo state only—it does not launch a live public site or process real payments.

## Agent instructions

See `AGENTS.md` and `.agents/skills/` for product rules used by Cursor coding agents.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · frontend only
