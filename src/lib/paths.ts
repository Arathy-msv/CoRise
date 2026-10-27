/** Public supporter URLs — no login required. */
export function publicOrgPath(orgSlug: string, opts?: { preview?: boolean }): string {
  const base = `/org/${orgSlug}`;
  return opts?.preview ? `${base}?preview=1` : base;
}

/** Canonical campaign URL lives under the organization; `/campaign/:slug` stays as an alias. */
export function publicCampaignPath(campaignSlug: string, orgSlug?: string): string {
  return orgSlug ? `/org/${orgSlug}/${campaignSlug}` : `/campaign/${campaignSlug}`;
}

export function newCampaignPath(orgSlug: string): string {
  return `/org/${orgSlug}/campaigns/new`;
}

/** Shareable sign-in page for one organization's admin. The password is never part of the URL. */
export function orgAdminLoginPath(orgSlug: string): string {
  return `/login?org=${encodeURIComponent(orgSlug)}`;
}

/** Only same-origin relative paths are allowed as post-auth destinations. */
export function safeNextPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
