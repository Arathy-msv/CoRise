---
name: presales-demo
description: Use when preparing, implementing, or rehearsing the Corise 8–10 minute sales demonstration—including talking points, sample data, demo flow, honesty about simulated features, and demo reliability requirements.
---

# Corise Presales Demo

## Goal

Enable a sales representative to demonstrate the **entire Corise concept in approximately 8–10 minutes** to a prospective client—with minimal setup, impressive website preview, and no technical training for the audience.

---

## Demo principles

- Immediate understanding of the product
- Visually impressive final website preview
- Minimal user effort
- Clear, friendly writing help
- Realistic, editable sample content
- Smooth linear flow
- Professional, trustworthy appearance
- No registration or setup delays
- Reliable interactions (no flaky network calls on the core path)

Do not add features merely to appear sophisticated. Never claim simulated functionality is production-ready or connected to real services.

---

## Timing guide (8–10 minutes)

| Minutes | Segment | What to show |
|---|---|---|
| 0:00–1:00 | Opening value proposition | Promise + who it’s for |
| 1:00–2:00 | Organization setup | Name + simple description (or load sample) |
| 2:00–4:00 | Campaign creation | Goal, category, friendly questions |
| 4:00–5:30 | AI-assisted writing | Suggestions → accept/edit |
| 5:30–6:30 | Campaign review | Polished campaign preview |
| 6:30–8:30 | Organization website | Hero, campaigns, CTAs, footer; desktop/mobile |
| 8:30–9:30 | Final value recap | Effortless campaign + credible web presence |
| 9:30–10:00 | Questions | Discussion |

Adjust slightly for conversation; protect time for the **website reveal**—it is the emotional payoff.

---

## Opening value proposition

**Say something like:**

> “Corise helps ordinary people and organization leaders create a campaign and a professional organization website—without learning design tools or marketing software. You tell Corise what you want to do. We help you shape the words and show you a website preview.”

**Tagline:** Your idea. Your campaign. Your impact.

**Audience nod:** students, parents, volunteers, community groups, nonprofit and association leaders, people who are not “techy.”

---

## Organization setup

**Path A — live typing (credibility):** enter a prospect-relevant org name.  
**Path B — sample data (speed):** click “Load sample organization” then edit a field to prove it’s editable.

Show:

- Short question: organization name
- Short question: what the organization does
- Progress: Step 1 of the journey
- Primary button: Continue

Talking point: “No account creation— we can start immediately.”

---

## Campaign creation

Ask a few friendly questions only:

- What do you want to achieve?
- What kind of help do you need? (raise money / volunteers / items / awareness / event)

Talking point: “We don’t ask people to become marketers. We ask human questions.”

---

## AI-assisted writing

Demonstrate:

1. Click get suggestions
2. Show 2–3 campaign names and a description/headline
3. Apply one; edit a word
4. Emphasize user control

**Honest line (required):**

> “In this prototype, writing help is simulated so the demo is reliable. In the product vision, this becomes real AI assistance—with the same accept/edit flow.”

Never say the demo is wired to a live model if it is not.

---

## Campaign review

Show the polished campaign card/preview.

Talking point: “From a few plain answers, Corise produces something you could actually share with supporters.”

Invite a tiny edit to prove flexibility.

---

## Organization website preview

Reveal the customized site:

- Organization name and identity
- Headline and introduction
- Hero image
- Campaign cards
- Clear CTAs
- Professional footer

Talking points:

- “Same information—now as a website.”
- “This is a preview of how the organization could appear online.”
- Toggle **desktop / mobile** and pause so the room sees both.

**Honest line (required):**

> “This is a website preview for the demonstration—not a publicly published site. Publishing and hosting are part of the full product direction.”

Never imply the demo URL is live on the public internet.

---

## Final value recap

Close with outcomes, not features:

1. Fast path from idea → campaign  
2. Help writing without jargon  
3. Professional organization web presence preview  
4. Built for real people, not only digital experts  
5. Suitable for community orgs that need credibility without a web team  

**Optional close question:**  
“Where does your team today lose time—or confidence—when starting a campaign or updating your web presence?”

---

## Suggested sales talking points (quick list)

- “Built for limited digital literacy—short steps, large controls, plain language.”
- “One source of truth: change the campaign, the website updates.”
- “Defaults and examples so nobody faces a blank page.”
- “Demo runs without waiting on external AI or sign-up walls.”
- “We’re showing the core journey first—on purpose—not a cluttered suite.”

---

## Realistic editable sample data

Use clearly labeled sample content. Example set (adapt as needed):

**Organization**

- Name: `Riverside Community Garden`
- Description: `We help neighbors grow food side by side and share fresh produce with local families.`
- Introduction: `Riverside Community Garden is a volunteer-led group where neighbors plant, learn, and share harvests. We believe everyone deserves access to fresh food and green space.`

**Campaign**

- Category: `volunteers` or `fundraising`
- Goal: `Recruit weekend volunteers and raise funds for soil, tools, and children’s gardening workshops.`
- Name: `Spring Garden Boost`
- Headline: `Help our garden grow—and feed more neighbors`
- Description: `We’re preparing garden beds for spring planting and welcoming new volunteers. Your support helps us buy soil and tools and run weekend workshops for families.`
- Supporting text: `Whether you can spare an hour or chip in for supplies, you’re part of the harvest.`

Mark in UI: “Sample data — edit anything.”

Set `meta.isSampleData: true` in session state when loaded.

**Do not** include fake stats (“10,000 families served”, “$2M raised”) unless a prospect supplies real figures—and still avoid inventing them in defaults.

---

## Demo reliability checklist

Before a live meeting:

- [ ] App loads with no login
- [ ] Sample data loads in one click
- [ ] Reset demo data works
- [ ] Suggestions appear quickly and deterministically
- [ ] Website preview looks polished on projector/laptop
- [ ] Mobile preview toggle works
- [ ] Refresh retains session data mid-demo
- [ ] No console-breaking errors on the happy path
- [ ] Honesty labels visible for simulated AI and preview publishing

---

## Required behavior

- 8–10 minute complete arc ending in website payoff
- Sample data + editability
- Honest simulated AI and preview language
- No registration friction
- Stable offline-of-external-API core path

## Prohibited behavior

- Claiming live AI, live publishing, or production readiness for simulated parts
- Invented testimonials or impact numbers
- Side quests into settings, billing, or admin during the core pitch
- Demo scripts that require backend services

---

## Related skills

- `product-principles` — what to emphasize
- `organization-website` — preview quality bar
- `ai-assistance` — honesty + approval UX
- `quality-check` — verify demo readiness
