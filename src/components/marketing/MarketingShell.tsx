"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { ToastHost } from "@/components/ui/Toast";
import { useCorise } from "@/context/CoriseContext";
import { homePathForRole } from "@/lib/roles";

const nav = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, hydrated } = useCorise();
  const [open, setOpen] = useState(false);
  const signedIn = hydrated && state.isSignedIn && state.managerRole;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 md:px-6">
          <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
            <Logo size="sm" />
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-semibold md:flex" aria-label="Product">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-[var(--color-primary)] ${
                  pathname === item.href.split("#")[0]
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {signedIn ? (
              <ButtonLink href={homePathForRole(state.managerRole)} size="sm">
                Open workspace
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm">
                  Log In
                </ButtonLink>
                <ButtonLink href="/signup?plan=free" size="sm">
                  Get Started
                </ButtonLink>
              </>
            )}
            <ProfileMenu />
          </div>

          <button
            type="button"
            className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-semibold md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
          >
            Menu
          </button>
        </div>

        {open ? (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              <ProfileMenu variant="block" align="left" />
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-2 py-2 text-sm font-semibold"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {signedIn ? (
                <ButtonLink
                  href={homePathForRole(state.managerRole)}
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Open workspace
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/login" variant="secondary" className="w-full">
                    Log In
                  </ButtonLink>
                  <ButtonLink href="/signup?plan=free" className="w-full">
                    Get Started
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="mt-10 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-[var(--color-text-muted)] md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="font-display text-base font-semibold text-[var(--color-primary)]">Corise</p>
            <p className="mt-1">Your idea. Your campaign. Your impact.</p>
          </div>
          <div className="flex flex-wrap gap-4 font-semibold text-[var(--color-text)]">
            <Link href="/pricing">Pricing</Link>
            <Link href="/login">Log In</Link>
            <Link href="/signup?plan=free">Get Started</Link>
          </div>
        </div>
      </footer>
      <ToastHost />
    </div>
  );
}
