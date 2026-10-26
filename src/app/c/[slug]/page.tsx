import { redirect } from "next/navigation";
import { publicCampaignPath } from "@/lib/paths";
import { campaignSlugStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return campaignSlugStaticParams();
}

export default async function LegacyCampaignRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(publicCampaignPath(slug));
}
