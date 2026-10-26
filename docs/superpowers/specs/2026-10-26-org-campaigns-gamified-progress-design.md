# Organization campaigns + gamified progress widgets

Approved 2026-10-26.

## Goal
Owners create campaigns from inside their organization workspace in three quick steps and can attach an optional
cartoon progress widget that advances with real supporter activity.

## Constraints
- Single Owner role (no Website/Campaign Manager split).
- No fake totals, sponsors, participants, or payments. Progress only moves from activity recorded in this browser.
- No new dependencies: widgets are inline SVG + CSS animation (no Lottie).
- Existing `/campaign/:slug` links keep working.

## Routes
- `/org/:orgSlug/campaigns/new` — owner-only 3-step creation (Title & Goal → Progress Widget → Publish).
- `/org/:orgSlug/:campaignSlug` — canonical public campaign URL. `/campaign/:slug` remains an alias.
- `/org/:orgSlug` — organization website (unchanged); featured campaigns link to the canonical URL.

## Data (backward compatible, all optional on `Campaign`)
- `progressWidget: 'tree' | 'race' | 'rocket' | 'cake' | 'none'`
- `goalType: 'amount' | 'participants'`, `goalTarget: number`
- `metrics.pledged: number`
- Current value: amount goals = sum of recorded pledges; participant goals = supporter count.
- Campaigns without `goalType` (incl. samples) never show the gamified widget.

## Pledges
Amount-goal pages show a pledge box: "Pledge only — no payment is taken." Positive whole amounts up to 1,000,000.

## `<CampaignGamifiedProgress type currentAmount targetAmount />`
- `progressPercent` clamps to 0–100; invalid/zero target → 0.
- `stageFor`: 0 (<25), 1 (<50), 2 (<75), 3 (<100), 4 (=100, payoff scene).
- Tree: seedling & soil → sprout + watering can → sun & leaves → budding tree → blooming fruit tree + confetti.
- Racer: car position along the track = percent, checkpoints at 25/50/75, finish flag.
- Rocket: fuel gauge fills; launches into orbit at 100%.
- Cake: tiers stack, frosting, candles lit at 100%.
- `none`: plain bar.
- Crossing into a higher stage plays a confetti burst + "New milestone unlocked!" (respects reduced motion).

## Testing
Logic: percent/stage math, campaign builder, input + pledge validation, org paths.
E2E: New Campaign button → 3 steps → each widget → publish → canonical + alias URLs → pledge advances widget and
celebrates → drafts never public.
