import type { Campaign, CoriseDemoState, ManagerRole } from "@/types/corise";
import { createInitialState } from "@/lib/sample-data";
import { buildOrgCampaign } from "@/lib/org-campaign";
import { APP_STORAGE_KEY } from "@/lib/deployment";
import { isManagerRole, OWNER_ROLE } from "@/lib/roles";
import { isProgressWidget } from "@/lib/progress";

/** Stable public campaign so the garden game has a link in this browser. */
export const SCHOOL_GARDEN_SLUG = "our-school-garden";
const SCHOOL_GARDEN_ID = "camp-school-garden";

function withSchoolGarden(state: CoriseDemoState): CoriseDemoState {
  if (state.campaigns.some((c) => c.id === SCHOOL_GARDEN_ID || c.slug === SCHOOL_GARDEN_SLUG)) return state;
  const campaign = buildOrgCampaign(
    {
      headline: "Our School Garden",
      description: "Care for our shared tree and, together, we can grow a greener, brighter school garden.",
      goalType: "amount",
      target: "1000",
      widget: "tree",
      presentationMode: "both",
    },
    state.organization,
    "2026-10-26T12:00:00.000Z",
  );
  return {
    ...state,
    campaigns: [{ ...campaign, id: SCHOOL_GARDEN_ID, slug: SCHOOL_GARDEN_SLUG }, ...state.campaigns],
  };
}

/** Stable public campaign so the Retro Racer game has a link in this browser. */
export const YOUTH_GRAND_PRIX_SLUG = "neighborhood-youth-grand-prix";
const YOUTH_GRAND_PRIX_ID = "camp-youth-grand-prix";

function withGrandPrix(state: CoriseDemoState): CoriseDemoState {
  if (state.campaigns.some((c) => c.id === YOUTH_GRAND_PRIX_ID || c.slug === YOUTH_GRAND_PRIX_SLUG)) return state;
  const campaign = buildOrgCampaign(
    {
      headline: "Neighborhood Youth Grand Prix",
      description: "Support our neighborhood youth team and help our retro racer complete the race.",
      goalType: "amount",
      target: "1000",
      widget: "race",
      presentationMode: "both",
      pitPrices: { nitro: 50, tire: 25, tune: 15 },
    },
    state.organization,
    "2026-10-27T12:00:00.000Z",
  );
  return {
    ...state,
    campaigns: [{ ...campaign, id: YOUTH_GRAND_PRIX_ID, slug: YOUTH_GRAND_PRIX_SLUG }, ...state.campaigns],
  };
}

/** Stable public campaign so the Cozy Paws game has a link in this browser. */
export const COZY_PAWS_SLUG = "cozy-paws-sanctuary";
const COZY_PAWS_ID = "camp-cozy-paws";

function withCozyPaws(state: CoriseDemoState): CoriseDemoState {
  if (state.campaigns.some((c) => c.id === COZY_PAWS_ID || c.slug === COZY_PAWS_SLUG)) return state;
  const campaign = buildOrgCampaign(
    {
      headline: "Cozy Paws Sanctuary",
      description: "Support Cozy Paws Sanctuary and help our rescue animals rest comfortably.",
      goalType: "amount",
      target: "1000",
      widget: "shelter",
      presentationMode: "both",
      shelterPrices: { meal: 15, toys: 25, vet: 50 },
    },
    state.organization,
    "2026-10-27T13:00:00.000Z",
  );
  return {
    ...state,
    campaigns: [{ ...campaign, id: COZY_PAWS_ID, slug: COZY_PAWS_SLUG }, ...state.campaigns],
  };
}

/** Stable public campaign so the Starry Night Campfire game has a link in this browser. */
export const CAMPFIRE_SLUG = "starry-night-campfire";
const CAMPFIRE_ID = "camp-starry-night";

function withCampfire(state: CoriseDemoState): CoriseDemoState {
  if (state.campaigns.some((c) => c.id === CAMPFIRE_ID || c.slug === CAMPFIRE_SLUG)) return state;
  const campaign = buildOrgCampaign(
    {
      headline: "Starry Night Campfire",
      description: "Support our youth camp and help us gather around the fire.",
      goalType: "amount",
      target: "1000",
      widget: "campfire",
      presentationMode: "both",
      campfirePrices: { firewood: 15, tent: 35, lights: 50 },
    },
    state.organization,
    "2026-10-27T14:00:00.000Z",
  );
  return {
    ...state,
    campaigns: [{ ...campaign, id: CAMPFIRE_ID, slug: CAMPFIRE_SLUG }, ...state.campaigns],
  };
}

/** Stable public campaign so the Castle Workshop game has a link in this browser. */
export const CASTLE_SLUG = "castle-workshop";
const CASTLE_ID = "camp-castle-workshop";

