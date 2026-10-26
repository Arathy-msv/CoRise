---
name: campaign-creation
description: Use when implementing or changing Corise campaign setup, categories, fields, naming, descriptions, review, editing, or campaign preview—and when syncing campaign data with the organization website.
---

# Corise Campaign Creation

## Goal

Guide users from a simple goal to a polished campaign preview without forcing them to invent professional copy unaided.

Campaign data is part of the **single source of truth** shared with the organization website.

---

## Guided campaign creation

Follow the journey after organization details exist:

1. Ask friendly questions about the campaign goal and help needed.
2. Offer AI writing help (see `ai-assistance`).
3. Show a polished campaign review/preview.
4. Allow edit-in-place or return to earlier steps without data loss.
5. Feed the same fields into website campaign cards.

One primary action per step (usually **Continue** or **Review campaign**).

---

## Campaign categories

Offer a small set of clear categories. Prefer selectable cards or large radio-style choices.

Suggested categories (labels in plain language):

| Category id | User-facing label | Meaning |
|---|---|---|
| `fundraising` | Raise money | Financial support |
| `volunteers` | Find volunteers | People giving time |
| `items` | Collect items | Donations of goods |
| `awareness` | Spread the word | Visibility / education |
| `event` | Invite people to an event | Attendance / RSVP-style goal |

Defaults: if the user is unsure, default to a sensible category from their description, or leave a clear “Not sure yet” that maps to `awareness` with editable copy.

Do not present dozens of niche types in the main journey.

---

## Minimum required fields

Collect only what the preview needs:

| Field | Required | Notes |
|---|---|---|
| `campaignGoal` | Yes | What they want to achieve, in their words |
| `helpNeeded` / `category` | Yes | Type of help |
| `campaignName` | Yes before review | May start empty until suggestions |
| `campaignDescription` | Yes before review | Short plain-language description |
| `headline` | Yes before website | Main public-facing line |
| `supportingText` | Recommended | Extra context under headline |

Organization fields (`organizationName`, `organizationDescription`, `organizationIntroduction`) live in organization state but appear in campaign/website previews.

---

## Optional fields

Keep optional and off the critical path unless the user opts in:

- Target amount or quantity (never invent a fake total raised)
- Deadline / event date
- Location (general, not precise personal address by default)
- Contact email/phone (avoid in prototype unless demo needs a CTA label only)
- Extra images beyond a default hero

If shown, mark clearly as **Optional**.

---

## Campaign naming suggestions

- Provide 3 short name options from local deterministic helpers (`ai-assistance`).
- Names should be warm, specific, and free of jargon.
- User must **accept**, **edit**, or **reject**; nothing auto-writes into the name field without approval.
- After accept, the field remains fully editable.

Example pattern:

> Suggestions for your campaign name  
> [ School Supply Drive ] [Use]  
> [ Help Our Classroom Thrive ] [Use]  
> [ Books and Backpacks for Spring ] [Use]

---

## Description suggestions

- Offer a short paragraph (2–4 sentences) derived from organization + goal + category.
- Offer a headline and supporting text as separate suggestions.
- Allow plain-language rewrite of the user’s own draft without discarding the original until they apply a change.
- Never invent impact statistics, awards, or testimonials inside descriptions.

---

## Campaign review

The review step should feel like a **finished campaign card**, not a form dump.

Show at least:

- Organization name
- Campaign name
- Headline
- Description / supporting text
- Category / help needed (in plain words)
- Optional date or target if provided
- Primary CTA label appropriate to category (e.g., “Support this campaign”, “Volunteer”, “Learn more”) — label only in the prototype; no real payment

Actions:

- **Edit** individual sections
- **Back** to earlier steps (values preserved)
- **Continue to website** as primary action

---

## Editing

- Every suggested or entered field remains editable.
- Inline edit or “Edit this section” both acceptable; prefer obvious controls.
- Saving an edit updates session state immediately and refreshes any visible preview.
- Navigating backward must restore the latest saved values.

---

## Campaign preview

Preview requirements:

- Looks public-facing and credible
- Uses Corise visual system (`visual-design`)
- Does not look like an admin form
- Clearly part of the demo journey (no fake “live” badge that implies production publishing)

If sample data is shown, mark it as sample.

---

## Integration with the organization website

**Single source of truth**

Campaign fields in session state power:

- Campaign review
- Website campaign cards
- Shared headline / supporting copy where applicable

When the user edits campaign name, description, or headline anywhere, website preview updates without a separate “sync” step.

Do not maintain divergent copies of the same text in React state without a shared store/util.

Website listing rules:

- Show the current campaign as a card on the org site
- Card content mirrors campaign preview fields
- CTA on the card matches category language
- Do not invent additional campaigns unless the user created them (prototype may support one campaign first)

---

## Required behavior

- Guide with questions; do not require professional copywriting up front.
- Provide suggestions so users are not forced to invent all content.
- Preserve values on back navigation and refresh (`session-state`).
- Keep campaign and website synchronized.
- Use Corise naming only.

## Prohibited behavior

- Blank mandatory essay fields with no examples or help
- Auto-applying AI text without acceptance
- Fake raised amounts, donor counts, or social proof
- Separate unpublished “draft website copy” that drifts from campaign fields
- Backend save, auth walls, or real payment checkout in this prototype

---

## Implementation guidance

Suggested module split (names illustrative):

- `types/campaign.ts` — typed campaign model
- `lib/suggestions/campaign.ts` — deterministic name/description/headline helpers
- `components/campaign/*` — step UI, review, preview card
- Session read/write via `session-state` utilities

Wire steps into App Router pages or a single wizard route with clear step state—prefer clarity over cleverness (`nextjs-architecture`).

---

## Related skills

- `ai-assistance` — suggestion generation and approval
- `organization-website` — how campaigns appear on the site
- `session-state` — persistence shape
- `accessible-simple-ux` — question and form design
