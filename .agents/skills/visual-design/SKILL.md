---
name: visual-design
description: Use when designing or implementing Corise UI styling, typography, color, spacing, imagery, website preview aesthetics, or when preventing generic dashboard or low-trust visual patterns.
---

# Corise Visual Design

## Goal

Corise should feel **premium, modern, and professional**—credible to organization leaders and approachable to ordinary people. Calm confidence, not startup flash or childish charity tropes.

**Tagline energy:** Your idea. Your campaign. Your impact.

---

## Design direction

| Attribute | Direction |
|---|---|
| Mood | Warm, trustworthy, community-rooted |
| Density | Generous whitespace; uncluttered |
| Complexity | Few elements per view; one primary action |
| Imagery | Authentic people, places, volunteering, local organizations |
| Motion | Subtle and purposeful only |

The organization **website preview** must look like a real public site. The Corise **app shell** may be simpler but should share the same palette and type.

---

## Color system

Use CSS variables (names illustrative):

| Token | Role | Guidance |
|---|---|---|
| `--color-bg` | Page background | Warm ivory (e.g. near `#F7F3EB` / `#F5F0E6`) |
| `--color-surface` | Cards / panels | Soft white / lighter ivory |
| `--color-primary` | Primary actions, key links | Deep forest green |
| `--color-primary-hover` | Hover/focus of primary | Slightly deeper green |
| `--color-accent` | Sparse highlights | Restrained gold |
| `--color-text` | Body text | Near-black charcoal with high contrast on ivory |
| `--color-text-muted` | Secondary text | Still readable; avoid washed-out gray |
| `--color-border` | Dividers / inputs | Subtle warm gray-brown |
| `--color-danger` | Errors | Clear red; never rely on color alone |

### Rules

- High contrast for text and primary buttons.
- Gold is an **accent**, not a wash across the UI.
- Do not default to purple-on-white, neon gradients, or harsh pure black/white tech-noir themes.
- Avoid low-contrast gray-on-ivory.

---

## Typography

- Choose polished, purposeful fonts (avoid default system-only stacks as the only personality).
- Pair a clear display/head style with a highly readable body face.
- Body ≥ 16px in the app; comfortable line-height (≈ 1.5).
- Headlines: confident but not oversized vanity type that crowds mobile.
- Avoid tiny legal-style text for primary instructions.
- Limit type sizes to a small scale for consistency.

---

## Layout and spacing

- Generous whitespace between sections.
- Consistent spacing scale (e.g. 4/8/12/16/24/32/48).
- Consistent rounded corners (medium radius—friendly, not pill-heavy).
- Subtle borders; soft shadows only where they clarify elevation (forms, preview frame).
- One composition per primary viewport in marketing/hero-like surfaces.
- Website preview hero: brand/org name strong; one headline; short support; CTA; dominant image.

---

## Components look-and-feel

### App journey screens

- Clean step layouts, not dashboards
- Large inputs and buttons
- Progress indicator that is readable
- Honest demo banners using calm surface + border (not alarming)

### Website preview

- Distinct header, hero, campaigns, footer
- Campaign cards allowed as interaction containers
- Professional footer with org name
- No generic admin sidebar inside the preview

---

## Imagery

**Use**

- Authentic community and organization imagery
- Local volunteering, education, neighborhood, mutual aid vibes
- Default heroes that always load (local `public/` assets)

**Avoid**

- Abstract AI/tech network graphics as the main story
- Clipart or childish illustrations as the primary brand
- Fake screenshots of unrelated products
- Overlaid stickers, fake “50k raised” badges, trophy spam

Never invent photo captions that claim real achievements.

---

## Motion

If motion is used:

- Soft fade/slide for step transitions or suggestion panels
- Respect `prefers-reduced-motion`
- No looping decorative animations
- No distracting parallax in the core demo path

Ship at most a few intentional motions; reliability beats spectacle.

---

## What to avoid (hard)

- Generic dashboard layouts for the main journey
- Excessive gradients
- Overly decorative animations
- Tiny text
- Low-contrast content
- Childish styling
- Overwhelming numbers of cards and controls
- Purple glow / glassmorphism stacks as the default identity
- Dense newspaper or broadsheet pastiche
- Icon grids that do not advance the campaign journey

---

## App shell vs website preview

Visually separate:

1. **Corise chrome** — steps, writing help, toggles, demo labels  
2. **Organization website** — framed preview that looks public-facing

Sales prospects should immediately recognize the preview as “their future site,” not “the SaaS settings page.”

---

## Required behavior

- Ivory + forest green + restrained gold system
- High contrast, readable type, generous space
- Credible website preview aesthetics
- Consistent radii, borders, spacing
- Authentic imagery defaults

## Prohibited behavior

- Visual patterns listed in “What to avoid”
- Fake impact statistics as design ornaments
- Treating the website preview like a form dump
- Inconsistent ad-hoc colors per page

---

## Implementation notes

- Define tokens once (`globals.css` or theme file) and reuse.
- Prefer semantic class names or well-named utilities over one-off hex codes in many files.
- Check desktop and mobile preview frames against these rules.
- Validate contrast for primary button text on forest green.

---

## Related skills

- `organization-website` — structure of the preview
- `accessible-simple-ux` — readability and control size
- `presales-demo` — first impressions in a live pitch
- `product-principles` — trust and credibility
