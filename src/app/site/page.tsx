"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useCorise } from "@/context/CoriseContext";
import { publicOrgPath } from "@/lib/paths";
import { openAppPath } from "@/lib/static-nav";

function SiteRedirectInner() {
  const { state, hydrated } = useCorise();
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    if (!hydrated) return;
    const preview = search.get("preview") === "1" ? { preview: true } : undefined;
    openAppPath(publicOrgPath(state.organization.orgSlug, preview), router, "replace");
  }, [hydrated, state.organization.orgSlug, router, search]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-sm text-[var(--color-text-muted)]">
      Opening public website…
    </div>
  );
}

export default function SiteRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-sm text-[var(--color-text-muted)]">
          Opening public website…
        </div>
      }
    >
      <SiteRedirectInner />
    </Suspense>
  );
}
