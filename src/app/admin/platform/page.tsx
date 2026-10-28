"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrgAccessDialog } from "@/components/admin/OrgAccessDialog";
import { Logo } from "@/components/brand/Logo";
import { ModeSwitcher, RoleSwitcher } from "@/components/deployment/DeploymentControls";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { ButtonLink } from "@/components/ui/Button";
import { CopyTextButton } from "@/components/ui/CopyTextButton";
import { Icon } from "@/components/ui/Icon";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { canAccessPlatformAdmin, orgColor, orgInitials, platformStats, roleLabel, type DirectoryOrganization, type OrgLicenseStatus } from "@/lib/deployment";
import { resetOrgPassword, setOrgLicenseStatus } from "@/lib/org-access";
import { absoluteUrl } from "@/lib/public-asset";
import { openAppPath } from "@/lib/static-nav";
import { orgAdminLoginPath, orgDashboardPath, publicOrgPath } from "@/lib/paths";

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 text-[var(--color-text-muted)]">{children}</div>;
}

function StatusPill({ children, tone }: { children: React.ReactNode; tone: "ok" | "muted" | "warn" }) {
  const cls =
    tone === "ok"
      ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
      : tone === "warn"
        ? "bg-[var(--color-bg)] text-[var(--color-text)]"
        : "bg-[var(--color-bg)] text-[var(--color-text-muted)]";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{children}</span>;
}

function modeLabel(org: DirectoryOrganization): string {
  if (!org.provisioned) return "Sample";
  return org.accessMode === "licensed" ? "Licensed" : "Demo";
}

function licenseLabel(org: DirectoryOrganization): string {
  if (!org.provisioned || org.accessMode !== "licensed") return "—";
  if (org.licenseStatus === "active") return "Active";
  if (org.licenseStatus === "inactive") return "Inactive";
  if (org.licenseStatus === "expired") return "Expired";
  return "Not set";
}

