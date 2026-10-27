import type { PlanId } from "@/config/plans";
import type { Organization, OrgWebsite, ThemePreset } from "@/types/corise";
import { THEME_COLORS } from "@/types/corise";
import { buildWebsiteFromSimpleInput } from "@/lib/website-suggestions";

export type WebsiteStatus = "live" | "draft";

export type OrgAccessMode = "demo" | "licensed";

export type OrgLicenseStatus = "active" | "inactive" | "expired";

/** Shared localStorage key for deployment mode/role, read directly by lib/storage.ts too. */
export const APP_STORAGE_KEY = "corise-app-v1";

export type DeploymentMode = "saas" | "licensed";
export type AppRole = "PLATFORM_ADMIN" | "ORG_ADMIN" | "SUPPORTER" | "VISITOR";

export const APP_ROLES: { id: AppRole; label: string }[] = [
  { id: "PLATFORM_ADMIN", label: "Platform Admin" },
  { id: "ORG_ADMIN", label: "Org Admin" },
  { id: "SUPPORTER", label: "Supporter" },
  { id: "VISITOR", label: "Visitor" },
];

export const DEPLOYMENT_MODES: { id: DeploymentMode; label: string; icon: string }[] = [
  { id: "saas", label: "SaaS Cloud", icon: "☁️" },
  { id: "licensed", label: "Licensed Edition", icon: "🏢" },
];

export interface DirectoryOrganization {
  id: string;
  name: string;
  slug: string;
  description: string;
  activeCampaignsCount: number;
  theme: ThemePreset;
  heroImage: string;
  logoUrl?: string;
  /** Added from this browser's builder rather than the sample directory. */
  createdByUser?: boolean;
  createdAt: string;
  /** Subscription the organization registered its website on. */
  plan: PlanId;
  websiteStatus: WebsiteStatus;
  /** Set when a platform admin creates this organization. Sample listings omit it. */
  provisioned?: boolean;
  accessMode?: OrgAccessMode;
  adminName?: string;
  adminEmail?: string;
  licenseKey?: string | null;
  licenseStatus?: OrgLicenseStatus | null;
}

export const SEED_ORGANIZATIONS: DirectoryOrganization[] = [
  {
    id: "org-green-roots",
    name: "Green Roots Community",
    slug: "green-roots-community",
    description: "Neighbors planting trees and caring for the shared green spaces that make our streets cooler and kinder.",
    activeCampaignsCount: 3,
    theme: "forest",
    heroImage: "trees",
    createdAt: "2026-03-02T09:00:00.000Z",
    plan: "organization",
    websiteStatus: "live",
  },
  {
    id: "org-oakridge-library",
    name: "Oakridge School Library",
    slug: "oakridge-school-library",
    description: "Students and families stocking our library shelves, running reading clubs, and getting books into every home.",
    activeCampaignsCount: 2,
    theme: "ocean",
    heroImage: "library",
    createdAt: "2026-04-18T09:00:00.000Z",
    plan: "pro",
    websiteStatus: "live",
  },
  {
    id: "org-safe-paws",
    name: "Safe Paws Animal Shelter",
    slug: "safe-paws-animal-shelter",
    description: "Volunteers rescuing cats and dogs, caring for them, and finding each one a loving forever home.",
    activeCampaignsCount: 4,
    theme: "rose",
    heroImage: "care",
    createdAt: "2026-05-27T09:00:00.000Z",
    plan: "pro",
    websiteStatus: "live",
  },
  {
    id: "org-riverbend-water",
    name: "Riverbend Clean Water Collective",
    slug: "riverbend-clean-water",
    description: "Residents cleaning up the riverbank and testing water quality every month so the river stays safe for all.",
    activeCampaignsCount: 1,
    theme: "amber",
    heroImage: "cleanup",
    createdAt: "2026-07-09T09:00:00.000Z",
    plan: "free",
    websiteStatus: "live",
  },
];

const PLAN_IDS: PlanId[] = ["free", "pro", "organization"];

/** Fills plan and website status for directories saved before those fields existed. */
export function normalizeDirectoryOrg(org: DirectoryOrganization): DirectoryOrganization {
  const seeded = SEED_ORGANIZATIONS.find((item) => item.slug === org.slug);
  const plan = PLAN_IDS.includes(org.plan) ? org.plan : seeded?.plan ?? "free";
  const websiteStatus = org.websiteStatus === "draft" || org.websiteStatus === "live" ? org.websiteStatus : seeded?.websiteStatus ?? "live";
  return { ...org, plan, websiteStatus };
}

