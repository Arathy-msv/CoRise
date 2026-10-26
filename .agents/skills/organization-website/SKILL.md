---
name: organization-website
description: Use when building or changing the Corise organization website preview—including identity, headline, hero, campaign listing, CTAs, footer, desktop/mobile preview, live updates, and honest publishing language.
---

# Corise Organization Website

## Goal

Automatically generate a **customized organization website preview** that looks professional and trustworthy—not like a form, CMS admin, or generic dashboard.

The website must read as: “This could be our organization’s public home page,” while remaining honest that it is a demo preview.

---

## Single source of truth

Website content comes from the same session state as organization + campaign data.

| Website section | Source fields |
|---|---|
| Site / org name | `organizationName` |
| Identity / intro | `organizationIntroduction` (preferred) or derived from `organizationDescription` |
| Main headline | Campaign or org `headline` |
| Supporting intro | Campaign `supportingText` / description as appropriate |
| Campaign cards | Campaign name, description, category, CTA label |
| Branding accents | Visual tokens + optional simple theme derived from defaults |

Edits in campaign or organization steps must **live-update** the website preview without manual republishing.

---

## Organization details

Required for a credible site:

- Organization name (prominent in header and hero)
- Short introduction (what the organization does)
- Consistent naming in header, footer, and titles

Optional:

- Simple location line (city/region)
- Public-facing contact CTA label (no real messaging backend required)

Do not invent founding years, award lists, partner logos, or membership counts.

---

## Website headline and introduction

- Hero headline: clear, human, one line preferred.
- Introduction: 2–4 sentences max on the first screenful.
- Tone: warm, concrete, community-oriented.
- User can edit headline and introduction from refine/edit controls.
- AI may suggest improvements; apply only with approval (`ai-assistance`).

---

## Hero image

- Include a full-width (or edge-dominant) hero visual area.
- Use authentic community / organization imagery (stock that feels real: people collaborating, local spaces, volunteering)—not abstract tech graphics.
- Provide a default hero so demos never show a broken image.
- Allow swapping among a small set of local/static image options if needed; do not require upload infrastructure for the prototype (file upload optional only if fully client-side and demo-safe).
- Do not overlay cluttered badges, fake stats, or sticker chips on the hero.

---

## Branding and organization identity

Visual identity follows `visual-design`:

- Warm ivory page background
- Deep forest-green primary actions and key UI
- Restrained gold accents
- High-contrast text
- Polished typography and generous whitespace

Header should include:

- Organization name as the brand signal
- Simple nav anchors if useful (About, Campaigns, Contact)—anchors may scroll within the preview

Avoid:

- Generic SaaS dashboard chrome inside the preview
- Template watermarks that cheapen trust (a small “Preview” label outside or above the framed site is fine)

---

## Campaign listing

- Show campaign cards generated from real session campaign data.
- Each card: name, short description, plain-language category, clear CTA.
- One campaign is enough for the prototype; layout should still look intentional.
- Empty state: if somehow no campaign exists, guide the user back—do not invent a fake campaign.

---

## Calls to action

CTAs are **labels and buttons inside the preview**, not live payment or email systems.

Map category → CTA language examples:

| Category | CTA label |
|---|---|
| fundraising | Support this campaign |
| volunteers | Volunteer with us |
| items | Donate items |
| awareness | Learn more |
| event | Join the event |

Buttons may show a gentle demo response (“In the full product, this would collect support. This is a preview.”) — never pretend money was collected.

---

## Desktop and mobile preview

**Required:** a working toggle between desktop and mobile preview frames.

- Desktop: wide framed preview
- Mobile: narrow framed preview approximating a phone width
- Same content, responsive layout behavior
- Toggle is a real control with visible selected state
- Preview must remain readable in both modes

Place the toggle in the Corise app chrome around the preview, not as fake browser chrome clutter inside the site content.

---

## Live updating of content

When users refine:

- Changing org name updates header, hero, footer
- Changing headline/intro updates hero copy
- Changing campaign fields updates cards
- Updates should feel immediate (same session state)

No separate “Rebuild site” step for the prototype. If a loading flourish is used, keep it short and honest (“Updating preview…”).

---

## Honest publishing terminology

### Required language

- “Preview your organization website”
- “Website preview”
- “This is a demo preview — not published publicly”

### Prohibited language

- “Your site is live”
- “Published to the web”
- “Share your live URL” (unless clearly fake/demo and not implying public hosting)
- Fake custom domains presented as real

If a “Publish” control exists for sales narrative, it must open an honest explanation that publishing will be available in the full product and that this prototype only previews.

---

## Page composition (preview)

Recommended structure:

1. **Header** — org name, simple links
2. **Hero** — image + headline + short intro + primary CTA
3. **About / introduction** — organization story in plain language
4. **Campaigns** — card(s)
5. **Footer** — org name, gentle secondary links, preview disclaimer if appropriate

The first viewport of the **website preview** should feel like one composition: brand, headline, short support, CTA, dominant imagery—not a dashboard of widgets.

---

## Required behavior

- Look like a customized organization website.
- Stay synchronized with campaign/organization state.
- Support desktop and mobile preview switching.
- Use honest preview/publishing language.
- Remain usable offline of external APIs.

## Prohibited behavior

- Rendering an admin form as the “website”
- Invented testimonials, impact stats, or partner walls
- Implying public publication
- Broken layouts on mobile preview
- Divergent copy stores for site vs campaign

---

## Implementation guidance

- Keep website presentational components pure where possible; feed props from session state.
- Frame preview in a client component that can toggle viewport width classes.
- Use next/image or static public assets for heroes; ship defaults in-repo.
- Separate “Corise app shell” from “Organization website preview” visually so sales demos read clearly.

---

## Related skills

- `campaign-creation` — card content source
- `visual-design` — look and feel
- `presales-demo` — how to present the preview
- `session-state` — shared data
