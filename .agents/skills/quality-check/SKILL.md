---
name: quality-check
description: Use before claiming Corise work is complete—run checklists for campaign flow, website preview, AI suggestions, persistence, accessibility, responsiveness, TypeScript, lint, build, and absence of backend dependencies.
---

# Corise Quality Check

## Goal

Verify that Corise remains a **complete, polished, demo-ready** frontend prototype. Do not claim done until the relevant checklists pass.

Use this skill at the end of a feature, before a PR, and before a sales rehearsal.

---

## 1. Complete campaign creation

- [ ] Organization name and description can be entered and saved
- [ ] Campaign goal and help/category can be entered
- [ ] User is not forced to invent all copy without suggestions or examples
- [ ] Campaign name, description, headline, and supporting text can be completed
- [ ] Optional fields (if present) do not block progress
- [ ] Back navigation preserves values
- [ ] Campaign review shows a polished preview (not a raw form dump)
- [ ] Primary action per step is obvious
- [ ] Sample data path works and is labeled

---

## 2. Organization website preview

- [ ] Preview shows organization name and identity
- [ ] Main headline and introduction appear
- [ ] Hero image loads (default asset works offline of remote CDNs if possible)
- [ ] Campaign card(s) reflect session campaign data
- [ ] CTAs are visible and use honest demo behavior
- [ ] Footer looks professional
- [ ] Preview looks like a website, not a dashboard or admin form
- [ ] Copy stays synchronized with campaign/organization edits
- [ ] Language says **preview**, not publicly published
- [ ] No invented testimonials, achievements, or impact statistics

---

## 3. AI suggestion behavior

- [ ] Suggestions are available for names, descriptions, headlines, and org introduction as designed
- [ ] Suggestions are contextual to user inputs
- [ ] User can accept, edit, or reject
- [ ] Nothing overwrites user text without permission
- [ ] UI labels assistance as simulated / demo writing help
- [ ] No claim of a connected real AI model
- [ ] Skipping suggestions still allows completing the journey
- [ ] Applied suggestions remain editable
- [ ] Generators are local and deterministic (no required external AI API)

---

## 4. Editing and navigation

- [ ] Every suggested field can be edited later
- [ ] Step progress is clear
- [ ] Forward/back does not wipe state
- [ ] Refine flows update previews without a fake “publish” requirement
- [ ] Every visible control does something meaningful
- [ ] Destructive reset asks for confirmation

---

## 5. Session persistence

- [ ] Data stored under `corise-demo-v1` in `sessionStorage`
- [ ] `localStorage` is **not** used for application data
- [ ] Refresh in the same session restores values
- [ ] Hydration does not break (no mismatched first paint from storage reads)
- [ ] Invalid stored JSON fails gracefully
- [ ] Reset clears demo state as documented
- [ ] Storage failure shows a calm fallback message (no crash)

---

## 6. Responsive layouts

- [ ] Core journey usable on a phone-width viewport
- [ ] No horizontal scrolling for primary content
- [ ] Website **desktop/mobile preview toggle** works and is visible
- [ ] Primary buttons remain reachable on small screens
- [ ] Type remains readable; tap targets are adequate

---

## 7. Accessibility

- [ ] Inputs have visible labels
- [ ] Keyboard can complete the happy path
- [ ] Focus styles are visible
- [ ] Errors are textual and associated with fields
- [ ] Color contrast is sufficient on ivory backgrounds
- [ ] Not relying on color alone for meaning
- [ ] Motion respects reduced-motion where animations exist
- [ ] Language is plain and suitable for limited digital literacy

---

## 8. Error handling

- [ ] Empty required fields produce helpful messages
- [ ] Failed suggestion attempt does not brick the wizard
- [ ] Missing images have safe defaults/fallbacks
- [ ] No silent failures on primary actions
- [ ] Demo honesty notices remain visible where required

---

## 9. TypeScript

- [ ] Domain models are typed
- [ ] `tsc` / `next build` typecheck passes when app exists
- [ ] Avoid unnecessary `any`
- [ ] Suggestion and storage modules have clear signatures

---

## 10. Linting

- [ ] Project lint script passes when configured
- [ ] No ignored lint errors introduced “just for the demo”
- [ ] Unused imports/dead code cleaned up in touched files

---

## 11. Production builds

- [ ] `next build` succeeds
- [ ] Production start/serve of the build works for the demo path
- [ ] No build-time dependency on secret AI/API keys for core pages

---

## 12. Absence of backend dependencies

- [ ] No database client required to run the demo
- [ ] No auth provider required to enter the journey
- [ ] No real AI API required for suggestions
- [ ] No external service required for the core happy path
- [ ] Any future-integration stubs cannot break the demo if unreachable
- [ ] README/`AGENTS.md` constraints still match the implementation

---

## Mandatory product rules cross-check

Confirm still true:

1. One obvious primary action per screen  
2. Short, familiar sentences  
3. Examples instead of blank forms  
4. Sensible defaults  
5. Optional settings out of the main journey  
6. Values preserved when navigating backward  
7. Every suggestion editable  
8. No overwrite without permission  
9. Campaign and website synchronized  
10. Desktop/mobile preview switching works  
11. Every visible control has a meaningful action  
12. Sample data and simulated features identified  
13. No invented achievements/testimonials/stats  
14. No implication the demo site was published publicly  
15. Core demo usable without external APIs  
16. Accessible, responsive, understandable  
17. No unnecessary personal information collected  
18. Polished core journey preferred over feature sprawl  

---

## Definition of done (release gate)

The prototype (or feature) is done only when:

1. Relevant sections above are checked  
2. Manual walkthrough of the six-step journey succeeds  
3. Presales timing still fits ~10 minutes (`presales-demo`)  
4. Typecheck, lint, and production build pass (when app code exists)  
5. Naming remains **Corise** everywhere in new UI and docs  

If any critical demo path item fails, it is **not done**.

---

## Related skills

- All other Corise skills — fix failures by returning to the owning skill
- `presales-demo` — rehearsal after engineering checks pass
