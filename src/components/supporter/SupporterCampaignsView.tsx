"use client";

import Link from "next/link";
import { useState } from "react";
import { HeroVisual } from "@/components/campaign/HeroVisual";
import { CampaignFigures } from "@/components/supporter/CampaignFigures";
import { SupporterHeader } from "@/components/supporter/SupporterShell";
import { useSupporterNetwork, type SupporterOrg } from "@/components/supporter/supporter-data";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { useCorise } from "@/context/CoriseContext";
import { shareCampaignPath, supporterViewPath } from "@/lib/paths";
import { isCampaignClosed } from "@/lib/progress";
import { findMembership, joinCampaign } from "@/lib/supporter-network";
import type { DemoSupporter } from "@/lib/supporters";
import { CAMPAIGN_TYPE_META, type CampaignType } from "@/types/corise";

export function SupporterCampaignsView({ org, supporter }: { org: SupporterOrg; supporter: DemoSupporter }) {
  const network = useSupporterNetwork();
  const { showToast } = useCorise();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<CampaignType | "all">("all");

  const types = Array.from(new Set(org.campaigns.map((c) => c.type)));
  const needle = query.trim().toLowerCase();
  const shown = org.campaigns.filter(
    (c) =>
      (type === "all" || c.type === type) &&
      (!needle || `${c.title} ${c.headline} ${c.description}`.toLowerCase().includes(needle)),
  );

  const join = (campaignId: string, title: string) => {
    const result = joinCampaign({ orgSlug: org.orgSlug, campaignId, supporterId: supporter.id });
    if (!result.membership) {
      showToast("Couldn't save your join in this browser. Try again.", "warn");
      return;
    }
    showToast(
      result.created ? `You joined ${title}. No donation was made.` : `You've already joined ${title}.`,
      result.created ? "success" : "info",
    );
  };

  return (
    <div className="space-y-6">
      <SupporterHeader
        eyebrow="Supporter view"
        title="Explore campaigns"
        body={`Browse ${org.orgName}'s live campaigns. Join one to get your own share link and personal note — joining never takes a payment.`}
      />

      {org.campaigns.length === 0 ? (
        <EmptyState
          icon="megaphone"
          title="No public campaigns yet"
          body={
            org.websiteLive
              ? `${org.orgName} hasn't published any campaigns yet.`
              : `${org.orgName} hasn't published its website yet, so its campaigns aren't public.`
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search campaigns</span>
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search campaigns by name or keyword"
                className="corise-input"
                style={{ paddingLeft: 36 }}
              />
            </label>
            {types.length > 1 ? (
              <label className="sm:w-52">
                <span className="sr-only">Category</span>
                <select value={type} onChange={(e) => setType(e.target.value as CampaignType | "all")} className="corise-input">
                  <option value="all">All categories</option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {CAMPAIGN_TYPE_META[t]?.label ?? t}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {shown.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
              No campaigns match your search.
            </p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((campaign) => {
                const joined = Boolean(findMembership(network, org.orgSlug, campaign.id, supporter.id));
                const closed = isCampaignClosed(campaign);
                return (
                  <li key={campaign.id} className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
                    <HeroVisual imageKey={campaign.heroImage} aspect="aspect-[16/9]" className="rounded-none" />
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone={closed ? "neutral" : "success"}>{closed ? "Closed" : "Live"}</Badge>
                        <Badge>{CAMPAIGN_TYPE_META[campaign.type]?.label ?? "Campaign"}</Badge>
                        {joined ? <Badge tone="primary">Joined</Badge> : null}
                      </div>
                      <div>
                        <h2 className="text-[17px] font-semibold leading-snug">{campaign.title}</h2>
                        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{campaign.organizationName || org.orgName}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-muted)]">{campaign.description}</p>
                      </div>
                      <div className="mt-auto space-y-3">
                        <CampaignFigures campaign={campaign} />
                        <div className="flex gap-2">
                          {joined ? (
                            <ButtonLink href={supporterViewPath("my-campaigns", org.orgSlug)} variant="secondary" className="flex-1">
                              <Icon name="check" />
                              Joined
                            </ButtonLink>
                          ) : (
                            <Button className="flex-1" onClick={() => join(campaign.id, campaign.title)}>
                              <Icon name="plus" />
                              Join campaign
                            </Button>
                          )}
                          <ButtonLink
                            href={shareCampaignPath(campaign.slug, org.orgSlug)}
                            variant="ghost"
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`View ${campaign.title}`}
                          >
                            View
                            <Icon name="external" />
                          </ButtonLink>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-xs text-[var(--color-text-muted)]">
            Joining saves you as a supporter in this browser. No payment is taken and the campaign total doesn&apos;t change.{" "}
            <Link href={supporterViewPath("my-campaigns", org.orgSlug)} className="font-semibold text-[var(--color-primary)] underline">
              Go to My Campaigns
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
