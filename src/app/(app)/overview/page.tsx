"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CampaignGamifiedProgress } from "@/components/campaign/CampaignGamifiedProgress";
import { HeroVisual } from "@/components/campaign/HeroVisual";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { CopyLinkButton } from "@/components/ui/CopyLinkButton";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { canCreateWebsite } from "@/lib/deployment";
import { relativeTime } from "@/lib/format";
import { campaignDraftView, campaignUpdatedAt } from "@/lib/impact-space/publish";
import { newCampaignPath, orgDashboardPath, publicCampaignPath, publicOrgPath } from "@/lib/paths";
import { campaignProgress, formatGoalValue, progressPercent } from "@/lib/progress";
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

/** The page the dashboard focuses on: the more recent of the one just created and the latest published, else the newest. */
function activeCampaign(s: CoriseDemoState): Campaign | undefined {
  const visible = s.campaigns.filter((c) => !c.archived);
  const byId = (id: string | null | undefined) => (id ? visible.find((c) => c.id === id) : undefined);
  const newest = (list: Campaign[]) => [...list].sort((a, b) => campaignUpdatedAt(b).localeCompare(campaignUpdatedAt(a)))[0];
  const highlighted = [byId(s.claimedSpace?.campaignId), byId(s.lastPublishedId)].filter((c): c is Campaign => Boolean(c));
  return newest(highlighted) ?? newest(visible);
}

