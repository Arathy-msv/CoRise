"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { excerpt, orgColor, orgInitials, roleLabel } from "@/lib/deployment";
import { publicOrgPath } from "@/lib/paths";

export default function OrganizationsPage() {
  const { hydrated, mode, role, organizations } = useApp();
  const { state } = useCorise();
  const supporter = role === "SUPPORTER";
  const visitor = role === "VISITOR";
  const back = mode === "licensed" ? "/enter/licensed" : "/enter/saas";

  if (!hydrated) {
    return <p className="py-24 text-center text-sm text-[var(--color-text-muted)]">Loading…</p>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" aria-label="Corise home">
            <Logo size="sm" />
          </Link>
          <Link href={back} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            Switch view
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm font-semibold text-[var(--color-primary)]">
          {state.isSignedIn ? state.userName : "Guest"} · {roleLabel(role)}
        </p>
        <h1 className="mt-1 text-3xl font-semibold">Public organizations</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
          {supporter
            ? "You're a supporter. Open a website and join a campaign."
            : visitor
              ? "You're a visitor. You can look at public websites. Managing a website is for an organization admin."
              : "These are the public organization websites in this browser."}
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {organizations.map((org) => (
            <li key={org.id} className="corise-card flex flex-col p-5">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ background: orgColor(org) }}
                >
                  {orgInitials(org.name)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{org.name}</h2>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {org.activeCampaignsCount} campaign{org.activeCampaignsCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm text-[var(--color-text-muted)]">{excerpt(org.description)}</p>
              <Link href={publicOrgPath(org.slug)} className="mt-4 text-sm font-semibold text-[var(--color-primary)] hover:underline">
                {supporter ? "Open and join" : "View website"}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
