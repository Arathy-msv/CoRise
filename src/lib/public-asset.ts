/** Prefix bundled files when the site is hosted under a subpath, such as GitHub Pages. */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function publicAsset(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${BASE_PATH}${path}`;
}