function OrgHeader({ state, hideCreate = false }: { state: CoriseDemoState; hideCreate?: boolean }) {
  const org = state.organization;
  const siteLive = state.website?.status === "published";
  const campaignCount = state.campaigns.filter((c) => !c.archived).length;
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

function CampaignList({ state, activeId }: { state: CoriseDemoState; activeId: string }) {
  const others = state.campaigns.filter((c) => !c.archived && c.id !== activeId);
  if (!others.length) return null;
  return (
    <section aria-labelledby="all-campaigns" className="space-y-3">
      <h2 id="all-campaigns" className="text-lg font-semibold">
        Other campaigns
      </h2>
      <ul className="divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-sm)]">
        {others.map((c) => {
          const view = campaignDraftView(c);
          const goal = campaignProgress(c);
          const live = c.status === "published";
          return (
            <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {live ? <Badge tone="success">Live</Badge> : <Badge>Draft</Badge>}
                  {goal ? (
                    <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                      {Math.floor(progressPercent(goal.current, goal.target))}% of {formatGoalValue(goal.goalType, goal.target)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate font-semibold">{view.title}</p>
              </div>
              <div className="flex gap-2">
                {live ? <CopyLinkButton path={publicCampaignPath(c.slug, state.organization.orgSlug)} label="Copy link" /> : null}
                <ButtonLink href={`/preview?id=${c.id}`} variant="ghost" size="sm">
                  <Icon name="edit" />
                  Edit<span className="sr-only"> {view.title}</span>
                </ButtonLink>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function OverviewPage() {
  const { state } = useCorise();
  const { hydrated, mode, role } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const orgSlug = state.organization.orgSlug;

  useEffect(() => {
    if (!hydrated || !orgSlug) return;
    const expected = orgDashboardPath(orgSlug);
    if (pathname.replace(/\/+$/, "") !== expected) router.replace(expected);
  }, [hydrated, orgSlug, pathname, router]);

  if (!hydrated) {
    return <p className="py-16 text-center text-sm text-[var(--color-text-muted)]">Loading…</p>;
  }

  const canCreate = canCreateWebsite(mode, role);
  const websiteLive = state.website?.status === "published";
  const active = activeCampaign(state);

  if (!active) {
    return (
      <div className="mx-auto max-w-3xl space-y-10">
        <OrgHeader state={state} hideCreate={websiteLive} />
        {!websiteLive ? <PublishWebsiteBanner canCreate={canCreate} /> : null}
        <div className="py-8 text-center" data-empty-campaigns>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">Welcome to {state.organization.name}</p>
          <h2 className="mt-2 text-[28px] font-semibold">You haven&apos;t created any campaigns yet.</h2>
          {websiteLive ? (
            <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--color-text-muted)]">
              Your organization website is ready. You can now create your first campaign whenever you&apos;re ready.
            </p>
          ) : (
            <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--color-text-muted)]">
              Three quick steps: a headline and goal, an optional progress widget, then publish.
            </p>
          )}
          <p className="mt-4 text-sm" data-campaign-count="0">
            <span className="font-semibold">Website:</span> {websiteLive ? "Live" : "Not published yet"}
            <span className="mx-2 text-[var(--color-text-muted)]">·</span>
            <span className="font-semibold">Campaigns:</span> 0
          </p>
          <ButtonLink href={newCampaignPath(state.organization.orgSlug)} size="lg" className="mt-6">
            <Icon name="plus" />
            Create Your First Campaign
          </ButtonLink>
        </div>
      </div>
    );
  }

  const page = campaignDraftView(active);
  const live = active.status === "published";
  const path = publicCampaignPath(active.slug, state.organization.orgSlug);
  const usingSample = Boolean(active.isSample) && !state.claimedSpace;
  const goal = campaignProgress(active);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <OrgHeader state={state} />
      {!websiteLive ? <PublishWebsiteBanner canCreate={canCreate} /> : null}
      {usingSample && canCreate ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          You&apos;re looking at sample content.{" "}
          <Link href="/create" className="font-semibold text-[var(--color-primary)] hover:underline">
            Create your own page
          </Link>
        </p>
      ) : null}

      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <HeroVisual imageKey={page.heroImage} aspect="aspect-[4/3]" className="w-28 shrink-0 rounded-xl" sizes="112px" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {live ? <Badge tone="success">Live</Badge> : <Badge>Draft</Badge>}
            <span className="text-xs text-[var(--color-text-muted)]">Updated {relativeTime(campaignUpdatedAt(active))}</span>
          </div>
          <h2 className="mt-1.5 text-[28px] font-semibold leading-tight sm:text-[32px]">{page.title}</h2>
          {live ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyLinkButton path={path} label="Copy public link" />
              <ButtonLink href={path} target="_blank" rel="noreferrer" variant="ghost" size="sm">
                <Icon name="external" />
                View live
              </ButtonLink>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Not published yet. Open the editor to publish.</p>
          )}
        </div>
      </header>

      <section aria-label="Supporters" className="rounded-2xl bg-white p-8 shadow-[var(--shadow-md)]">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">Total supporters</p>
        <p className="mt-1 text-[64px] font-semibold leading-none tracking-[-0.03em]">
          {active.metrics.supporters.toLocaleString()}
        </p>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">People who joined from your page in this browser.</p>
      </section>

      {goal ? (
        <CampaignGamifiedProgress type={goal.widget} currentAmount={goal.current} targetAmount={goal.target} goalType={goal.goalType} />
      ) : null}

      <ButtonLink href={`/preview?id=${active.id}`} size="lg" className="w-full sm:w-auto sm:min-w-[220px]">
        <Icon name="edit" />
        Edit Page
      </ButtonLink>

      <CampaignList state={state} activeId={active.id} />

      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <Icon name="chevronRight" size={15} className="transition group-open:rotate-90" />
          Settings &amp; Extras
        </summary>
        <ul className="mt-4 grid gap-1 sm:grid-cols-2">
          {EXTRAS.map((x) => (
            <li key={x.href}>
              <Link href={x.href} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[var(--color-bg)]">
                <Icon name={x.icon} size={18} className="text-[var(--color-text-muted)]" />
                <span>
                  <span className="block text-sm font-semibold">{x.label}</span>
                  <span className="block text-xs text-[var(--color-text-muted)]">{x.body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
