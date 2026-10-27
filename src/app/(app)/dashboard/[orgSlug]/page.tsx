import OverviewPage from "../../overview/page";
import { orgStaticParams } from "@/lib/static-params";

/**
 * GitHub Pages exports one dashboard shell for each seeded organization.
 * Browser-created organizations use the same client dashboard after navigation.
 */
export function generateStaticParams() {
  return orgStaticParams().map(({ slug }) => ({ orgSlug: slug }));
}

export default OverviewPage;