function withCastle(state: CoriseDemoState): CoriseDemoState {
  const existing = state.campaigns.find((c) => c.id === CASTLE_ID || c.slug === CASTLE_SLUG);
  if (existing) {
    if (existing.progressWidget === "castle" && existing.goalType === "amount" && existing.status === "published") return state;
    return {
      ...state,
      campaigns: state.campaigns.map((c) =>
        c.id === existing.id
          ? {
              ...c,
              status: "published" as const,
              archived: false,
              goalType: "amount" as const,
              goalTarget: c.goalTarget && c.goalTarget > 0 ? c.goalTarget : 1000,
              progressWidget: "castle" as const,
              presentationMode: c.presentationMode ?? "both",
              castlePrices: c.castlePrices ?? { stone: 15, window: 35, flag: 60 },
            }
          : c,
      ),
    };
  }
  const campaign = buildOrgCampaign(
    {
      headline: "Castle Workshop",
      description: "Support our community and help our animal builders construct a storybook stone castle.",
      goalType: "amount",
      target: "1000",
      widget: "castle",
      presentationMode: "both",
      castlePrices: { stone: 15, window: 35, flag: 60 },
    },
    state.organization,
    "2026-10-27T15:00:00.000Z",
  );
  return {
    ...state,
    campaigns: [{ ...campaign, id: CASTLE_ID, slug: CASTLE_SLUG }, ...state.campaigns],
  };
}

function withDemoGames(state: CoriseDemoState): CoriseDemoState {
  return withCastle(withCampfire(withCozyPaws(withGrandPrix(withSchoolGarden(state)))));
}

/**
 * The game demo links (/garden, /race, /shelter, /campfire, /castle) are a SaaS showcase
 * fixture. A fresh Licensed Edition workspace starts genuinely empty, so it reads the
 * deployment mode directly from its own localStorage key rather than injecting them.
 */
function isSaasMode(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw) as { mode?: string };
    return parsed.mode !== "licensed";
  } catch {
    return true;
  }
}

export const CORISE_STORAGE_KEY = "corise-demo-v1";

/**
 * Demo persistence lives in this browser's localStorage so published links open in any tab.
 * It is not a backend: other browsers and devices never see this data.
 */
function store(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeCampaign(c: Campaign): Campaign {
  return {
    ...c,
    featureOnWebsite: c.featureOnWebsite ?? true,
    archived: c.archived ?? false,
    progressWidget: isProgressWidget(c.progressWidget) ? c.progressWidget : c.goalType ? "none" : undefined,
    presentationMode: c.presentationMode ?? "game",
    metrics: { ...c.metrics, pledged: Number.isFinite(c.metrics?.pledged) ? c.metrics.pledged : 0 },
  };
}

function normalizeManagerRole(
  parsed: Partial<CoriseDemoState>,
  fallback: CoriseDemoState
): ManagerRole | null {
  if (parsed.isSignedIn || isManagerRole(parsed.managerRole)) return OWNER_ROLE;
  return fallback.managerRole;
}

export function loadState(): CoriseDemoState {
  const applyDemoGames = isSaasMode() ? withDemoGames : (s: CoriseDemoState) => s;
  const fallback = applyDemoGames(createInitialState());
  const s = store();
  if (!s) return fallback;

  try {
    const raw = s.getItem(CORISE_STORAGE_KEY) ?? window.sessionStorage.getItem(CORISE_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<CoriseDemoState>;
    if (parsed.version !== 1 || !Array.isArray(parsed.campaigns)) {
      return fallback;
    }
    const managerRole = normalizeManagerRole(parsed, fallback);
    return applyDemoGames({
      ...fallback,
      ...parsed,
      version: 1,
      isSignedIn: Boolean(parsed.isSignedIn && managerRole),
      managerRole: parsed.isSignedIn ? managerRole : null,
      organization: { ...fallback.organization, ...parsed.organization },
      website: parsed.website === undefined ? fallback.website : parsed.website,
      websiteDraft: parsed.websiteDraft ?? null,
      campaigns: parsed.campaigns.map(normalizeCampaign),
      activity: parsed.activity ?? fallback.activity,
      marketplace: parsed.marketplace?.length ? parsed.marketplace : fallback.marketplace,
      draft: parsed.draft ?? null,
      pendingSpace: parsed.pendingSpace ?? null,
      claimedSpace: parsed.claimedSpace ?? null,
      toast: null,
    });
  } catch {
    return fallback;
  }
}

export function saveState(state: CoriseDemoState): void {
  const s = store();
  if (!s) return;
  try {
    const { toast: _toast, ...persistable } = state;
    const next = JSON.stringify(persistable);
    if (s.getItem(CORISE_STORAGE_KEY) !== next) s.setItem(CORISE_STORAGE_KEY, next);
  } catch {
    // Private mode / quota — keep in-memory only
  }
}

export function clearState(): void {
  const s = store();
  if (!s) return;
  try {
    s.removeItem(CORISE_STORAGE_KEY);
    window.sessionStorage.removeItem(CORISE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
