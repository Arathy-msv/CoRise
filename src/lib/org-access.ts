import type { ActivityItem, Campaign, ClaimedImpactSpace, CoriseDemoState, Organization, OrgWebsite } from "@/types/corise";
import {
  APP_STORAGE_KEY,
  sampleLicenseKey,
  type DirectoryOrganization,
  type OrgAccessMode,
  type OrgLicenseStatus,
} from "@/lib/deployment";
import { slugify, uid } from "@/lib/format";
import { orgAdminLoginPath, publicOrgPath } from "@/lib/paths";
import { isShowcaseCampaign } from "@/lib/storage";

export const ORG_ACCOUNTS_KEY = "corise-org-accounts-v1";
export const ORG_WORKSPACES_KEY = "corise-org-workspaces-v1";
/** Same-tab signal so the platform list reloads after an organization is saved. */
export const ORG_DIRECTORY_EVENT = "corise-directory-changed";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface OrgAccount {
  organizationId: string;
  email: string;
  /** SHA-256 of a prefixed password. The password itself is never stored. */
  passwordHash: string;
}

export interface OrgWorkspace {
  organizationId: string;
  slug: string;
  organization: Organization;
  website: OrgWebsite | null;
  campaigns: Campaign[];
  activity: ActivityItem[];
  claimedSpace: ClaimedImpactSpace | null;
}

export interface ProvisionSuccess {
  organizationId: string;
  name: string;
  slug: string;
  email: string;
  adminName: string;
  password: string;
  mode: OrgAccessMode;
  licenseKey: string | null;
  licenseStatus: OrgLicenseStatus | null;
  publicPath: string;
  adminPath: string;
}

export type ProvisionResult = { ok: true } & ProvisionSuccess | { ok: false; error: string };

export type AuthResult =
  | { ok: true; org: DirectoryOrganization; workspace: OrgWorkspace }
  | { ok: false; error: string };

interface StoredApp {
  version: 1;
  mode: string;
  role: string;
  organizations: DirectoryOrganization[];
  licenseKey: string | null;
}

interface AccountFile {
  version: 1;
  accounts: OrgAccount[];
}

interface WorkspaceFile {
  version: 1;
  workspaces: Record<string, OrgWorkspace>;
}

function browserStore(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(key: string, fallback: T): T {
  const s = browserStore();
  if (!s) return fallback;
  try {
    const raw = s.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  const s = browserStore();
  if (!s) throw new Error("Browser storage is unavailable.");
  s.setItem(key, JSON.stringify(value));
}

function readApp(): StoredApp | null {
  const parsed = readJson<StoredApp | null>(APP_STORAGE_KEY, null);
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.organizations)) return null;
  return parsed;
}

function writeApp(app: StoredApp): void {
  writeJson(APP_STORAGE_KEY, app);
  window.dispatchEvent(new Event(ORG_DIRECTORY_EVENT));
}

function readAccounts(): OrgAccount[] {
  const file = readJson<AccountFile>(ORG_ACCOUNTS_KEY, { version: 1, accounts: [] });
  return Array.isArray(file.accounts) ? file.accounts : [];
}

function writeAccounts(accounts: OrgAccount[]): void {
  writeJson(ORG_ACCOUNTS_KEY, { version: 1, accounts } satisfies AccountFile);
}

function readWorkspaceFile(): WorkspaceFile {
  const file = readJson<WorkspaceFile>(ORG_WORKSPACES_KEY, { version: 1, workspaces: {} });
  if (!file.workspaces || typeof file.workspaces !== "object") return { version: 1, workspaces: {} };
  return file;
}

function writeWorkspaceFile(file: WorkspaceFile): void {
  writeJson(ORG_WORKSPACES_KEY, file);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidAdminEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

const LOGIN_HINT_KEY = "corise-org-login-hint-v1";

export type OrgLoginHint = { slug: string; email: string; password: string };

function readLoginHints(): Record<string, { email: string; password: string }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(LOGIN_HINT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, { email: string; password: string }>;
  } catch {
    return {};
  }
}

/** Keeps the new admin email and password for this organization's sign-in screen in this tab. */
export function saveOrgLoginHint(hint: OrgLoginHint): void {
  try {
    const hints = readLoginHints();
    hints[hint.slug] = { email: hint.email, password: hint.password };
    sessionStorage.setItem(LOGIN_HINT_KEY, JSON.stringify(hints));
  } catch {
    // The sign-in page still opens. The fields stay empty if storage is blocked.
  }
}

