/** Paths baked into the static GitHub Pages build. New browser-only campaigns still open through the 404 fallback. */
export const STATIC_ORG_SLUGS = ["greensteps", "your-organization"] as const;

export const STATIC_CAMPAIGN_SLUGS = [
  "plant-1000-trees",
  "support-local-school-libraries",
  "clean-our-neighborhood",
  "community-care-kit-drive",
  "reusable-bags-for-a-greener-future",
  "our-school-garden",
  "neighborhood-youth-grand-prix",
  "cozy-paws-sanctuary",
  "starry-night-campfire",
  "castle-workshop",
] as const;

export const STATIC_CAMPAIGN_IDS = [
  "camp-trees",
  "camp-libraries",
  "camp-clean",
  "camp-care",
  "camp-bags",
  "camp-castle-workshop",
] as const;

export function orgStaticParams() {
  return STATIC_ORG_SLUGS.map((slug) => ({ slug }));
}

export function campaignSlugStaticParams() {
  return STATIC_CAMPAIGN_SLUGS.map((slug) => ({ slug }));
}

export function campaignIdStaticParams() {
  return STATIC_CAMPAIGN_IDS.map((id) => ({ id }));
}

export function orgCampaignStaticParams() {
  return STATIC_ORG_SLUGS.flatMap((slug) => STATIC_CAMPAIGN_SLUGS.map((campaignSlug) => ({ slug, campaignSlug })));
}
