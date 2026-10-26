/** Personalized "share with a note" logic — pure functions so the URL/message building is testable. */

export const MAX_ENDORSER_NAME = 60;
export const MAX_ENDORSEMENT_NOTE = 240;

export const QUICK_ENDORSEMENT_PROMPTS: string[] = [
  "🌱 I just donated! Join me in reaching the goal.",
  "❤️ This cause means a lot to me. Every bit helps!",
  "🤝 Let's do this together!",
];

function clamp(value: string, max: number): string {
  return value.trim().slice(0, max);
}

/** Canonical path + query string (no origin) carrying the endorser's name/note, if any. */
export function buildPersonalizedShareQuery(name: string, note: string): string {
  const params = new URLSearchParams();
  const trimmedName = clamp(name, MAX_ENDORSER_NAME);
  const trimmedNote = clamp(note, MAX_ENDORSEMENT_NOTE);
  if (trimmedName) params.set("endorsedBy", trimmedName);
  if (trimmedNote) params.set("note", trimmedNote);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function buildPersonalizedShareUrl(origin: string, path: string, name: string, note: string): string {
  return `${origin}${path}${buildPersonalizedShareQuery(name, note)}`;
}

/** The sentence shown in the live preview and used as the message body for every share channel. */
export function buildShareMessage(name: string, note: string, link: string): string {
  const displayName = clamp(name, MAX_ENDORSER_NAME) || "A supporter";
  const displayNote = clamp(note, MAX_ENDORSEMENT_NOTE);
  return displayNote
    ? `${displayName} wants you to check out this campaign: "${displayNote}" — View Campaign: ${link}`
    : `${displayName} wants you to check out this campaign — View Campaign: ${link}`;
}

export type ParsedEndorsement = { endorsedBy: string; note: string };

/** Reads endorsedBy/note out of raw query values, trimmed and length-capped. No name -> nothing honest to show. */
export function parseEndorsement(endorsedByRaw: string | null | undefined, noteRaw: string | null | undefined): ParsedEndorsement | null {
  const endorsedBy = clamp(endorsedByRaw ?? "", MAX_ENDORSER_NAME);
  if (!endorsedBy) return null;
  const note = clamp(noteRaw ?? "", MAX_ENDORSEMENT_NOTE);
  return { endorsedBy, note };
}
