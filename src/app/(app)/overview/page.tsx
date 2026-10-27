"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { canCreateWebsite } from "@/lib/deployment";
import { isOrgDashboardLocation, newCampaignPath, orgDashboardPath, publicOrgPath } from "@/lib/paths";
import { formatUsd, isCampaignClosed } from "@/lib/progress";
import { stripBasePath } from "@/lib/public-asset";
import { openAppPath } from "@/lib/static-nav";
import type { Campaign, CoriseDemoState } from "@/types/corise";

const EXTRAS: { href: string; label: string; body: string; icon: IconName }[] = [
  { href: "/campaigns", label: "All pages", body: "Every page you've created", icon: "megaphone" },
  { href: "/engagement", label: "Quizzes & activities", body: "Polls, quizzes and challenges", icon: "sparkles" },
  { href: "/sponsors", label: "Sponsors", body: "Sponsor details shown on pages", icon: "users" },
  { href: "/analytics", label: "Analytics", body: "Interactions over time", icon: "grid" },
  { href: "/marketplace", label: "Concept marketplace", body: "Product ideas for your cause", icon: "layout" },
  { href: "/website", label: "Organization website", body: "Optional site for your group", icon: "globe" },
  { href: "/settings", label: "Settings", body: "Organization details", icon: "settings" },
];

function visibleCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns.filter((campaign) => !campaign.archived);
}

function OrgHeader({ state, hideCreate = false }: { state: CoriseDemoState; hideCreate?: boolean }) {
  const org = state.organization;
  const siteLive = state.website?.status === "published";
  const campaignCount = visibleCampaigns(state.campaigns).length;
  return (
    <section
      aria-label="Organization"
      className="flex flex-col gap-4 rounded-2xl bg-[var(--color-navy)] p-6 text-white sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-navy-muted)]">Organization dashboard</p>
        <h1 className="mt-1 truncate text-2xl font-semibold">{org.name}</h1>
        {siteLive ? (
          <Link
            href={publicOrgPath(org.orgSlug)}
            target="_blank"
            className="mt-1 inline-flex items-center gap-1 text-sm text-[var(--color-navy-muted)] hover:text-white"
          >
            <Icon name="globe" size={14} />
            /org/{org.orgSlug}
          </Link>
        ) : null}
      </div>
      {hideCreate ? null : (
        <ButtonLink href={newCampaignPath(org.orgSlug)} variant="brand" size="lg" className="shrink-0">
          <Icon name="plus" />
          {campaignCount === 0 ? "Create Your First Campaign" : "New Campaign"}
        </ButtonLink>
      )}
    </section>
  );
}

function PublishWebsiteBanner({ canCreate }: { canCreate: boolean }) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-soft)] p-4"
    >
      <div className="flex items-start gap-2.5">
        <Icon name="globe" size={18} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
        <p className="text-sm">
          <strong className="font-semibold">Your website isn&apos;t published yet.</strong>{" "}
          {canCreate
            ? "Supporters won't see your campaigns until you create and publish your organization website."
            : "Campaigns stay private until your organization website is published."}
        </p>
      </div>
      {canCreate ? (
        <ButtonLink href="/website" size="sm" className="shrink-0">
          Go to My Website
        </ButtonLink>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  count,
}: {
  label: string;
  value: string;
  hint: string;
  count?: number;
}) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-[var(--shadow-sm)]">
      <p className="text-sm font-medium text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-2 text-4xl font-semibold leading-none tracking-[-0.03em]" data-campaign-count={count}>
        {value}
      </p>
      <p className="mt-3 text-sm text-[var(--color-text-muted)]">{hint}</p>
    </article>
  );
}

export default function OverviewPage() {
  const { state } = useCorise();
  const { hydrated, mode, role } = useApp();
  const router = useRouter();
  const orgSlug = state.organization.orgSlug;

  useEffect(() => {
    if (!hydrated || !orgSlug) return;
    if (isOrgDashboardLocation(stripBasePath(window.location.pathname), window.location.search, orgSlug)) return;
    openAppPath(orgDashboardPath(orgSlug), router, "replace");
  }, [hydrated, orgSlug, router]);

  if (!hydrated) {
    return <p className="py-16 text-center text-sm text-[var(--color-text-muted)]">Loading…</p>;
  }

  const canCreate = canCreateWebsite(mode, role);
  const websiteLive = state.website?.status === "published";
  const campaigns = visibleCampaigns(state.campaigns);
  const published = campaigns.filter((campaign) => campaign.status === "published");
  const closedCount = published.filter((campaign) => isCampaignClosed(campaign)).length;
  const activeCount = published.length - closedCount;
  const draftCount = campaigns.length - published.length;
  const fundsRaised = campaigns.reduce((sum, campaign) => sum + (campaign.metrics.fundsRaised || 0) + (campaign.metrics.pledged || 0), 0);
  const supporters = campaigns.reduce((sum, campaign) => sum + (campaign.metrics.supporters || 0), 0);
  const usingSample = campaigns.some((campaign) => campaign.isSample) && !state.claimedSpace;

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <OrgHeader state={state} hideCreate={websiteLive && campaigns.length === 0} />
      {!websiteLive ? <PublishWebsiteBanner canCreate={canCreate} /> : null}
      {usingSample && canCreate ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Some of these numbers come from sample campaigns.{" "}
          <Link href="/create" className="font-semibold text-[var(--color-primary)] hover:underline">
            Create your own page
          </Link>
        </p>
      ) : null}

      <section aria-label="Organization totals" className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Active campaigns"
          value={String(activeCount)}
          hint="Published and still open."
          count={activeCount}
        />
        <StatCard label="Draft campaigns" value={String(draftCount)} hint="Saved, and not published yet." />
        <StatCard label="Closed campaigns" value={String(closedCount)} hint="Reached their goal. Fundraising has stopped." />
        <StatCard
          label="Total funds raised"
          value={formatUsd(fundsRaised)}
          hint="Amounts saved with your campaigns in this browser. No payment is collected."
        />
        <StatCard
          label="Supporters"
          value={supporters.toLocaleString("en-US")}
          hint="People counted on your campaigns in this browser."
        />
      </section>

      {campaigns.length === 0 ? (
        <div className="py-4 text-center" data-empty-campaigns>
          <h2 className="text-[28px] font-semibold">You haven&apos;t created any campaigns yet.</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--color-text-muted)]">
            {websiteLive
              ? "Your organization website is ready. Create a campaign when you want these numbers to grow."
              : "Three quick steps: a headline and goal, an optional progress widget, then publish."}
          </p>
          <p className="mt-4 text-sm" data-campaign-count="0">
            <span className="font-semibold">Website:</span> {websiteLive ? "Live" : "Not published yet"}
          </p>
          <ButtonLink href={newCampaignPath(state.organization.orgSlug)} size="lg" className="mt-6">
            <Icon name="plus" />
            Create Your First Campaign
          </ButtonLink>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">
          <Link href="/campaigns" className="font-semibold text-[var(--color-primary)] hover:underline">
            Open campaigns
          </Link>{" "}
          to edit a page.
        </p>
      )}

      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <Icon name="chevronRight" size={15} className="transition group-open:rotate-90" />
          Settings &amp; Extras
        </summary>
        <ul className="mt-4 grid gap-1 sm:grid-cols-2">
          {EXTRAS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[var(--color-bg)]">
                <Icon name={item.icon} size={18} className="text-[var(--color-text-muted)]" />
                <span>
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block text-xs text-[var(--color-text-muted)]">{item.body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