export default function PlatformAdminPage() {
  const router = useRouter();
  const { hydrated, mode, role, organizations, setRole } = useApp();
  const { state } = useCorise();
  const [origin, setOrigin] = useState("");
  const [accessId, setAccessId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{ id: string; password: string } | null>(null);
  const [accessBusy, setAccessBusy] = useState(false);
  const [accessError, setAccessError] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    if (hydrated && mode === "licensed" && state.organization.orgSlug) {
      openAppPath(orgDashboardPath(state.organization.orgSlug), router, "replace");
    }
  }, [hydrated, mode, router, state.organization.orgSlug]);

  if (!hydrated) return <Centered>Loading platform…</Centered>;
  if (mode === "licensed") return <Centered>Licensed edition has no platform tier — opening your dashboard…</Centered>;

  if (!canAccessPlatformAdmin(mode, role)) {
    return (
      <Centered>
        <div className="corise-card max-w-md space-y-3 p-6 text-center text-[var(--color-text)]" role="alert">
          <h1 className="text-xl font-semibold">Platform admins only</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            You&apos;re previewing as <strong>{roleLabel(role)}</strong>. The organization list is limited to Corise Cloud platform admins.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <button type="button" className="corise-btn corise-btn-primary corise-btn-md" onClick={() => setRole("PLATFORM_ADMIN")}>
              Switch to Platform Admin
            </button>
            <Link href="/" className="corise-btn corise-btn-ghost corise-btn-md">
              Back to home
            </Link>
          </div>
        </div>
      </Centered>
    );
  }

  const accessOrg = accessId ? organizations.find((org) => org.id === accessId) : undefined;
  const abs = (path: string) => absoluteUrl(path, origin);

  const resetPassword = async (org: DirectoryOrganization) => {
    if (!window.confirm(`Reset the password for ${org.name}? The current password will stop working. You'll see the new one once.`)) return;
    setAccessBusy(true);
    setAccessError("");
    const result = await resetOrgPassword(org.id);
    setAccessBusy(false);
    if (!result.ok) {
      setAccessError(result.error);
      return;
    }
    setRevealed({ id: org.id, password: result.password });
  };

  const changeLicense = (org: DirectoryOrganization, status: OrgLicenseStatus) => {
    const turningOff = status !== "active";
    const message = turningOff
      ? `Mark this license as ${status}? ${org.name} will not be able to sign in until you turn it back on.`
      : `Turn the license back on for ${org.name}?`;
    if (!window.confirm(message)) return;
    const result = setOrgLicenseStatus(org.id, status);
    if (!result.ok) setAccessError(result.error);
    else setAccessError("");
  };

  const stats = platformStats(organizations);
  const rows = [...organizations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const cards = [
    { label: "Registered websites", value: String(stats.totalOrganizations), hint: "Organization websites on Corise Cloud" },
    { label: "Live websites", value: String(stats.websitesLive), hint: `${stats.totalOrganizations - stats.websitesLive} still in draft` },
    { label: "Free", value: String(stats.plans.free), hint: "Websites on the Free plan" },
    { label: "Pro", value: String(stats.plans.pro), hint: "Websites on the Pro plan" },
    { label: "Organization", value: String(stats.plans.organization), hint: "Websites on the Organization plan" },
    { label: "Campaigns", value: String(stats.totalCampaigns), hint: "Active across every registered website" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="surface-bar">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Corise home">
              <Logo size="sm" tone="dark" />
            </Link>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/75">
              Platform Admin
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ModeSwitcher compact />
            <RoleSwitcher compact />
            <ProfileMenu tone="dark" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">Platform admin</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-muted)]">
              Every organization website on Corise Cloud. New organizations start with no campaigns. Figures are saved in this browser.
            </p>
            <p className="mt-1 max-w-2xl text-xs text-[var(--color-text-muted)]">
              Mode and License are illustrative — not connected to billing or hosting.
            </p>
          </div>
          <ButtonLink href="/create" size="lg" className="shrink-0">
            <Icon name="plus" />
            Create organization
          </ButtonLink>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Platform summary">
          {cards.map((c) => (
            <div key={c.label} className="corise-card p-5" data-stat={c.label}>
              <p className="text-[13px] font-medium text-[var(--color-text-muted)]">{c.label}</p>
              <p className="mt-1 text-[32px] font-semibold leading-none">{c.value}</p>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">{c.hint}</p>
            </div>
          ))}
        </section>

        <section className="corise-card overflow-hidden" aria-labelledby="websites-title">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <h2 id="websites-title" className="text-sm font-semibold">
              Organization websites
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[var(--color-bg)] text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Organization</th>
                  <th className="px-4 py-3 font-semibold">Mode</th>
                  <th className="px-4 py-3 font-semibold">Public website</th>
                  <th className="px-4 py-3 font-semibold">Admin sign-in</th>
                  <th className="px-4 py-3 font-semibold">Campaigns</th>
                  <th className="px-4 py-3 font-semibold">Website</th>
                  <th className="px-4 py-3 font-semibold">License</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {rows.map((org) => {
                  const publicPath = publicOrgPath(org.slug);
                  const adminPath = orgAdminLoginPath(org.slug);
                  return (
                    <tr key={org.id} data-org-row={org.slug}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                            style={{ background: orgColor(org) }}
                          >
                            {orgInitials(org.name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold">{org.name}</span>
                            <span className="mt-1 block">
                              <StatusPill tone={org.provisioned ? "ok" : "muted"}>{org.provisioned ? "Active" : "Sample"}</StatusPill>
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">{modeLabel(org)}</td>
                      <td className="max-w-[180px] px-4 py-3.5">
                        <Link href={publicPath} target="_blank" rel="noreferrer" className="block truncate font-medium text-[var(--color-primary)] hover:underline">
                          /org/{org.slug}
                        </Link>
                      </td>
                      <td className="max-w-[180px] px-4 py-3.5">
                        {org.provisioned ? (
                          <Link href={adminPath} target="_blank" rel="noreferrer" className="block truncate font-medium text-[var(--color-primary)] hover:underline">
                            /login?org={org.slug}
                          </Link>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums" data-campaign-count={org.activeCampaignsCount}>
                        {org.activeCampaignsCount}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusPill tone={org.websiteStatus === "live" ? "ok" : "muted"}>{org.websiteStatus === "live" ? "Live" : "Draft"}</StatusPill>
                      </td>
                      <td className="px-4 py-3.5">{licenseLabel(org)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex min-w-[180px] flex-col items-start gap-1.5">
                          <Link href={publicPath} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
                            View Public Website
                          </Link>
                          {org.provisioned ? (
                            <Link href={adminPath} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
                              Open Admin Dashboard
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                            onClick={() => {
                              setAccessId(org.id);
                              setAccessError("");
                              setRevealed(null);
                            }}
                          >
                            View Access Details
                          </button>
                          <CopyTextButton text={abs(publicPath)} label="Copy Website URL" variant="ghost" />
                          {org.provisioned ? <CopyTextButton text={abs(adminPath)} label="Copy Dashboard URL" variant="ghost" /> : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {accessOrg ? (
          <OrgAccessDialog
            org={accessOrg}
            revealedPassword={revealed?.id === accessOrg.id ? revealed.password : null}
            busy={accessBusy}
            error={accessError}
            onClose={() => {
              setAccessId(null);
              setRevealed(null);
              setAccessError("");
            }}
            onResetPassword={() => void resetPassword(accessOrg)}
            onLicenseStatus={(status) => changeLicense(accessOrg, status)}
          />
        ) : null}
      </main>
    </div>
  );
}
