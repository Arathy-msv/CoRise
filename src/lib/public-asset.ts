/**
 * Prefix bundled files and copied links when the site is hosted under a subpath,
 * such as GitHub Pages at /CoRise. Local `next dev` leaves this empty.
 * Next inlines NEXT_PUBLIC_* at build time, so call these functions at use time.
 */
export function basePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

/** Root-relative path, query, and hash, with the deploy prefix applied once. */
export function withBasePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const prefix = basePath();
  const hashAt = path.indexOf("#");
  const hash = hashAt >= 0 ? path.slice(hashAt) : "";
  const beforeHash = hashAt >= 0 ? path.slice(0, hashAt) : path;
  const queryAt = beforeHash.indexOf("?");
  const query = queryAt >= 0 ? beforeHash.slice(queryAt) : "";
  const pathname = queryAt >= 0 ? beforeHash.slice(0, queryAt) : beforeHash;
  if (!prefix || pathname === prefix || pathname.startsWith(`${prefix}/`)) return `${pathname}${query}${hash}`;
  return `${prefix}${pathname}${query}${hash}`;
}

/** Drop the deploy prefix and a trailing slash so route checks see `/org/acme`. */
export function stripBasePath(pathname: string): string {
  let path = pathname || "/";
  const prefixes = [basePath(), "/CoRise"].filter((prefix, index, all) => prefix && all.indexOf(prefix) === index);
  for (const prefix of prefixes) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      path = path.slice(prefix.length) || "/";
      break;
    }
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

export function publicAsset(path: string): string {
  return withBasePath(path);
}

/** Absolute URL for a same-origin app path. Includes /CoRise on the static deploy. */
export function absoluteUrl(path: string, origin?: string): string {
  const prefixed = withBasePath(path);
  const base = origin ?? (typeof window === "undefined" ? "" : window.location.origin);
  return base ? `${base}${prefixed}` : prefixed;
}
