---
name: product-principles
description: Use when deciding what to build, prioritizing features, evaluating scope, or judging whether a Corise change improves the core campaign-and-website outcome for non-technical users.
---

# Corise Product Principles

## Product philosophy

Corise exists to make campaign creation and organization websites **effortless** for ordinary people.

The product is not a marketing suite, CMS, or design tool. It is a guided path from a simple idea to:

1. A clear campaign
2. A professional-looking organization website preview

Every feature must reduce user effort **or** improve that core outcome. If it does neither, do not build it.

**Promise to keep:**  
"Tell Corise what you want to do. We'll help you create your campaign and organization website."

**Tagline:** Your idea. Your campaign. Your impact.

---

## Target audience

Design primarily for:

- Students, parents, volunteers, community members
- Organization heads who are busy and non-technical
- People with limited digital literacy
- Older adults who avoid complicated software

Do **not** optimize the main journey for power users, marketers, or developers.

Assume the user:

- Has never built a website
- Does not know marketing jargon
- May be nervous about “doing it wrong”
- Prefers examples and defaults over blank canvases

---

## Core value proposition

| User need | Corise response |
|---|---|
| “I don’t know what to write” | Friendly questions + editable AI suggestions |
| “I don’t know how websites work” | Automatic website preview from the same data |
| “I don’t have time to learn tools” | Short linear journey, one primary action per screen |
| “I need something that looks credible” | Premium, calm visual system (see `visual-design`) |
| “I need to show this to a decision-maker” | 10-minute demo-ready polished preview |

---

## Feature prioritization

### Must have (prototype)

- Organization name + simple description
- Guided campaign questions
- Simulated AI suggestions with accept / edit / reject
- Campaign review preview
- Organization website preview (hero, campaigns, CTAs, footer)
- Desktop / mobile preview toggle
- `sessionStorage` persistence for the session
- Honest labeling of simulated AI and non-published preview

### Nice later (out of scope now)

- Real AI APIs
- Backend, database, authentication
- Payments, CRM, email blasts
- Multi-user collaboration
- Custom domains / real publishing
- Analytics dashboards
- Complex brand kits or theme builders

### Reject unless it clearly serves the demo

- Extra settings screens
- Feature menus that fragment the journey
- Fake sophistication (charts, fake engagement metrics)
- Anything that invents achievements, testimonials, or impact numbers

---

## Scope restrictions

This phase is a **frontend-only presales prototype**.

- No backend, database, auth provider, or real AI API
- No external services required for the core demonstration
- No collection of unnecessary personal information
- No claim that the website is publicly live

Keep architecture ready for future backend/AI—but do not implement them now.

---

## Simplicity principles

1. **One obvious primary action** per screen (e.g., Continue, Get suggestions, Preview website).
2. **Short, familiar sentences.** Prefer “What do you want help with?” over “Select campaign conversion objectives.”
3. **Examples instead of empty fields.** Placeholder and sample content teach by showing.
4. **Sensible defaults.** Pre-select common campaign types; prefill safe sample data for demos when appropriate.
5. **Optional settings stay off the main path.** Advanced choices must not block the journey.
6. **Preserve progress** when going back; never punish exploration.
7. **Edit everything.** Suggestions are starting points, not locks.
8. **Ask permission** before applying AI text; never overwrite silently.
9. **One source of truth** for campaign + website content.
10. **Complete the core loop** before adding secondary features.

### Decision test

Before adding UI or logic, answer:

1. Does this help a non-technical person finish a campaign faster?
2. Does this make the organization website preview clearer or more credible?
3. Can a sales rep still finish a full demo in ~10 minutes?

If two answers are “no,” cut or defer the idea.

---

## Trust and transparency

Trust is part of the product.

**Required**

- Label simulated AI assistance clearly (e.g., “Demo writing help”).
- Label website output as a **preview**, not a published site.
- Mark sample/demo content so users know what is placeholder.
- Keep interactions reliable during live demos—no flaky network calls for core flows.

**Prohibited**

- Claiming a real AI model is connected when it is not
- Implying the demo site was published publicly
- Inventing organizational achievements, testimonials, donor counts, or impact statistics
- Hiding that values are session-only (demo data disappears when the browser session ends)

---

## Required behavior

- Frame screens around the six-step journey in `AGENTS.md`.
- Prefer progressive disclosure: ask only what is needed for the next step.
- Prefer human outcomes (“Raise funds for school supplies”) over tool outcomes (“Configure donation widget”).
- Keep Corise naming consistent; never introduce alternate product names.

## Prohibited behavior

- Building dashboards, admin consoles, or multi-step settings before the core journey is polished
- Adding features only to look sophisticated
- Using marketing jargon as primary UI copy
- Expanding scope into backend/AI integrations during the prototype phase

---

## Related skills

- `accessible-simple-ux` — how simplicity shows up in UI
- `presales-demo` — what “good” looks like in a live pitch
- `quality-check` — verify principles were respected
