"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NewOrgCampaignPage from "@/app/org/[slug]/campaigns/new/NewOrgCampaignClient";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/layout/RequireAuth";

function OpenNewCampaignInner() {
  const slug = useSearchParams().get("slug")?.trim() ?? "";

  return (
    <RequireAuth>
      <AppShell>
        <NewOrgCampaignPage params={Promise.resolve({ slug })} />
      </AppShell>
    </RequireAuth>
  );
}

/** Always exported, so Create campaign opens on GitHub Pages for a new organization. */
export default function OpenNewCampaignPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-sm text-gray-500">
          Loading campaign…
        </div>
      }
    >
      <OpenNewCampaignInner />
    </Suspense>
  );
}
