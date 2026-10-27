"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OrgSitePage from "@/app/org/[slug]/OrgSiteClient";

function OpenOrgInner() {
  const slug = useSearchParams().get("slug")?.trim() ?? "";

  if (!slug) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-2xl font-semibold">Organization link is incomplete</h1>
        <p className="text-sm text-gray-500">Open the website link from your organization page again.</p>
      </div>
    );
  }

  return <OrgSitePage params={Promise.resolve({ slug })} />;
}

/** Always exported, so a new organization website opens on GitHub Pages. */
export default function OpenOrgPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-sm text-gray-500">
          Loading website…
        </div>
      }
    >
      <OpenOrgInner />
    </Suspense>
  );
}