/** Licensed installs have no platform tier, so a stored Platform Admin role acts as Org Admin. */
export function effectiveRole(mode: DeploymentMode, role: AppRole): AppRole {
  return mode === "licensed" && role === "PLATFORM_ADMIN" ? "ORG_ADMIN" : role;
}

export function availableRoles(mode: DeploymentMode) {
  return mode === "licensed" ? APP_ROLES.filter((r) => r.id !== "PLATFORM_ADMIN") : APP_ROLES;
}

export function roleLabel(role: AppRole): string {
  return APP_ROLES.find((r) => r.id === role)?.label ?? role;
}

export function canAccessPlatformAdmin(mode: DeploymentMode, role: AppRole): boolean {
  return mode === "saas" && effectiveRole(mode, role) === "PLATFORM_ADMIN";
}

/** Campaigns, the website editor, and the rest of the organization dashboard belong to the org admin. */
export function canAccessOrgDashboard(mode: DeploymentMode, role: AppRole): boolean {
  return effectiveRole(mode, role) === "ORG_ADMIN";
}

/** SaaS websites are created by the platform admin. A licensed install is created by the org admin. */
export function canCreateWebsite(mode: DeploymentMode, role: AppRole): boolean {
  const r = effectiveRole(mode, role);
  if (mode === "saas") return r === "PLATFORM_ADMIN";
  return r === "ORG_ADMIN";
}
export function appHomePath(mode: DeploymentMode, role: AppRole): string {
  const r = effectiveRole(mode, role);
  if (r === "PLATFORM_ADMIN") return "/admin/platform";
  if (r === "ORG_ADMIN") return "/dashboard";
  return "/#organizations";
}

export function upsertOrganization(list: DirectoryOrganization[], org: DirectoryOrganization): DirectoryOrganization[] {
  const i = list.findIndex((o) => o.slug === org.slug || o.id === org.id);
  if (i === -1) return [...list, org];
  const prev = list[i];
  const patch = Object.fromEntries(Object.entries(org).filter(([, value]) => value !== undefined)) as Partial<DirectoryOrganization>;
  const next = [...list];
  next[i] = { ...prev, ...patch, id: prev.id, createdAt: prev.createdAt };
  return next;
}

export function platformStats(list: DirectoryOrganization[]) {
  const totalCampaigns = list.reduce((sum, o) => sum + Math.max(0, o.activeCampaignsCount), 0);
  const count = (plan: PlanId) => list.filter((o) => o.plan === plan).length;
  return {
    totalOrganizations: list.length,
    websitesLive: list.filter((o) => o.websiteStatus === "live").length,
    totalCampaigns,
    plans: { free: count("free"), pro: count("pro"), organization: count("organization") },
    licensesValid: list.length,
    licensesExpiring: 0,
    health: "Healthy" as const,
  };
}

export function orgInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function orgColor(org: Pick<DirectoryOrganization, "theme">): string {
  return (THEME_COLORS[org.theme] ?? THEME_COLORS.forest).primary;
}

export function excerpt(text: string, max = 110): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

export const LICENSE_KEY_PATTERN = /^CORISE-LIC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function sampleLicenseKey(random: () => number = Math.random): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () => Array.from({ length: 4 }, () => chars[Math.floor(random() * chars.length)]).join("");
  return `CORISE-LIC-${block()}-${block()}-${block()}`;
}

export function isValidLicenseKey(key: string): boolean {
  return LICENSE_KEY_PATTERN.test(key.trim().toUpperCase());
}

/** A read-only public website for a directory organization, generated from its name and mission. */
export function directoryWebsite(org: DirectoryOrganization, base: Organization): { website: OrgWebsite; organization: Organization } {
  const organization: Organization = {
    ...base,
    name: org.name,
    shortName: org.name.split(" ")[0] || org.name,
    description: org.description,
    mission: org.description,
    websitePurpose: org.description,
    location: "",
    contactLabel: "",
    socialInstagram: "",
    socialFacebook: "",
    socialWebsite: "",
    logoLabel: orgInitials(org.name),
    brandTheme: org.theme,
    orgSlug: org.slug,
  };
  const draft = buildWebsiteFromSimpleInput(org.name, org.description, organization);
  return {
    organization,
    website: {
      status: "published",
      template: draft.template || "community",
      heroImage: org.heroImage,
      brandTheme: org.theme,
      logoLabel: organization.logoLabel,
      content: { ...draft.content, siteName: org.name },
      sections: draft.sections.filter((s) => s.id !== "campaigns" && s.id !== "contact"),
      lastEditedAt: org.createdAt,
      publishedAt: org.createdAt,
      previewMode: "desktop",
    },
  };
}
