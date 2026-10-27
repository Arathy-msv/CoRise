"use client";

import { Suspense } from "react";
import OverviewPage from "@/app/(app)/overview/page";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/layout/RequireAuth";

function OpenDashboardInner() {
  return (
    <RequireAuth>
      <AppShell>
        <OverviewPage />
      </AppShell>
    </RequireAuth>
  );
}

/** Always exported, so a new organization dashboard opens on GitHub Pages. */
export default function OpenDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-sm text-gray-500">
          Loading dashboard…
        </div>
      }
    >
      <OpenDashboardInner />
    </Suspense>
  );
}
