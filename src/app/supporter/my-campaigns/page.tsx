"use client";

import { Suspense } from "react";
import { MyCampaignsView } from "@/components/supporter/MyCampaignsView";
import { SupporterShell } from "@/components/supporter/SupporterShell";

export default function SupporterMyCampaignsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-[var(--color-text-muted)]">Loading your campaigns…</p>}>
      <SupporterShell active="my-campaigns">{(org, supporter) => <MyCampaignsView org={org} supporter={supporter} />}</SupporterShell>
    </Suspense>
  );
}
