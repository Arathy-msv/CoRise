"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPlan } from "@/config/plans";
import { Logo } from "@/components/brand/Logo";
import { ModeSwitcher, RoleSwitcher } from "@/components/deployment/DeploymentControls";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { useApp } from "@/context/AppContext";
import { canAccessPlatformAdmin, orgColor, orgInitials, platformStats, roleLabel, type DirectoryOrganization } from "@/lib/deployment";
import { publicOrgPath } from "@/lib/paths";

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 text-[var(--color-text-muted)]">{children}</div>;
}

function registeredOn(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function PlanBadge({ org }: { org: DirectoryOrganization }) {
  const plan = getPlan(org.plan);
  const tone =
    org.plan === "organization"
      ? "bg-[var(--color-navy)] text-white"
      : org.plan === "pro"
        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
        : "bg-[var(--color-bg)] text-[var(--color-text)]";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{plan.name}</span>;
}

export default function PlatformAdminPage() {
  const router = useRouter();
  const { hydrated, mode, role, organizations, setRole } = useApp();

  useEffect(() => {
    if (hydrated && mode === "licensed") router.replace("/dashboard");
  }, [hydrated, mode, router]);

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
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Platform admin</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-muted)]">
            Every organization website registered on Corise Cloud, with the plan it is on. Figures are saved in this browser.
          </p>
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
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-[var(--color-bg)] text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                <tr>
                  <th className="w-[34%] px-5 py-3 font-semibold">Organization</th>
                  <th className="w-[20%] px-5 py-3 font-semibold">Website</th>
                  <th className="w-[12%] px-5 py-3 font-semibold">Plan</th>
                  <th className="w-[11%] px-5 py-3 font-semibold">Campaigns</th>
                  <th className="w-[13%] px-5 py-3 font-semibold">Registered</th>
                  <th className="w-[10%] px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {rows.map((org) => (
                  <tr key={org.id}>
                    <td className="max-w-0 px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                          style={{ background: orgColor(org) }}
                        >
                          {orgInitials(org.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{org.name}</span>
                          <span className="block truncate text-xs text-[var(--color-text-muted)]">{org.description}</span>
                        </span>
                      </div>
                    </td>
                    <td className="max-w-0 px-5 py-3.5">
                      <Link href={publicOrgPath(org.slug)} target="_blank" className="block truncate font-medium text-[var(--color-primary)] hover:underline">
                        /org/{org.slug}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <PlanBadge org={org} />
                    </td>
                    <td className="px-5 py-3.5 tabular-nums">{org.activeCampaignsCount}</td>
                    <td className="px-5 py-3.5 text-[var(--color-text-muted)]">{registeredOn(org.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      {org.websiteStatus === "live" ? (
                        <span className="rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-success)]">
                          Live
                        </span>
                      ) : (
                        <span className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-muted)]">
                          Draft
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
