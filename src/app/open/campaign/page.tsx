"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PublicCampaignClient from "@/components/campaign/PublicCampaignClient";

function OpenCampaignInner() {
  const search = useSearchParams();
  const slug = search.get("slug")?.trim() ?? "";
  const org = search.get("org")?.trim() || undefined;

  if (!slug) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-2xl font-semibold">Campaign link is incomplete</h1>
        <p className="text-sm text-gray-500">Open the link from the supporter page again.</p>
      </div>
    );
  }

  return <PublicCampaignClient slug={slug} orgSlug={org} />;
}

/** Always exported, so a campaign link from the supporter page opens after deploy. */
export default function OpenCampaignPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-sm text-gray-500">
          Loading campaign…
        </div>
      }
    >
      <OpenCampaignInner />
    </Suspense>
  );
}
