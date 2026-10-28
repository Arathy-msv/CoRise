"use client";

import { useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { ORG_DIRECTORY_EVENT, ORG_WORKSPACES_KEY, findWorkspaceBySlug } from "@/lib/org-access";
import { orgAdminLoginPath, orgDashboardPath } from "@/lib/paths";
import { supporterVisibleCampaigns } from "@/lib/supporter-campaigns";
import { readNetwork, serverNetwork, subscribeNetwork, type SupporterNetwork } from "@/lib/supporter-network";
import { DEMO_SUPPORTERS, findSupporter, type DemoSupporter } from "@/lib/supporters";
import type { Campaign } from "@/types/corise";

function subscribeWorkspaces(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === ORG_WORKSPACES_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(ORG_DIRECTORY_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ORG_DIRECTORY_EVENT, onChange);
  };
}

/** Raw JSON of the organization workspaces, used only as a change signal. "" when nothing is stored. */
function readWorkspacesRaw(): string {
  try {
    return window.localStorage.getItem(ORG_WORKSPACES_KEY) ?? "";
  } catch {
    return "";
  }
}

export function useSupporterNetwork(): SupporterNetwork {
  return useSyncExternalStore(subscribeNetwork, readNetwork, serverNetwork);
}

export function useCurrentSupporter(): DemoSupporter {
  const network = useSupporterNetwork();
  return findSupporter(network.currentSupporterId) ?? DEMO_SUPPORTERS[0];
}

export type SupporterOrg = {
  ready: boolean;
  orgSlug: string;
  orgName: string;
  /** Campaigns supporters can open, from the organization's own workspace. */
  campaigns: Campaign[];
  websiteLive: boolean;
  backHref: string;
  backLabel: string;
};

/** Reads `?org=` and resolves that organization's campaigns from the shared workspace data. */
export function useSupporterOrg(): SupporterOrg {
  const search = useSearchParams();
  const orgParam = search.get("org")?.trim() ?? "";
  const { hydrated: appHydrated, organizations, role } = useApp();
  const { hydrated, state } = useCorise();
  const ownOrgSlug = state.organization.orgSlug;
  const sameOrg = !orgParam || orgParam === ownOrgSlug;
  const workspacesRaw = useSyncExternalStore<string | null>(subscribeWorkspaces, readWorkspacesRaw, () => null);

  const orgSlug = orgParam || ownOrgSlug;
  const workspace = !sameOrg && workspacesRaw !== null ? findWorkspaceBySlug(orgParam) : null;
  const listed = organizations.find((org) => org.slug === orgSlug);
  const ready = hydrated && appHydrated;
  const website = sameOrg ? state.website : workspace?.website;
  const campaigns = supporterVisibleCampaigns(sameOrg ? state.campaigns : (workspace?.campaigns ?? []), website);
  const orgName = (sameOrg ? state.organization.name : workspace?.organization.name) || listed?.name || "Your organization";
  const adminView = role === "ORG_ADMIN";

  return {
    ready,
    orgSlug,
    orgName,
    campaigns,
    websiteLive: website?.status === "published",
    backHref: adminView ? orgDashboardPath(orgSlug) : orgParam ? orgAdminLoginPath(orgParam) : "/login",
    backLabel: adminView ? "Back to dashboard" : "Back to sign in",
  };
}
