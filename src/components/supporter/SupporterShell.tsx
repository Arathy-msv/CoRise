"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { ModeSwitcher, RoleSwitcher } from "@/components/deployment/DeploymentControls";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ToastHost } from "@/components/ui/Toast";
import { useCurrentSupporter, useSupporterNetwork, useSupporterOrg, type SupporterOrg } from "@/components/supporter/supporter-data";
import { supporterViewPath, type SupporterView } from "@/lib/paths";
import { importLegacyJoins, setCurrentSupporter } from "@/lib/supporter-network";
import { DEMO_SUPPORTERS, supporterInitials, type DemoSupporter } from "@/lib/supporters";

type NavItem = { view: SupporterView; label: string; icon: IconName; count?: number };

export function SupporterShell({
  active,
  children,
}: {
  active: SupporterView;
  children: (org: SupporterOrg, supporter: DemoSupporter) => ReactNode;
}) {
  const org = useSupporterOrg();
  const supporter = useCurrentSupporter();
  const network = useSupporterNetwork();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    importLegacyJoins();
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = `${org.orgName} · Supporter · Corise`;
    return () => {
      document.title = previous;
    };
  }, [org.orgName]);

  const visibleIds = new Set(org.campaigns.map((c) => c.id));
  const joinedCount = network.memberships.filter(
    (m) => m.orgSlug === org.orgSlug && m.supporterId === supporter.id && visibleIds.has(m.campaignId),
  ).length;
  const pendingCount = network.invitations.filter(
    (i) => i.orgSlug === org.orgSlug && i.supporterId === supporter.id && i.status === "pending" && visibleIds.has(i.campaignId),
  ).length;

  const nav: NavItem[] = [
    { view: "campaigns", label: "Campaigns", icon: "compass" },
    { view: "my-campaigns", label: "My Campaigns", icon: "megaphone", count: joinedCount },
    { view: "invitations", label: "Invitations", icon: "mail", count: pendingCount },
  ];

  const sidebar = (
    <div className="flex h-full flex-col gap-4 p-3">
      <div className="flex items-center justify-between px-1 pt-1">
        <Logo size="sm" />
        <button
          type="button"
          className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] md:hidden"
          onClick={close}
          aria-label="Close menu"
        >
          <Icon name="x" />
        </button>
      </div>

      <div className="space-y-2 px-1">
        <p className="truncate px-2 text-sm font-semibold">{org.orgName}</p>
        <div className="flex items-center gap-2.5 rounded-lg bg-[var(--color-bg)] px-2 py-2">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white"
          >
            {supporterInitials(supporter.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{supporter.name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Supporter</p>
          </div>
        </div>
        <label className="block px-1 text-xs font-medium text-[var(--color-text-muted)]">
          Demo supporter
          <select
            value={supporter.id}
            onChange={(e) => setCurrentSupporter(e.target.value)}
            className="corise-input mt-1 h-9 py-0 text-sm"
          >
            {DEMO_SUPPORTERS.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="space-y-0.5" aria-label="Supporter">
        {nav.map((item) => {
          const current = item.view === active;
          return (
            <Link
              key={item.view}
              href={supporterViewPath(item.view, org.orgSlug)}
              onClick={close}
              aria-current={current ? "page" : undefined}
              className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                current
                  ? "bg-[var(--color-primary-soft)] font-semibold text-[var(--color-primary)]"
                  : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              }`}
            >
              <Icon name={item.icon} size={17} className={current ? "" : "text-[var(--color-text-muted)]"} />
              {item.label}
              {item.count ? (
                <span className="ml-auto rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[11px] font-bold leading-none text-white">
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-3">
        <Link
          href={org.backHref}
          className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
        >
          <Icon name="arrowLeft" size={15} />
          {org.backLabel}
        </Link>
        <div className="space-y-2 rounded-lg border border-[var(--color-border)] p-2" aria-label="Demo controls">
          <ModeSwitcher tone="light" compact />
          <RoleSwitcher tone="light" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-[var(--color-border)] bg-white md:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/30" aria-label="Close menu" onClick={close} />
          <aside className="absolute inset-y-0 left-0 w-64 overflow-y-auto bg-white shadow-[var(--shadow-lg)]">{sidebar}</aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white/95 px-4 backdrop-blur md:hidden">
          <Logo size="sm" />
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" size={17} />
            Menu
          </button>
        </header>
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {org.ready ? (
            children(org, supporter)
          ) : (
            <p className="py-16 text-center text-sm text-[var(--color-text-muted)]">Loading campaigns…</p>
          )}
        </main>
      </div>
      <ToastHost />
    </div>
  );
}

/** Dark intro banner shared by the three supporter pages. */
export function SupporterHeader({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-[var(--color-navy-elevated)] p-6 text-white sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">{eyebrow}</p>
        <h1 className="mt-1 text-[26px] font-semibold leading-tight">{title}</h1>
        <p className="mt-1.5 max-w-xl text-sm text-white/75">{body}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
