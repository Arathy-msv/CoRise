import type { Campaign, Organization, OrgWebsite } from "@/types/corise";

export type PublishResult = { ok: true } | { ok: false; error: string };

function missing(fields: Array<[string, string | undefined]>): string[] {
  return fields.filter(([, value]) => !value?.trim()).map(([label]) => label);
}

function describe(kind: string, gaps: string[]): string {
  return `The ${kind} can't be published yet — add ${gaps.join(", ")} first.`;
}

export function validateWebsiteForPublish(website: OrgWebsite | null, organization: Organization): PublishResult {
  if (!website) return { ok: false, error: "There is no website to publish yet." };
  const gaps = missing([
    ["an organization name", website.content.siteName || organization.name],
    ["a headline", website.content.headline],
    ["an introduction", website.content.heroDescription],
  ]);
  return gaps.length ? { ok: false, error: describe("website", gaps) } : { ok: true };
}

export function validateCampaignForPublish(campaign: Campaign | undefined): PublishResult {
  if (!campaign) return { ok: false, error: "That campaign could not be found." };
  if (campaign.archived) return { ok: false, error: "Archived campaigns can't be published. Unhide it first." };
  const merged = { ...campaign, ...campaign.pendingChanges };
  const gaps = missing([
    ["a title", merged.title],
    ["a description", merged.description],
    ["a button label", merged.primaryCta],
  ]);
  return gaps.length ? { ok: false, error: describe("campaign", gaps) } : { ok: true };
}

/** Campaign as managers edit it: live fields with any unpublished changes applied. */
export function campaignDraftView(campaign: Campaign): Campaign {
  return campaign.pendingChanges ? { ...campaign, ...campaign.pendingChanges } : campaign;
}

export type CampaignPublishState = "draft" | "published" | "changes" | "archived";

export function campaignPublishState(campaign: Campaign): CampaignPublishState {
  if (campaign.archived) return "archived";
  if (campaign.status !== "published") return "draft";
  return campaign.pendingChanges ? "changes" : "published";
}

export function campaignUpdatedAt(campaign: Campaign): string {
  return campaign.updatedAt ?? campaign.publishedAt ?? campaign.createdAt;
}
