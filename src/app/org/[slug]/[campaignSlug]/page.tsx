import PublicCampaignClient from "@/components/campaign/PublicCampaignClient";
import { orgCampaignStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return orgCampaignStaticParams();
}

export default async function OrgCampaignPage({ params }: { params: Promise<{ slug: string; campaignSlug: string }> }) {
  const { slug, campaignSlug } = await params;
  return <PublicCampaignClient slug={campaignSlug} orgSlug={slug} />;
}