export function readOrgLoginHint(slug: string | null): OrgLoginHint | null {
  if (!slug) return null;
  const saved = readLoginHints()[slug];
  if (!saved || typeof saved.email !== "string" || typeof saved.password !== "string" || !saved.email || !saved.password) return null;
  return { slug, email: saved.email, password: saved.password };
}

/** Demo-only hash. It keeps the password out of storage; it is not production authentication. */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`corise-org-v1:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += chars[b % chars.length];
  return out;
}

function uniqueSlug(name: string, taken: Set<string>): string {
  let base = slugify(name);
  if (!base || base === "campaign") base = "organization";
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

export function findWorkspaceBySlug(slug: string): OrgWorkspace | null {
  const file = readWorkspaceFile();
  return Object.values(file.workspaces).find((workspace) => workspace.slug === slug) ?? null;
}

export function findWorkspaceById(organizationId: string): OrgWorkspace | null {
  return readWorkspaceFile().workspaces[organizationId] ?? null;
}

/** Copies the signed-in organization into its own record. Never writes a password. */
export function persistSessionWorkspace(state: CoriseDemoState): void {
  if (!state.sessionOrgId) return;
  const campaigns = state.campaigns.filter((c) => !isShowcaseCampaign(c));
  const claimed = state.claimedSpace ? { ...state.claimedSpace } : null;
  if (claimed?.campaignId && !campaigns.some((c) => c.id === claimed.campaignId)) {
    delete claimed.campaignId;
  }
  const workspace: OrgWorkspace = {
    organizationId: state.sessionOrgId,
    slug: state.organization.orgSlug,
    organization: state.organization,
    website: state.website,
    campaigns,
    activity: state.activity,
    claimedSpace: claimed,
  };
  const file = readWorkspaceFile();
  file.workspaces[workspace.organizationId] = workspace;
  writeWorkspaceFile(file);
}

export async function provisionOrganization(input: {
  organization: Organization;
  website: OrgWebsite;
  adminName: string;
  adminEmail: string;
  mode: OrgAccessMode;
}): Promise<ProvisionResult> {
  const adminName = input.adminName.trim();
  const email = normalizeEmail(input.adminEmail);
  if (!adminName) return { ok: false, error: "Enter the organization admin's name." };
  if (!isValidAdminEmail(email)) return { ok: false, error: "Enter a valid email address." };

  const app = readApp();
  if (!app) {
    return { ok: false, error: "The organization list isn't available yet. Refresh the page and try again." };
  }
  if (readAccounts().some((account) => account.email === email)) {
    return { ok: false, error: "That email is already used for another organization. Use a different email." };
  }

  const now = new Date().toISOString();
  const name = input.website.content.siteName.trim() || input.organization.name.trim();
  const slug = uniqueSlug(name, new Set(app.organizations.map((org) => org.slug)));
  let id = `org-${slug}`;
  if (app.organizations.some((org) => org.id === id)) id = `${id}-${uid("n").slice(-4)}`;

  const mode = input.mode === "licensed" ? "licensed" : "demo";
  const licenseKey = mode === "licensed" ? sampleLicenseKey() : null;
  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  const organization: Organization = {
    ...input.organization,
    name,
    shortName: name.split(/\s+/).slice(0, 2).join(" ") || name,
    description: input.website.content.heroDescription || input.organization.description,
    mission: input.website.content.mission || input.organization.mission,
    logoLabel: input.website.logoLabel || input.organization.logoLabel,
    brandTheme: input.website.brandTheme,
    orgSlug: slug,
  };
  const website: OrgWebsite = {
    ...input.website,
    status: "published",
    logoLabel: organization.logoLabel,
    brandTheme: organization.brandTheme,
    publishedAt: now,
    lastEditedAt: now,
  };
  const directoryOrg: DirectoryOrganization = {
    id,
    name,
    slug,
    description: organization.description || `${name} on Corise.`,
    activeCampaignsCount: 0,
    theme: website.brandTheme,
    heroImage: website.heroImage,
    createdByUser: true,
    createdAt: now,
    plan: mode === "licensed" ? "organization" : "free",
    websiteStatus: "live",
    provisioned: true,
    accessMode: mode,
    adminName,
    adminEmail: email,
    licenseKey,
    licenseStatus: mode === "licensed" ? "active" : null,
  };
  const workspace: OrgWorkspace = {
    organizationId: id,
    slug,
    organization,
    website,
    campaigns: [],
    activity: [
      {
        id: uid("act"),
        type: "publish",
        message: "Organization website created",
        timeLabel: "Just now",
        at: now,
      },
    ],
    claimedSpace: { idea: input.organization.websitePurpose || name, source: "local_rules", claimedAt: now },
  };

  const accounts = readAccounts();
  const workspaces = readWorkspaceFile();
  try {
    writeAccounts([...accounts, { organizationId: id, email, passwordHash }]);
    workspaces.workspaces[id] = workspace;
    writeWorkspaceFile(workspaces);
    writeApp({ ...app, organizations: [...app.organizations, directoryOrg] });
  } catch {
    return { ok: false, error: "Could not save this organization in the browser. Free some space and try again." };
  }

  saveOrgLoginHint({ slug, email, password });

  return {
    ok: true,
    organizationId: id,
    name,
    slug,
    email,
    adminName,
    password,
    mode,
    licenseKey,
    licenseStatus: mode === "licensed" ? "active" : null,
    publicPath: publicOrgPath(slug),
    adminPath: orgAdminLoginPath(slug),
  };
}

export async function authenticateOrgAdmin(email: string, password: string, orgSlug?: string | null): Promise<AuthResult> {
  const normalized = normalizeEmail(email);
  if (!isValidAdminEmail(normalized) || !password) {
    return { ok: false, error: "Enter your email and password." };
  }
  const account = readAccounts().find((item) => item.email === normalized);
  const app = readApp();
  const org = account && app ? app.organizations.find((item) => item.id === account.organizationId) : undefined;
  const passwordOk = account ? (await hashPassword(password)) === account.passwordHash : false;
  if (!account || !org || !org.provisioned || !passwordOk) {
    return { ok: false, error: "Those sign-in details don't match. Check the email and password and try again." };
  }
  if (orgSlug && org.slug !== orgSlug) {
    return {
      ok: false,
      error: "Those sign-in details belong to a different organization. Open the sign-in page for your own organization.",
    };
  }
  if (org.accessMode === "licensed" && org.licenseStatus !== "active") {
    return {
      ok: false,
      error:
        org.licenseStatus === "expired"
          ? "This organization's license has expired. Ask your Corise administrator to renew it."
          : "This organization's license is not active. Ask your Corise administrator for help.",
    };
  }
  const workspace = findWorkspaceById(org.id);
  if (!workspace) {
    return { ok: false, error: "This organization's workspace could not be opened. Ask your administrator for help." };
  }
  return { ok: true, org, workspace };
}

export async function resetOrgPassword(organizationId: string): Promise<{ ok: true; password: string } | { ok: false; error: string }> {
  const accounts = readAccounts();
  const account = accounts.find((item) => item.organizationId === organizationId);
  if (!account) return { ok: false, error: "This organization does not have a sign-in yet." };
  const password = generatePassword();
  account.passwordHash = await hashPassword(password);
  try {
    writeAccounts(accounts);
  } catch {
    return { ok: false, error: "Could not save the new password in this browser." };
  }
  return { ok: true, password };
}

export function setOrgLicenseStatus(organizationId: string, status: OrgLicenseStatus): { ok: true } | { ok: false; error: string } {
  const app = readApp();
  if (!app) return { ok: false, error: "The organization list isn't available yet." };
  const org = app.organizations.find((item) => item.id === organizationId);
  if (!org?.provisioned || org.accessMode !== "licensed") {
    return { ok: false, error: "Only a licensed organization has a license to update." };
  }
  org.licenseStatus = status;
  try {
    writeApp(app);
  } catch {
    return { ok: false, error: "Could not update the license in this browser." };
  }
  return { ok: true };
}

/** Makes the next dashboard visit an organization admin, including after refresh. */
export function activateOrgAdminRole(): void {
  const app = readApp();
  if (!app || app.role === "ORG_ADMIN") return;
  try {
    writeApp({ ...app, role: "ORG_ADMIN" });
  } catch {
    // The in-memory role switch still runs from the login page.
  }
}
