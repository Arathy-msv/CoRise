import PublicCampaignClient from "@/components/campaign/PublicCampaignClient";
import { campaignSlugStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return campaignSlugStaticParams();
}

export default async function PublicCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicCampaignClient slug={slug} />;
}
