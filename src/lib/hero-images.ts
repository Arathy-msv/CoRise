/**
 * Cover photos bundled with the app (generated illustrative photography in /public/images/heroes).
 * Campaigns and websites store only the key, so swapping the asset never touches saved data.
 */
export const HERO_IMAGES = {
  trees: { label: "Tree planting", src: "/images/heroes/trees.jpg" },
  cleanup: { label: "Clean-up", src: "/images/heroes/cleanup.jpg" },
  library: { label: "Books & learning", src: "/images/heroes/library.jpg" },
  care: { label: "Care packages", src: "/images/heroes/care.jpg" },
  bags: { label: "Reuse & swap", src: "/images/heroes/bags.jpg" },
  community: { label: "Community gathering", src: "/images/heroes/community.jpg" },
} as const;

export type HeroImageKey = keyof typeof HERO_IMAGES;

export const HERO_IMAGE_KEYS = Object.keys(HERO_IMAGES) as HeroImageKey[];

export function isUploadedImage(key: string | undefined | null): boolean {
  return Boolean(key && key.startsWith("data:image/"));
}

export function heroImageSrc(key: string | undefined | null): string | null {
  if (!key) return null;
  if (isUploadedImage(key)) return key;
  return key in HERO_IMAGES ? HERO_IMAGES[key as HeroImageKey].src : null;
}

export function heroImageLabel(key: string): string {
  if (isUploadedImage(key)) return "Uploaded photo";
  return key in HERO_IMAGES ? HERO_IMAGES[key as HeroImageKey].label : key;
}
