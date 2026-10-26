import OrgSitePage from "./OrgSiteClient";
import { orgStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return orgStaticParams();
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <OrgSitePage params={params} />;
}
