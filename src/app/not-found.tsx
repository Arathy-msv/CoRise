"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicCampaignClient from "@/components/campaign/PublicCampaignClient";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/layout/RequireAuth";
import CampaignDetailClient from "@/app/(app)/campaigns/[id]/CampaignDetailClient";
import OverviewPage from "@/app/(app)/overview/page";
import OrgSitePage from "@/app/org/[slug]/OrgSiteClient";
import NewOrgCampaignPage from "@/app/org/[slug]/campaigns/new/NewOrgCampaignClient";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function appPath(pathname: string): string {
  let path = pathname || "/";
  if (BASE_PATH && path.startsWith(BASE_PATH)) path = path.slice(BASE_PATH.length) || "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

/** GitHub Pages has no server, so unknown campaign links load this page and render from the URL. */
export default function NotFound() {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setPath(appPath(window.location.pathname));
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  if (path === null) {
    return <p className="p-8 text-sm text-[var(--color-text-muted)]">Loading…</p>;
  }

  const orgCampaign = path.match(/^\/org\/([^/]+)\/([^/]+)$/);
  if (orgCampaign && orgCampaign[2] !== "campaigns") {
    return <PublicCampaignClient slug={orgCampaign[2]} orgSlug={orgCampaign[1]} />;
  }

  const legacy = path.match(/^\/(?:campaign|c)\/([^/]+)$/);
  if (legacy) {
    return <PublicCampaignClient slug={legacy[1]} />;
  }

  const org = path.match(/^\/org\/([^/]+)$/);
  if (org) {
    return <OrgSitePage params={Promise.resolve({ slug: org[1] })} />;
  }

  const created = path.match(/^\/org\/([^/]+)\/campaigns\/new$/);
  if (created) {
    return (
      <RequireAuth>
        <AppShell>
          <NewOrgCampaignPage params={Promise.resolve({ slug: created[1] })} />
        </AppShell>
      </RequireAuth>
    );
  }

  if (/^\/dashboard\/[^/]+$/.test(path)) {
    return (
      <RequireAuth>
        <AppShell>
          <OverviewPage />
        </AppShell>
      </RequireAuth>
    );
  }

  const detail = path.match(/^\/campaigns\/([^/]+)$/);
  if (detail && detail[1] !== "create") {
    return (
      <RequireAuth>
        <AppShell>
          <CampaignDetailClient id={detail[1]} />
        </AppShell>
      </RequireAuth>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-[var(--color-text-muted)]">That link does not match a Corise page.</p>
      <Link href="/" className="text-sm font-semibold text-[var(--color-primary)] underline">
        Go to Corise
      </Link>
    </div>
  );
}
