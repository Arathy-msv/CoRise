"use client";

import { Suspense } from "react";
import { InvitationsView } from "@/components/supporter/InvitationsView";
import { SupporterShell } from "@/components/supporter/SupporterShell";

export default function SupporterInvitationsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-[var(--color-text-muted)]">Loading invitations…</p>}>
      <SupporterShell active="invitations">{(org, supporter) => <InvitationsView org={org} supporter={supporter} />}</SupporterShell>
    </Suspense>
  );
}
