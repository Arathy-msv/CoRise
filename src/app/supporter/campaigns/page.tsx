"use client";

import { Suspense } from "react";
import { SupporterCampaignsView } from "@/components/supporter/SupporterCampaignsView";
import { SupporterShell } from "@/components/supporter/SupporterShell";

export default function SupporterCampaignsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-[var(--color-text-muted)]">Loading campaigns…</p>}>
      <SupporterShell active="campaigns">{(org, supporter) => <SupporterCampaignsView org={org} supporter={supporter} />}</SupporterShell>
    </Suspense>
  );
}
