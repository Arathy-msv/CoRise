import PublicCampaignClient from "@/components/campaign/PublicCampaignClient";

export default async function PublicCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicCampaignClient slug={slug} />;
}
