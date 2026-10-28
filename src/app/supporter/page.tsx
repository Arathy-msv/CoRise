"use client";

import { Suspense } from "react";
import { SupporterCampaignsView } from "@/components/supporter/SupporterCampaignsView";
import { SupporterShell } from "@/components/supporter/SupporterShell";

/** `/supporter?org=` stays the supporter entry point and opens Campaigns. */
export default function SupporterPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-[var(--color-text-muted)]">Loading campaigns…</p>}>
      <SupporterShell active="campaigns">{(org, supporter) => <SupporterCampaignsView org={org} supporter={supporter} />}</SupporterShell>
    </Suspense>
  );
}
