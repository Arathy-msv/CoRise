---
name: ai-assistance
description: Use when implementing Corise writing help—campaign names, descriptions, headlines, organization introductions, plain-language rewrites, suggestion UI, approval flows, or deterministic local AI simulation.
---

# Corise AI Assistance

## Goal

Help users who freeze at blank text fields. Corise offers understandable writing suggestions they can **accept, edit, or reject**.

In this prototype, assistance is **local and deterministic**. It must feel helpful in a demo without claiming a live AI model.

---

## Contextual AI assistance

Suggestions must use what the user already shared:

- Organization name and description
- Campaign goal
- Category / help needed
- Any draft text the user wrote

If context is thin, ask the user to answer the prior step rather than inventing a fictional organization story.

Tone of suggestions:

- Warm, concrete, community-oriented
- Short sentences
- No jargon
- No fake metrics

---

## What to generate

### Campaign name generation

- Return **3** concise options.
- Vary tone slightly (direct / warm / action-oriented).
- Avoid ALL CAPS, clickbait, or trademarked slogans.

### Campaign description suggestions

- 2–4 sentences.
- State who is helped, what is needed, and how people can take part—at a high level.
- Do not invent amounts raised, number of beneficiaries, or outcomes.

### Organization introduction suggestions

- 2–3 sentences explaining what the organization does.
- Grounded only in user-provided description; elaborate gently for clarity, do not fabricate programs.

### Headline improvement

- One primary headline option plus 1–2 alternates when useful.
- Prefer clarity over cleverness.

### Plain-language rewriting

- Accept user draft text and return a clearer version.
- Preserve meaning; do not add claims the user did not make.
- Show original vs suggestion before applying.

### Supporting text

- Optional short subcopy under the headline (1–2 sentences).

---

## Local deterministic simulation

### Required implementation approach

- Pure TypeScript functions in a dedicated module (e.g. `lib/suggestions/`).
- Same inputs → same outputs (deterministic).
- May use simple templates, keyword maps, and light cleanup (trim, capitalize).
- May simulate a short delay (e.g. 300–800ms) for demo feel—optional, keep reliable.

### Prohibited

- Calling OpenAI, Anthropic, or any external LLM API
- Environment keys for model providers in the core demo path
- Random non-reproducible copy that changes every click without reason (if randomness is used for variety, seed it from input text so demos stay stable)

### Honesty in UI

Use clear labeling such as:

- “Demo writing help”
- “Suggested text (simulated for this prototype)”

Never say:

- “Powered by GPT / Claude / …”
- “Our AI model thinks…”
- “Connected to live AI”

---

## User approval before applying suggestions

### Required flow

1. User triggers help (“Get suggestions” / “Improve this”).
2. Suggestions appear in a review area.
3. User chooses **Use** / **Apply**, **Edit then use**, or **Dismiss**.
4. Only then does session state update the target field.

### Rules

- **Never** overwrite user-entered content automatically.
- **Never** replace a field on page load with a suggestion.
- Applying a suggestion still leaves the field editable.
- Rejecting / dismissing keeps the user’s current text intact.
- If the user already typed text, confirm before replacing: “Replace your text with this suggestion?”

### Example UX

```text
Your description
[ textarea with user text ]

Suggestions
• “…”  [Use] [Edit]
• “…”  [Use] [Edit]

[ Keep my text ]
```

---

## Error and empty states

- If required context missing: “Add a short note about your goal first — then we can suggest wording.”
- If generation returns nothing useful: show a friendly fallback template the user can edit, still requiring Apply.
- Do not fail the whole wizard if suggestions fail; campaign can continue with manual entry.

---

## Integration points

| Step | Assistance |
|---|---|
| After org details | Organization introduction |
| After campaign questions | Name, description, headline, supporting text |
| Refine website | Headline / intro improvements |

Share helpers across steps; do not duplicate divergent generators.

Persist applied text via `session-state`. Previews read the applied fields only—not unapplied suggestion buffers.

---

## Required behavior

- Contextual, editable, approval-based suggestions
- Deterministic local simulation
- Clear simulated-AI labeling
- No silent overwrites
- No invented achievements or statistics

## Prohibited behavior

- Real AI API dependencies for the core demo
- Claiming live model connectivity
- Auto-writing into fields without consent
- Generating testimonials, donor lists, or impact numbers
- Blocking the journey if the user skips suggestions

---

## Implementation sketch

```ts
// Illustrative only — do not treat as application code to paste unchecked
export type SuggestionContext = {
  organizationName: string
  organizationDescription: string
  campaignGoal: string
  category: string
  draftText?: string
}

export function suggestCampaignNames(ctx: SuggestionContext): string[]
export function suggestCampaignDescription(ctx: SuggestionContext): string
export function suggestHeadline(ctx: SuggestionContext): string[]
export function suggestOrganizationIntroduction(ctx: SuggestionContext): string
export function rewritePlainLanguage(text: string): string
```

Keep functions unit-testable and free of React imports.

---

## Related skills

- `campaign-creation` — where suggestions plug into the journey
- `organization-website` — headline/intro surfaces
- `session-state` — what gets stored after Apply
- `presales-demo` — how to talk about simulated help honestly
