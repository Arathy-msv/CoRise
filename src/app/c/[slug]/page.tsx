import { redirect } from "next/navigation";
import { publicCampaignPath } from "@/lib/paths";

export default async function LegacyCampaignRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(publicCampaignPath(slug));
}
