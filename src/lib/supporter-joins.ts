/** Notes a supporter adds when they join a campaign. This browser session only. */

const KEY = "corise-supporter-joins-v1";

export type SupporterJoin = {
  campaignId: string;
  note: string;
  raised: number;
  joinedAt: string;
};

type JoinFile = { version: 1; byOrg: Record<string, SupporterJoin[]> };

function emptyFile(): JoinFile {
  return { version: 1, byOrg: {} };
}

function isJoin(value: unknown): value is SupporterJoin {
  if (!value || typeof value !== "object") return false;
  const join = value as SupporterJoin;
  return typeof join.campaignId === "string" && typeof join.note === "string" && typeof join.raised === "number" && typeof join.joinedAt === "string";
}

function readFile(): JoinFile {
  if (typeof window === "undefined") return emptyFile();
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return emptyFile();
    const parsed = JSON.parse(raw) as Partial<JoinFile>;
    if (parsed.version !== 1 || !parsed.byOrg || typeof parsed.byOrg !== "object") return emptyFile();
    const byOrg: Record<string, SupporterJoin[]> = {};
    for (const [slug, list] of Object.entries(parsed.byOrg)) {
      if (Array.isArray(list)) byOrg[slug] = list.filter(isJoin);
    }
    return { version: 1, byOrg };
  } catch {
    return emptyFile();
  }
}

function writeFile(file: JoinFile): boolean {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(file));
    return true;
  } catch {
    return false;
  }
}

export function loadSupporterJoins(orgSlug: string): SupporterJoin[] {
  return readFile().byOrg[orgSlug] ?? [];
}

/** Saves a join or replaces the note for the same campaign. */
export function saveSupporterJoin(orgSlug: string, join: SupporterJoin): { joins: SupporterJoin[]; saved: boolean } {
  const file = readFile();
  const current = file.byOrg[orgSlug] ?? [];
  const joins = [join, ...current.filter((item) => item.campaignId !== join.campaignId)];
  file.byOrg[orgSlug] = joins;
  return { joins, saved: writeFile(file) };
}

/** Stable sample amount so a joined card can show a leaderboard in the demo. */
export function sampleRaisedAmount(campaignId: string): number {
  const total = [...campaignId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return [40, 75, 120, 180][total % 4];
}
