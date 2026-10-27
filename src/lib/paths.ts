/**
 * Public organization site. This is a real exported page plus a query, so a newly
 * created organization still opens on GitHub Pages. `/org/:slug` only exists for
 * sample organizations baked into the static build.
 */
export function publicOrgPath(orgSlug: string, opts?: { preview?: boolean }): string {
  const slug = encodeURIComponent(orgSlug);
  return opts?.preview ? `/open/org/?slug=${slug}&preview=1` : `/open/org/?slug=${slug}`;
}

/** Canonical campaign URL lives under the organization; `/campaign/:slug` stays as an alias. */
export function publicCampaignPath(campaignSlug: string, orgSlug?: string): string {
  return orgSlug ? `/org/${orgSlug}/${campaignSlug}` : `/campaign/${campaignSlug}`;
}

/** Campaign link that exists for every organization, including ones created after deploy. */
export function shareCampaignPath(campaignSlug: string, orgSlug?: string): string {
  const slug = encodeURIComponent(campaignSlug);
  return orgSlug ? `/open/campaign/?org=${encodeURIComponent(orgSlug)}&slug=${slug}` : `/open/campaign/?slug=${slug}`;
}

/** Create-campaign page. A static file plus a query, so a new organization can open it after deploy. */
export function newCampaignPath(orgSlug: string): string {
  return `/open/campaign/new/?slug=${encodeURIComponent(orgSlug)}`;
}

/** Shareable sign-in page for one organization's admin. The password is never part of the URL. */
export function orgAdminLoginPath(orgSlug: string): string {
  return `/login?org=${encodeURIComponent(orgSlug)}`;
}

/** Organization admin dashboard. A static page, so new organizations open after deploy. */
export function orgDashboardPath(orgSlug: string): string {
  return `/open/dashboard/?slug=${encodeURIComponent(orgSlug)}`;
}

/** True when the browser is already on this organization's dashboard. */
export function isOrgDashboardLocation(pathname: string, search: string, orgSlug: string): boolean {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const slug = new URLSearchParams(search).get("slug");
  if (path === "/open/dashboard" && slug === orgSlug) return true;
  return path === `/dashboard/${orgSlug}` || path === `/dashboard/${encodeURIComponent(orgSlug)}`;
}

/** Only same-origin relative paths are allowed as post-auth destinations. */
export function safeNextPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
