"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useCorise } from "@/context/CoriseContext";
import {
  APP_STORAGE_KEY,
  SEED_ORGANIZATIONS,
  normalizeDirectoryOrg,
  effectiveRole,
  upsertOrganization,
  type AppRole,
  type DeploymentMode,
  type DirectoryOrganization,
} from "@/lib/deployment";
import { ORG_DIRECTORY_EVENT } from "@/lib/org-access";

interface AppState {
  version: 1;
  mode: DeploymentMode;
  /** As chosen; read `role` from the context for the value after licensed-mode rules. */
  role: AppRole;
  organizations: DirectoryOrganization[];
  licenseKey: string | null;
}

const MODES: DeploymentMode[] = ["saas", "licensed"];
const ROLES: AppRole[] = ["PLATFORM_ADMIN", "ORG_ADMIN", "SUPPORTER", "VISITOR"];

function initialAppState(): AppState {
  return { version: 1, mode: "saas", role: "ORG_ADMIN", organizations: SEED_ORGANIZATIONS, licenseKey: null };
}

function loadAppState(): AppState {
  const fallback = initialAppState();
  try {
    const raw = window.localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const mode = MODES.includes(parsed.mode as DeploymentMode) ? (parsed.mode as DeploymentMode) : fallback.mode;
    const role = ROLES.includes(parsed.role as AppRole) ? (parsed.role as AppRole) : fallback.role;
    return {
      version: 1,
      mode,
      role: effectiveRole(mode, role),
      organizations:
        Array.isArray(parsed.organizations) && parsed.organizations.length
          ? parsed.organizations.map(normalizeDirectoryOrg)
          : fallback.organizations,
      licenseKey: typeof parsed.licenseKey === "string" ? parsed.licenseKey : null,
    };
  } catch {
    return fallback;
  }
}

interface AppContextValue {
  hydrated: boolean;
  mode: DeploymentMode;
  role: AppRole;
  organizations: DirectoryOrganization[];
  licenseKey: string | null;
  setMode: (mode: DeploymentMode) => void;
  setRole: (role: AppRole) => void;
  upsertDirectoryOrganization: (org: DirectoryOrganization) => void;
  activateLicense: (key: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const corise = useCorise();
  const [state, setState] = useState<AppState>(initialAppState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadAppState());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === APP_STORAGE_KEY) setState(loadAppState());
    };
    const onDirectory = () => setState(loadAppState());
    window.addEventListener("storage", onStorage);
    window.addEventListener(ORG_DIRECTORY_EVENT, onDirectory);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(ORG_DIRECTORY_EVENT, onDirectory);
    };
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const setMode = useCallback((mode: DeploymentMode) => {
    setState((s) => ({ ...s, mode, role: effectiveRole(mode, s.role) }));
  }, []);

  const setRole = useCallback((role: AppRole) => {
    setState((s) => ({ ...s, role: effectiveRole(s.mode, role) }));
  }, []);

  const upsertDirectoryOrganization = useCallback((org: DirectoryOrganization) => {
    setState((s) => {
      const organizations = upsertOrganization(s.organizations, org);
      return JSON.stringify(organizations) === JSON.stringify(s.organizations) ? s : { ...s, organizations };
    });
  }, []);

  const activateLicense = useCallback((key: string) => {
    setState((s) => ({ ...s, mode: "licensed", role: "ORG_ADMIN", licenseKey: key.trim().toUpperCase() }));
  }, []);

  const { state: cs, hydrated: coriseHydrated } = corise;
  const ownOrg = cs.organization;
  const publishedCampaigns = cs.campaigns.filter((c) => c.status === "published" && !c.archived && !c.isSample).length;
  const ownIsLive = cs.isSignedIn && (cs.website?.status === "published" || publishedCampaigns > 0);

  useEffect(() => {
    if (!hydrated || !coriseHydrated || !ownOrg.orgSlug) return;
    if (cs.sessionOrgId) {
      const count = cs.campaigns.filter((c) => !c.archived && !c.isSample).length;
      const websiteStatus = cs.website?.status === "published" ? "live" : "draft";
      setState((s) => {
        const existing = s.organizations.find((o) => o.id === cs.sessionOrgId);
        if (!existing) return s;
        if (
          existing.activeCampaignsCount === count &&
          existing.websiteStatus === websiteStatus &&
          existing.name === ownOrg.name &&
          existing.slug === ownOrg.orgSlug
        ) {
          return s;
        }
        return {
          ...s,
          organizations: s.organizations.map((o) =>
            o.id === existing.id
              ? {
                  ...o,
                  name: ownOrg.name,
                  slug: ownOrg.orgSlug,
                  description: ownOrg.description || o.description,
                  activeCampaignsCount: count,
                  websiteStatus,
                  theme: cs.website?.brandTheme ?? ownOrg.brandTheme,
                  heroImage: cs.website?.heroImage ?? o.heroImage,
                }
              : o
          ),
        };
      });
      return;
    }
    if (!ownIsLive) return;
    upsertDirectoryOrganization({
      id: `org-${ownOrg.orgSlug}`,
      name: ownOrg.name,
      slug: ownOrg.orgSlug,
      description: ownOrg.description || ownOrg.mission || `${ownOrg.name} on Corise.`,
      activeCampaignsCount: publishedCampaigns,
      theme: cs.website?.brandTheme ?? ownOrg.brandTheme,
      heroImage: cs.website?.heroImage ?? "community",
      createdByUser: true,
      createdAt: new Date().toISOString(),
      plan: "free",
      websiteStatus: "live",
    });
  }, [
    hydrated,
    coriseHydrated,
    ownIsLive,
    ownOrg.orgSlug,
    ownOrg.name,
    ownOrg.description,
    ownOrg.mission,
    ownOrg.brandTheme,
    publishedCampaigns,
    cs.sessionOrgId,
    cs.campaigns,
    cs.website?.status,
    cs.website?.brandTheme,
    cs.website?.heroImage,
    upsertDirectoryOrganization,
  ]);

  const value = useMemo<AppContextValue>(
    () => ({
      hydrated,
      mode: state.mode,
      role: effectiveRole(state.mode, state.role),
      organizations: state.organizations,
      licenseKey: state.licenseKey,
      setMode,
      setRole,
      upsertDirectoryOrganization,
      activateLicense,
    }),
    [hydrated, state, setMode, setRole, upsertDirectoryOrganization, activateLicense]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
