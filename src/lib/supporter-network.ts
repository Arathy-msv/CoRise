import { uid } from "@/lib/format";
import { DEFAULT_SUPPORTER_ID, findSupporter } from "@/lib/supporters";

/**
 * Supporter memberships, Org Admin invitations, and referral conversions.
 * Kept in this browser's localStorage next to the campaign data, so every tab sees the same records.
 * Campaigns themselves stay in the organization workspace — records here only point at them by id.
 */
export const SUPPORTER_NETWORK_KEY = "corise-supporter-network-v1";
const LEGACY_JOINS_KEY = "corise-supporter-joins-v1";
const CHANGE_EVENT = "corise-supporter-network-changed";

export const MAX_PERSONAL_NOTE = 400;
export const MAX_INVITATION_MESSAGE = 400;

export type MembershipSource = "joined" | "invitation";

export type CampaignMembership = {
  id: string;
  orgSlug: string;
  campaignId: string;
  supporterId: string;
  joinedAt: string;
  personalNote: string;
  source: MembershipSource;
};

export type InvitationStatus = "pending" | "accepted" | "declined";

export type CampaignInvitation = {
  id: string;
  orgSlug: string;
  campaignId: string;
  /** Title when the invitation was sent, shown if the campaign is later unpublished. */
  campaignTitle: string;
  supporterId: string;
  message: string;
  invitedBy: string;
  invitedAt: string;
  status: InvitationStatus;
  respondedAt?: string;
};

export type ConversionKind = "pledge" | "participation";

/** One pledge or sign-up that arrived through a supporter's personal link. `id` is unique per conversion. */
export type SupporterReferral = {
  id: string;
  orgSlug: string;
  campaignId: string;
  referringSupporterId: string;
  kind: ConversionKind;
  amount: number;
  at: string;
};

export type SupporterNetwork = {
  version: 1;
  currentSupporterId: string;
  memberships: CampaignMembership[];
  invitations: CampaignInvitation[];
  referrals: SupporterReferral[];
  legacyImported: boolean;
};

function emptyNetwork(): SupporterNetwork {
  return {
    version: 1,
    currentSupporterId: DEFAULT_SUPPORTER_ID,
    memberships: [],
    invitations: [],
    referrals: [],
    legacyImported: false,
  };
}

const EMPTY_NETWORK = emptyNetwork();

function isText(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function parseMembership(value: unknown): CampaignMembership | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!isText(v.id) || !isText(v.orgSlug) || !isText(v.campaignId) || !isText(v.supporterId)) return null;
  return {
    id: v.id,
    orgSlug: v.orgSlug,
    campaignId: v.campaignId,
    supporterId: v.supporterId,
    joinedAt: isText(v.joinedAt) ? v.joinedAt : new Date(0).toISOString(),
    personalNote: text(v.personalNote, MAX_PERSONAL_NOTE),
    source: v.source === "invitation" ? "invitation" : "joined",
  };
}

function parseInvitation(value: unknown): CampaignInvitation | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!isText(v.id) || !isText(v.orgSlug) || !isText(v.campaignId) || !isText(v.supporterId)) return null;
  const status: InvitationStatus = v.status === "accepted" || v.status === "declined" ? v.status : "pending";
  return {
    id: v.id,
    orgSlug: v.orgSlug,
    campaignId: v.campaignId,
    campaignTitle: text(v.campaignTitle, 200),
    supporterId: v.supporterId,
    message: text(v.message, MAX_INVITATION_MESSAGE),
    invitedBy: text(v.invitedBy, 120),
    invitedAt: isText(v.invitedAt) ? v.invitedAt : new Date(0).toISOString(),
    status,
    respondedAt: isText(v.respondedAt) ? v.respondedAt : undefined,
  };
}

function parseReferral(value: unknown): SupporterReferral | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!isText(v.id) || !isText(v.orgSlug) || !isText(v.campaignId) || !isText(v.referringSupporterId)) return null;
  const amount = typeof v.amount === "number" && Number.isFinite(v.amount) && v.amount > 0 ? Math.floor(v.amount) : 0;
  return {
    id: v.id,
    orgSlug: v.orgSlug,
    campaignId: v.campaignId,
    referringSupporterId: v.referringSupporterId,
    kind: v.kind === "participation" ? "participation" : "pledge",
    amount,
    at: isText(v.at) ? v.at : new Date(0).toISOString(),
  };
}

