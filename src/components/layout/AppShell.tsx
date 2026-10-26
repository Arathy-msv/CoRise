"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ToastHost } from "@/components/ui/Toast";
import { ButtonLink } from "@/components/ui/Button";
import { ModeSwitcher, RoleSwitcher } from "@/components/deployment/DeploymentControls";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { useCorise } from "@/context/CoriseContext";
import { newCampaignPath } from "@/lib/paths";

type NavItem = { href: string; label: string; icon: IconName; match?: string[] };

const MORE_PATHS = ["/settings", "/website", "/engagement", "/sponsors", "/marketplace", "/analytics"];

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
        active
          ? "bg-[var(--color-primary-soft)] font-semibold text-[var(--color-primary)]"
          : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
      }`}
    >
      <Icon name={item.icon} size={17} className={active ? "" : "text-[var(--color-text-muted)]"} />
      {item.label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useCorise();
  const [open, setOpen] = useState(false);
  const inMore = MORE_PATHS.some((p) => pathname.startsWith(p));
  const [moreOpen, setMoreOpen] = useState(inMore);
  const close = () => setOpen(false);

  const createHref = newCampaignPath(state.organization.orgSlug);
  const creating = pathname === createHref;

  const primaryNav: NavItem[] = [
    { href: "/overview", label: "Dashboard", icon: "home", match: ["/dashboard"] },
    { href: "/campaigns", label: "Campaigns", icon: "megaphone", match: ["/campaigns/create"] },
  ];

  const moreNav: NavItem[] = [
    { href: "/engagement", label: "Quizzes & activities", icon: "sparkles" },
    { href: "/sponsors", label: "Sponsors", icon: "users" },
    { href: "/analytics", label: "Analytics", icon: "grid" },
    { href: "/marketplace", label: "Concept marketplace", icon: "layout" },
    { href: "/website", label: "Organization website", icon: "globe" },
    { href: "/settings", label: "Settings", icon: "settings" },
  ];

  const isActive = (item: NavItem) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`) || Boolean(item.match?.some((m) => pathname.startsWith(m)));

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
        <p className="truncate px-2 text-sm font-semibold">{state.organization.name}</p>
        <ProfileMenu tone="light" variant="block" align="left" />
      </div>

      <ButtonLink href={createHref} className={`w-full ${creating ? "ring-2 ring-[var(--color-primary)] ring-offset-2" : ""}`}>
        <Icon name="plus" />
        New Campaign
      </ButtonLink>

      <nav className="space-y-0.5" aria-label="Main">
        {primaryNav.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item)} onNavigate={close} />
        ))}
      </nav>

      <div>
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-bg)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
        >
          <Icon name="more" size={17} className="text-[var(--color-text-muted)]" />
          Settings &amp; Extras
          <Icon name="chevronDown" size={15} className={`ml-auto text-[var(--color-text-muted)] transition ${moreOpen ? "rotate-180" : ""}`} />
        </button>
        {moreOpen ? (
          <div className="mt-0.5 space-y-0.5 pl-3">
            {moreNav.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item)} onNavigate={close} />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-auto space-y-2 pt-3">
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
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-[var(--shadow-lg)]">{sidebar}</aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-[var(--color-border)] bg-white/95 px-4 backdrop-blur md:hidden">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <ProfileMenu tone="light" />
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Icon name="menu" size={17} />
              Menu
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">{children}</main>
      </div>
      <ToastHost />
    </div>
  );
}
