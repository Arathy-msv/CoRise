import NewOrgCampaignPage from "./NewOrgCampaignClient";
import { orgStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return orgStaticParams();
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <NewOrgCampaignPage params={params} />;
}