function compact<T>(items: unknown, parse: (value: unknown) => T | null, keyOf: (item: T) => string): T[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const out: T[] = [];
  for (const raw of items) {
    const item = parse(raw);
    if (!item) continue;
    const key = keyOf(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** Tolerates missing, corrupt, or partially valid data. Unknown versions start fresh. */
export function parseNetwork(raw: string | null): SupporterNetwork {
  if (!raw) return emptyNetwork();
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== "object" || parsed.version !== 1) return emptyNetwork();
    const currentSupporterId =
      typeof parsed.currentSupporterId === "string" && findSupporter(parsed.currentSupporterId)
        ? parsed.currentSupporterId
        : DEFAULT_SUPPORTER_ID;
    return {
      version: 1,
      currentSupporterId,
      memberships: compact(parsed.memberships, parseMembership, (m) => `${m.orgSlug}|${m.campaignId}|${m.supporterId}`),
      invitations: compact(parsed.invitations, parseInvitation, (i) => i.id),
      referrals: compact(parsed.referrals, parseReferral, (r) => r.id),
      legacyImported: parsed.legacyImported === true,
    };
  } catch {
    return emptyNetwork();
  }
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

let cachedRaw: string | null | undefined;
let cachedNetwork: SupporterNetwork = EMPTY_NETWORK;

/** Current records. Returns the same object until the stored JSON changes, so it is safe as a store snapshot. */
export function readNetwork(): SupporterNetwork {
  const s = storage();
  if (!s) return EMPTY_NETWORK;
  let raw: string | null = null;
  try {
    raw = s.getItem(SUPPORTER_NETWORK_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedNetwork = parseNetwork(raw);
  }
  return cachedNetwork;
}

export function serverNetwork(): SupporterNetwork {
  return EMPTY_NETWORK;
}

/** Fires for changes in this tab (custom event) and other tabs (storage event). */
export function subscribeNetwork(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === SUPPORTER_NETWORK_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Applies a change against the latest stored copy. Return null from `change` to leave storage untouched. */
function update(change: (current: SupporterNetwork) => SupporterNetwork | null): SupporterNetwork | null {
  const s = storage();
  if (!s) return null;
  const next = change(readNetwork());
  if (!next) return null;
  try {
    s.setItem(SUPPORTER_NETWORK_KEY, JSON.stringify(next));
  } catch {
    return null;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return next;
}

/** Moves joins saved by the earlier session-only supporter page into memberships for the current supporter, once. */
export function importLegacyJoins(): void {
  if (readNetwork().legacyImported || typeof window === "undefined") return;
  const legacy: { orgSlug: string; campaignId: string; note: string; joinedAt: string }[] = [];
  try {
    const raw = window.sessionStorage.getItem(LEGACY_JOINS_KEY);
    const parsed = raw ? (JSON.parse(raw) as { byOrg?: Record<string, unknown> }) : null;
    for (const [orgSlug, joins] of Object.entries(parsed?.byOrg ?? {})) {
      if (!Array.isArray(joins)) continue;
      for (const join of joins as Record<string, unknown>[]) {
        if (!join || !isText(join.campaignId)) continue;
        legacy.push({
          orgSlug,
          campaignId: join.campaignId,
          note: text(join.note, MAX_PERSONAL_NOTE),
          joinedAt: isText(join.joinedAt) ? join.joinedAt : new Date().toISOString(),
        });
      }
    }
  } catch {
    // Unreadable legacy data is skipped.
  }
  const saved = update((n) => {
    const memberships = [...n.memberships];
    for (const join of legacy) {
      if (findMembership({ ...n, memberships }, join.orgSlug, join.campaignId, n.currentSupporterId)) continue;
      memberships.push({
        id: uid("mem"),
        orgSlug: join.orgSlug,
        campaignId: join.campaignId,
        supporterId: n.currentSupporterId,
        joinedAt: join.joinedAt,
        personalNote: join.note,
        source: "joined",
      });
    }
    return { ...n, memberships, legacyImported: true };
  });
  if (saved) {
    try {
      window.sessionStorage.removeItem(LEGACY_JOINS_KEY);
    } catch {
      // ignore
    }
  }
}

export function setCurrentSupporter(supporterId: string): boolean {
  if (!findSupporter(supporterId)) return false;
  return Boolean(update((n) => (n.currentSupporterId === supporterId ? null : { ...n, currentSupporterId: supporterId })));
}

export function findMembership(
  network: SupporterNetwork,
  orgSlug: string,
  campaignId: string,
  supporterId: string,
): CampaignMembership | undefined {
  return network.memberships.find(
    (m) => m.orgSlug === orgSlug && m.campaignId === campaignId && m.supporterId === supporterId,
  );
}

function newMembership(orgSlug: string, campaignId: string, supporterId: string, source: MembershipSource): CampaignMembership {
  return {
    id: uid("mem"),
    orgSlug,
    campaignId,
    supporterId,
    joinedAt: new Date().toISOString(),
    personalNote: "",
    source,
  };
}

/** Joins without donating. Joining twice returns the existing membership. */
export function joinCampaign(input: {
  orgSlug: string;
  campaignId: string;
  supporterId: string;
}): { membership: CampaignMembership | null; created: boolean } {
  const { orgSlug, campaignId, supporterId } = input;
  if (!orgSlug || !campaignId || !findSupporter(supporterId)) return { membership: null, created: false };
  const existing = findMembership(readNetwork(), orgSlug, campaignId, supporterId);
  if (existing) return { membership: existing, created: false };
  const membership = newMembership(orgSlug, campaignId, supporterId, "joined");
  const saved = update((n) =>
    findMembership(n, orgSlug, campaignId, supporterId) ? null : { ...n, memberships: [...n.memberships, membership] },
  );
  if (!saved) {
    const raced = findMembership(readNetwork(), orgSlug, campaignId, supporterId);
    return { membership: raced ?? null, created: false };
  }
  return { membership, created: true };
}

/** Only the supporter who owns the membership can change its note. An empty note clears it. */
export function savePersonalNote(membershipId: string, supporterId: string, note: string): boolean {
  const personalNote = note.trim().slice(0, MAX_PERSONAL_NOTE);
  return Boolean(
    update((n) => {
      const target = n.memberships.find((m) => m.id === membershipId && m.supporterId === supporterId);
      if (!target) return null;
      return {
        ...n,
        memberships: n.memberships.map((m) => (m.id === membershipId ? { ...m, personalNote } : m)),
      };
    }),
  );
}

export function defaultPersonalNote(campaignTitle: string): string {
  return `I'm supporting ${campaignTitle}. Please join me and help us reach the goal together.`;
}

export type InvitationResult = { created: number; alreadyInvited: number; alreadyJoined: number };

/** Creates one pending invitation per supporter. Skips people already invited or already joined. */
export function sendInvitations(input: {
  orgSlug: string;
  campaignId: string;
  campaignTitle: string;
  supporterIds: string[];
  message: string;
  invitedBy: string;
}): InvitationResult | null {
  const result: InvitationResult = { created: 0, alreadyInvited: 0, alreadyJoined: 0 };
  if (!input.orgSlug || !input.campaignId) return null;
  const message = input.message.trim().slice(0, MAX_INVITATION_MESSAGE);
  const saved = update((n) => {
    const invitations = [...n.invitations];
    for (const supporterId of new Set(input.supporterIds)) {
      if (!findSupporter(supporterId)) continue;
      if (findMembership(n, input.orgSlug, input.campaignId, supporterId)) {
        result.alreadyJoined += 1;
        continue;
      }
      const pending = invitations.some(
        (i) =>
          i.orgSlug === input.orgSlug &&
          i.campaignId === input.campaignId &&
          i.supporterId === supporterId &&
          i.status === "pending",
      );
      if (pending) {
        result.alreadyInvited += 1;
        continue;
      }
      invitations.push({
        id: uid("inv"),
        orgSlug: input.orgSlug,
        campaignId: input.campaignId,
        campaignTitle: input.campaignTitle.slice(0, 200),
        supporterId,
        message,
        invitedBy: input.invitedBy.slice(0, 120),
        invitedAt: new Date().toISOString(),
        status: "pending",
      });
      result.created += 1;
    }
    return result.created > 0 ? { ...n, invitations } : null;
  });
  if (result.created > 0 && !saved) return null;
  return result;
}

/** Accepting creates the membership (or reuses an existing one). Neither answer records a donation. */
export function respondToInvitation(
  invitationId: string,
  supporterId: string,
  response: "accepted" | "declined",
): { ok: boolean; joined: boolean } {
  let joined = false;
  const saved = update((n) => {
    const invitation = n.invitations.find((i) => i.id === invitationId);
    if (!invitation || invitation.supporterId !== supporterId || invitation.status !== "pending") return null;
    const invitations = n.invitations.map((i) =>
      i.id === invitationId ? { ...i, status: response, respondedAt: new Date().toISOString() } : i,
    );
    let memberships = n.memberships;
    if (response === "accepted" && !findMembership(n, invitation.orgSlug, invitation.campaignId, supporterId)) {
      memberships = [...memberships, newMembership(invitation.orgSlug, invitation.campaignId, supporterId, "invitation")];
      joined = true;
    }
    return { ...n, invitations, memberships };
  });
  return { ok: Boolean(saved), joined };
}

/** A `?supporter=` value only counts when that supporter really joined this campaign. */
export function resolveReferrer(
  network: SupporterNetwork,
  orgSlug: string,
  campaignId: string,
  supporterId: string | null | undefined,
): CampaignMembership | null {
  if (!supporterId || !findSupporter(supporterId)) return null;
  return findMembership(network, orgSlug, campaignId, supporterId) ?? null;
}

/** Records one conversion for the referring supporter. The same conversion id is never counted twice. */
export function recordReferralConversion(input: {
  conversionId: string;
  orgSlug: string;
  campaignId: string;
  referringSupporterId: string;
  kind: ConversionKind;
  amount: number;
}): boolean {
  const amount = input.kind === "pledge" && Number.isFinite(input.amount) && input.amount > 0 ? Math.floor(input.amount) : 0;
  return Boolean(
    update((n) => {
      if (n.referrals.some((r) => r.id === input.conversionId)) return null;
      if (!resolveReferrer(n, input.orgSlug, input.campaignId, input.referringSupporterId)) return null;
      return {
        ...n,
        referrals: [
          ...n.referrals,
          {
            id: input.conversionId,
            orgSlug: input.orgSlug,
            campaignId: input.campaignId,
            referringSupporterId: input.referringSupporterId,
            kind: input.kind,
            amount,
            at: new Date().toISOString(),
          },
        ],
      };
    }),
  );
}

export type LeaderboardRow = {
  supporterId: string;
  name: string;
  amount: number;
  conversions: number;
  rank: number;
};

/**
 * Everyone who joined this campaign, ranked by pledged dollars through their link, then number of
 * conversions, then who joined first. The final tie-break on supporter id keeps the order stable.
 */
export function campaignLeaderboard(network: SupporterNetwork, orgSlug: string, campaignId: string): LeaderboardRow[] {
  const members = network.memberships.filter((m) => m.orgSlug === orgSlug && m.campaignId === campaignId);
  const totals = new Map<string, { amount: number; conversions: number }>();
  for (const r of network.referrals) {
    if (r.orgSlug !== orgSlug || r.campaignId !== campaignId) continue;
    const t = totals.get(r.referringSupporterId) ?? { amount: 0, conversions: 0 };
    t.amount += r.amount;
    t.conversions += 1;
    totals.set(r.referringSupporterId, t);
  }
  return members
    .map((m) => ({
      membership: m,
      name: findSupporter(m.supporterId)?.name ?? "A supporter",
      ...(totals.get(m.supporterId) ?? { amount: 0, conversions: 0 }),
    }))
    .sort(
      (a, b) =>
        b.amount - a.amount ||
        b.conversions - a.conversions ||
        a.membership.joinedAt.localeCompare(b.membership.joinedAt) ||
        a.membership.supporterId.localeCompare(b.membership.supporterId),
    )
    .map((row, index) => ({
      supporterId: row.membership.supporterId,
      name: row.name,
      amount: row.amount,
      conversions: row.conversions,
      rank: index + 1,
    }));
}
