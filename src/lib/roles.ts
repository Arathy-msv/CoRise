import type { ManagerRole } from "@/types/corise";

export type { ManagerRole };

/** Every signed-in user is the single owner of their workspace — there is no role split. */
export const OWNER_ROLE: ManagerRole = "owner";

export const OWNER_LABEL = "Organizer";

/** Accepts the current role plus legacy role values saved by older versions of the demo. */
export function isManagerRole(value: unknown): boolean {
  return value === "owner" || value === "website_manager" || value === "campaign_manager";
}

export function homePathForRole(role: ManagerRole | null | undefined): string {
  return role ? "/overview" : "/login";
}
