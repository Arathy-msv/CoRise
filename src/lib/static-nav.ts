import { absoluteUrl, stripBasePath, withBasePath } from "@/lib/public-asset";
import { STATIC_CAMPAIGN_IDS, STATIC_CAMPAIGN_SLUGS, STATIC_ORG_SLUGS } from "@/lib/static-params";

const ORGS = new Set<string>(STATIC_ORG_SLUGS);
const CAMPAIGNS = new Set<string>(STATIC_CAMPAIGN_SLUGS);
const IDS = new Set<string>(STATIC_CAMPAIGN_IDS);

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * GitHub Pages can only serve HTML that `generateStaticParams` wrote.
 * Any other org, campaign, or dashboard address has to load as a full document
 * so `not-found.tsx` can draw it from the URL. The local dev server can render
 * those addresses itself, and a full load still hits that server.
 */
export function needsDocumentNavigation(path: string): boolean {
  const bare = stripBasePath(path.split(/[?#]/)[0]);
  let match = bare.match(/^\/org\/([^/]+)\/campaigns\/new$/);
  if (match) return !ORGS.has(decode(match[1]));
  match = bare.match(/^\/org\/([^/]+)\/([^/]+)$/);
  if (match) {
    if (match[2] === "campaigns") return true;
    return !(ORGS.has(decode(match[1])) && CAMPAIGNS.has(decode(match[2])));
  }
  match = bare.match(/^\/org\/([^/]+)$/);
  if (match) return !ORGS.has(decode(match[1]));
  match = bare.match(/^\/dashboard\/([^/]+)$/);
  if (match) return !ORGS.has(decode(match[1]));
  match = bare.match(/^\/campaigns\/([^/]+)$/);
  if (match) return match[1] !== "create" && !IDS.has(decode(match[1]));
  match = bare.match(/^\/(?:campaign|c)\/([^/]+)$/);
  if (match) return match[1] !== "draft-preview" && !CAMPAIGNS.has(decode(match[1]));
  return false;
}

/** Full-page load for a path the static export did not prebuild. Returns true when handled. */
export function assignAppPath(path: string): boolean {
  if (typeof window === "undefined" || !needsDocumentNavigation(path)) return false;
  const dest = new URL(withBasePath(path), window.location.origin);
  const samePath = dest.pathname.replace(/\/+$/, "") === window.location.pathname.replace(/\/+$/, "");
  if (samePath && dest.search === window.location.search) return true;
  window.location.assign(`${dest.pathname}${dest.search}${dest.hash}`);
  return true;
}

export function openAppPath(
  path: string,
  router: { push: (href: string) => void; replace: (href: string) => void },
  method: "push" | "replace" = "push",
) {
  if (assignAppPath(path)) return;
  router[method](path);
}

export function shareableUrl(path: string, origin?: string): string {
  return absoluteUrl(path, origin);
}
