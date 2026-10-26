---
name: session-state
description: Use when defining Corise application data models, reading or writing sessionStorage, handling refresh/hydration, validating stored data, resetting demos, or versioning the storage key.
---

# Corise Session State

## Goal

Persist organization and campaign values for the **current browser session** so refresh and in-journey navigation do not erase progress. Keep the approach simple, typed, and replaceable with a real backend later.

---

## Storage rules

| Rule | Detail |
|---|---|
| Mechanism | `sessionStorage` only for application data |
| Key | `corise-demo-v1` (namespaced + versioned) |
| Not allowed | `localStorage` for application data |
| Lifetime | Survives refresh; clears when the browser session ends |
| Scope | Frontend prototype only — no server persistence |

If the schema changes incompatibly, bump the version (`corise-demo-v2`) and ignore or migrate old payloads.

---

## Typed application data

Define a single TypeScript type (name illustrative) as the source of truth:

```ts
type CoriseDemoState = {
  version: 1
  organization: {
    name: string
    description: string
    introduction: string
  }
  campaign: {
    goal: string
    category: 'fundraising' | 'volunteers' | 'items' | 'awareness' | 'event' | ''
    name: string
    description: string
    headline: string
    supportingText: string
    optionalDeadline?: string
    optionalTargetLabel?: string
  }
  ui?: {
    currentStep?: string
    previewMode?: 'desktop' | 'mobile'
  }
  meta?: {
    updatedAt?: string
    isSampleData?: boolean
  }
}
```

Keep campaign and organization fields here—**do not** duplicate parallel “website-only” copy stores.

---

## Organization and campaign state

- Organization step writes `organization.*`
- Campaign / AI / review steps write `campaign.*`
- Website preview **reads** the same object
- UI step/preview preferences may live under `ui` but must not be required for content correctness

When applying an AI suggestion, write only after user approval (`ai-assistance`).

---

## sessionStorage persistence

### Write

- Serialize JSON for `corise-demo-v1`
- Update on meaningful changes (field blur/save, step continue, apply suggestion, preview toggle)
- Debounce rapid typing if needed to avoid excessive writes; never lose the last committed step

### Read

- Parse JSON safely
- Validate shape before use
- Return defaults if missing/invalid

### Example key

```ts
export const CORISE_STORAGE_KEY = 'corise-demo-v1'
```

---

## Refresh behavior

After refresh in the same tab/session:

- Previously entered organization and campaign values reappear
- User can continue near where they left off when `ui.currentStep` is stored
- Website preview reflects restored data

After the session ends (tab/window session cleared):

- State is gone — expected for the prototype
- Do not imply cloud save

---

## Hydration-safe initialization

Next.js + React hydration constraints:

1. Initial render on server and first client render must match.
2. Do **not** read `sessionStorage` during SSR or in a way that changes first paint markup inconsistently.
3. Pattern: start with safe defaults → `useEffect` (client) load from `sessionStorage` → then set state.
4. Optional: show a brief non-jarring loading/skeleton only if necessary; prefer instant defaults then soft fill.

Mark client components that touch storage with `'use client'`.

---

## Data validation

Before trusting stored JSON:

- Confirm `version` is supported
- Confirm required objects exist
- Coerce unknown categories to `''` or a safe default
- Trim strings; reject non-string unexpected types
- If invalid, fall back to empty defaults and optionally clear the bad key

Never `JSON.parse` without try/catch.

---

## Reset behavior

Provide an explicit **Reset demo data** (or equivalent) for sales reps:

- Clears `corise-demo-v1`
- Restores empty defaults or official sample data (user choice)
- Confirms before destructive reset
- Does not clear unrelated browser storage

Sample data loads should set `meta.isSampleData: true` and be labeled in UI.

---

## Storage error handling

Handle:

- `sessionStorage` unavailable (private mode quirks)
- Quota errors
- Security errors

Fallback:

- Keep in-memory state for the current page life
- Show a calm notice: “Your progress may not save if you refresh, because browser storage is unavailable.”
- Do not crash the app

---

## Required behavior

- Typed, versioned state under `corise-demo-v1`
- Refresh-safe within the session
- Hydration-safe loading
- Validation + graceful fallback
- Explicit reset for demos
- Single source of truth for campaign + website

## Prohibited behavior

- Using `localStorage` for application data
- Silent schema migrations that corrupt user text
- Reading storage in a hydration-breaking way
- Persisting secrets, passwords, or unnecessary personal data
- Backend sync pretending to exist

---

## Future extensibility

Isolate storage behind small helpers:

- `loadState(): CoriseDemoState`
- `saveState(state: CoriseDemoState): void`
- `clearState(): void`

Later, these can call an API without rewriting every form. Do not implement the API now.

---

## Related skills

- `nextjs-architecture` — client boundaries
- `campaign-creation` / `organization-website` — consumers of state
- `presales-demo` — sample data + reset during demos
- `quality-check` — persistence checklist
