import PublicCampaignClient from "@/components/campaign/PublicCampaignClient";

export default async function OrgCampaignPage({ params }: { params: Promise<{ slug: string; campaignSlug: string }> }) {
  const { slug, campaignSlug } = await params;
  return <PublicCampaignClient slug={campaignSlug} orgSlug={slug} />;
}
