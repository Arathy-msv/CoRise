"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { canAccessOrgDashboard, canAccessPlatformAdmin, roleLabel } from "@/lib/deployment";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { state, hydrated } = useCorise();
  const { hydrated: appHydrated, mode, role, setRole } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || !appHydrated) return;
    if (!state.isSignedIn) {
      router.replace("/login");
      return;
    }
    if (canAccessPlatformAdmin(mode, role)) router.replace("/admin/platform");
  }, [hydrated, appHydrated, state.isSignedIn, mode, role, router]);

  if (!hydrated || !appHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-muted)]">
        Loading Corise…
      </div>
    );
  }

  if (!state.isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-muted)]">
        Redirecting to sign in…
      </div>
    );
  }

  if (canAccessPlatformAdmin(mode, role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-muted)]">
        Opening the platform admin…
      </div>
    );
  }

  if (!canAccessOrgDashboard(mode, role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="corise-card max-w-md space-y-3 p-6 text-center" role="alert">
          <h1 className="text-xl font-semibold">Organization admins only</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            You&apos;re previewing Corise as a <strong>{roleLabel(role)}</strong>. Supporters and visitors can browse public websites and
            campaigns, but the dashboard is for organization admins.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <button type="button" className="corise-btn corise-btn-primary corise-btn-md" onClick={() => setRole("ORG_ADMIN")}>
              Switch to Org Admin
            </button>
            <Link href="/" className="corise-btn corise-btn-ghost corise-btn-md">
              Choose an edition
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
