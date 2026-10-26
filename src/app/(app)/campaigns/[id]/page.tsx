import CampaignDetailClient from "./CampaignDetailClient";
import { campaignIdStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return campaignIdStaticParams();
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampaignDetailClient id={id} />;
}
