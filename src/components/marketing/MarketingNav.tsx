"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { canAccessPlatformAdmin } from "@/lib/deployment";

export function MarketingNav({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { state, hydrated } = useCorise();
  const { mode, role } = useApp();
  const signedIn = hydrated && state.isSignedIn;
  const dashboardHref = canAccessPlatformAdmin(mode, role) ? "/admin/platform" : "/overview";
  const dark = tone === "dark";
  const link = dark
    ? "rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-navy-muted)] transition hover:text-white"
    : "rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]";

  return (
    <header className={dark ? "surface-dark" : "bg-white"}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6" aria-label="Corise">
        <Link href="/" aria-label="Corise home">
          <Logo size="sm" tone={tone} />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/pricing" className={link}>
            Pricing
          </Link>
          {signedIn ? (
            <ButtonLink href={dashboardHref} variant={dark ? "brand" : "secondary"}>
              Dashboard
            </ButtonLink>
          ) : (
            <Link href="/login" className={link}>
              Log In
            </Link>
          )}
          <ProfileMenu tone={tone} />
        </div>
      </nav>
    </header>
  );
}
