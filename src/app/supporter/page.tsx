"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SupporterDashboard, demoSupportedCampaigns } from "@/components/supporter/SupporterDashboard";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { findWorkspaceBySlug } from "@/lib/org-access";
import { orgDashboardPath } from "@/lib/paths";

function SupporterInner() {
  const search = useSearchParams();
  const orgSlug = search.get("org");
  const { hydrated, organizations, role } = useApp();
  const { state } = useCorise();
  const [ready, setReady] = useState(false);
  const [orgName, setOrgName] = useState("Riverside Student Club");
  const [titles, setTitles] = useState<string[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    const slug = orgSlug || state.organization.orgSlug;
    const workspace = slug ? findWorkspaceBySlug(slug) : null;
    const listed = orgSlug ? organizations.find((org) => org.slug === orgSlug) : undefined;
    const name = workspace?.organization.name || listed?.name || state.organization.name || "Riverside Student Club";
    const source = workspace?.campaigns?.length ? workspace.campaigns : orgSlug ? [] : state.campaigns;
    setOrgName(name);
    setTitles(source.filter((campaign) => !campaign.archived).map((campaign) => campaign.title));
    setReady(true);
  }, [hydrated, orgSlug, organizations, state.organization.orgSlug, state.organization.name, state.campaigns]);

  if (!ready) {
    return <p className="p-8 text-sm text-gray-500">Loading the supporter demo…</p>;
  }

  const backHref = role === "ORG_ADMIN" ? orgDashboardPath(orgSlug || state.organization.orgSlug) : orgSlug ? `/login?org=${encodeURIComponent(orgSlug)}` : "/login";

  return (
    <SupporterDashboard
      orgName={orgName}
      campaigns={demoSupportedCampaigns(titles)}
      backHref={backHref}
      backLabel={role === "ORG_ADMIN" ? "Back to dashboard" : "Back to sign in"}
    />
  );
}

export default function SupporterPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-gray-500">Loading the supporter demo…</p>}>
      <SupporterInner />
    </Suspense>
  );
}
