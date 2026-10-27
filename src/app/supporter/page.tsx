"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SupporterDashboard } from "@/components/supporter/SupporterDashboard";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { findWorkspaceBySlug } from "@/lib/org-access";
import { orgDashboardPath } from "@/lib/paths";
import type { Campaign } from "@/types/corise";

function SupporterInner() {
  const search = useSearchParams();
  const orgSlug = search.get("org");
  const { hydrated, organizations, role } = useApp();
  const { state } = useCorise();
  const [ready, setReady] = useState(false);
  const [orgName, setOrgName] = useState("Your organization");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    const slug = orgSlug || state.organization.orgSlug;
    const workspace = slug ? findWorkspaceBySlug(slug) : null;
    const listed = orgSlug ? organizations.find((org) => org.slug === orgSlug) : undefined;
    const sameOrg = !orgSlug || orgSlug === state.organization.orgSlug;
    const name = (sameOrg ? state.organization.name : "") || workspace?.organization.name || listed?.name || "Your organization";
    const source = sameOrg ? state.campaigns : (workspace?.campaigns ?? []);
    setOrgName(name);
    setCampaigns(source.filter((campaign) => !campaign.archived));
    setReady(true);
  }, [hydrated, orgSlug, organizations, state.organization.orgSlug, state.organization.name, state.campaigns]);

  if (!ready) {
    return <p className="p-8 text-center text-sm text-[var(--color-text-muted)]">Loading campaigns…</p>;
  }

  const slug = orgSlug || state.organization.orgSlug;
  const backHref = role === "ORG_ADMIN" ? orgDashboardPath(slug) : orgSlug ? `/login?org=${encodeURIComponent(orgSlug)}` : "/login";

  return (
    <SupporterDashboard
      orgName={orgName}
      orgSlug={slug}
      campaigns={campaigns}
      backHref={backHref}
      backLabel={role === "ORG_ADMIN" ? "Back to dashboard" : "Back to sign in"}
    />
  );
}

export default function SupporterPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-[var(--color-text-muted)]">Loading campaigns…</p>}>
      <SupporterInner />
    </Suspense>
  );
}
