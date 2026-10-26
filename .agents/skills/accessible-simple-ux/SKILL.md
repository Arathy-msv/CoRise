---
name: accessible-simple-ux
description: Use when designing or building Corise screens, forms, copy, navigation, validation, or responsive layouts for non-technical users, older adults, and people with limited digital literacy.
---

# Corise Accessible Simple UX

## Goal

Every Corise screen should feel calm, obvious, and forgiving. A person who has never used campaign or website tools should finish the journey without training.

---

## Plain-language content

### Required

- Use short, familiar sentences (aim for grade 6–8 reading level).
- Prefer everyday words: “goal”, “help needed”, “headline”, “preview”.
- Explain why you ask for information in one short line.
- Use “you” and “your organization” language.
- Keep button labels verb-first and specific: “Continue”, “Get writing help”, “Preview website”, “Use this suggestion”.

### Prohibited

- Jargon: CTA, hero, SEO, funnel, conversion, CMS, deploy, slug (unless explained in plain words).
- Long paragraphs on step screens.
- Blameful errors (“Invalid input”, “Failed constraint”).

### Examples of good vs poor copy

| Poor | Better |
|---|---|
| Configure organizational entity metadata | What’s your organization’s name? |
| Select engagement modality | What kind of help do you need? |
| Generate assets | Get writing suggestions |
| Publish site | Preview your organization website |

---

## Short, understandable questions

Ask one idea per field or choice group.

**Good campaign questions**

- What do you want this campaign to achieve?
- Who is this for?
- What kind of help do you need? (money, volunteers, donations of items, awareness, attendance)
- Is there a date or deadline? (optional)

Avoid multi-part questions and nested conditionals in the main path.

---

## Helpful examples

Never present a cold blank form as the default teaching method.

- Placeholders with realistic examples: `e.g. Riverside Community Garden`
- Optional “Try a sample organization” for demos
- Suggestion chips where useful: “Raise funds”, “Find volunteers”, “Invite people to an event”
- After AI suggestions appear, show side-by-side “Your words” vs “Suggestion” when helpful

Mark sample content clearly: “Sample text — you can edit this.”

---

## Clear progress indicators

- Show step progress in plain language: “Step 2 of 6 — Your campaign”.
- Name steps with outcomes, not system terms.
- Keep the current step visually dominant; past steps reachable without losing data.
- Do not use cryptic progress bars without labels.

Suggested step labels:

1. Organization
2. Campaign
3. Writing help
4. Campaign preview
5. Website
6. Refine

---

## Accessible forms

### Required

- Visible `<label>` (or equivalent) for every input; do not rely on placeholder alone.
- Group related choices with `fieldset` / `legend` or clear headings.
- Associate error text with fields (`aria-describedby` / equivalent).
- Support browser autofill where appropriate; do not request passwords or emails for the core demo.
- Prefer native controls over custom widgets unless accessibility is equal or better.

### Touch and readability

- Minimum comfortable tap target ~44×44 CSS pixels.
- Body text large enough for older adults (prefer ≥16px base).
- Avoid light gray text on ivory; maintain strong contrast.
- Spacing between fields generous; avoid dense grids of inputs.

---

## Helpful validation

### Required

- Validate on submit of the step, and optionally gently on blur for critical fields.
- Errors say what happened and how to fix it: “Please enter your organization name.”
- Keep entered values when validation fails.
- Do not block progress for optional fields.
- Required fields must be obvious before submit (text cue or clear required marker with explanation).

### Prohibited

- Clearing the form on error
- Technical validation messages (regex dumps, schema codes)
- Red-only signaling without text

---

## Large, readable controls

- Primary button: high contrast forest green on light surface (see `visual-design`).
- Secondary actions visually quieter but still readable.
- One primary CTA per view.
- Links that look like links; buttons that look like buttons.
- Avoid icon-only controls for essential actions; if icons are used, include a text label.

---

## Keyboard accessibility

- Full journey operable with keyboard only.
- Visible focus styles on all interactive elements.
- Logical tab order matching visual order.
- Escape closes dialogs; focus returns to the opener.
- Do not trap focus except in modal dialogs.
- Skip-to-content link on multi-section pages when appropriate.

---

## Responsive behavior

- Mobile-first layouts; stack vertical on narrow screens.
- No horizontal scrolling for core content.
- Desktop/mobile **preview toggle** for the website must be functional (see `organization-website`).
- Forms remain single-column on small screens.
- Sticky footers or nav must not cover primary actions on mobile.

---

## Support for older adults and limited digital literacy

Design assumptions:

- Users may click slowly or miss small targets.
- Users may not notice subtle hover states—important actions must be visible at rest.
- Users may fear “breaking” something—provide Undo / Back / Edit freely.
- Users may not understand browser concepts—avoid “session”, “cache”, “hydrate” in UI copy.
- Prefer confirmation for destructive actions (e.g., Reset demo data).

Onboarding tone:

- Encouraging, never condescending.
- Celebrate progress lightly (“Looking good — next we’ll shape your campaign.”) without childish gamification.

---

## Screen composition rules

1. One primary question or outcome per screen.
2. Supporting sentence ≤ 2 lines.
3. Examples or defaults nearby.
4. Primary action at a predictable place (typically bottom or end of content).
5. Escape hatches: Back, Edit, optional Skip only when the field is truly optional.

---

## Required vs prohibited summary

| Required | Prohibited |
|---|---|
| Plain language | Marketing/dev jargon as primary copy |
| Labeled fields + examples | Placeholder-only unlabeled fields |
| Clear step progress | Hidden multi-step wizards |
| Helpful, recoverable errors | Silent failures or form wipes |
| Large targets, keyboard support | Tiny controls, hover-only actions |
| Responsive + readable | Desktop-only dense dashboards |

---

## Related skills

- `product-principles` — why simplicity is non-negotiable
- `visual-design` — contrast, type, spacing tokens
- `campaign-creation` / `organization-website` — apply these rules to those flows
- `quality-check` — accessibility checklist
