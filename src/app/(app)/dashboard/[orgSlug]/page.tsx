import OverviewPage from "../../overview/page";
import { orgStaticParams } from "@/lib/static-params";

export function generateStaticParams() {
  return orgStaticParams().map(({ slug }) => ({ orgSlug: slug }));
}

/** Rendering through a server wrapper keeps this route's `generateStaticParams` visible to the static export. */
export default function OrgDashboardPage() {
  return <OverviewPage />;
}
