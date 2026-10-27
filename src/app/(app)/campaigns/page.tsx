"use client";

import Link from "next/link";
import { useState } from "react";
import { HeroVisual } from "@/components/campaign/HeroVisual";
import { StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CopyLinkButton } from "@/components/ui/CopyLinkButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { canCreateWebsite } from "@/lib/deployment";
import { relativeTime } from "@/lib/format";
import { campaignDraftView, campaignPublishState, campaignUpdatedAt } from "@/lib/impact-space/publish";
import { newCampaignPath, publicCampaignPath } from "@/lib/paths";
import type { Campaign } from "@/types/corise";

type CardMsg = { ok: boolean; text: string };

export default function CampaignsPage() {
  const { state, publishCampaign } = useCorise();
  const { mode, role } = useApp();
  const [showArchived, setShowArchived] = useState(false);
  const [messages, setMessages] = useState<Record<string, CardMsg>>({});
  const active = state.campaigns.filter((c) => !c.archived);
  const archived = state.campaigns.filter((c) => c.archived);
  const websiteLive = state.website?.status === "published";
  const canCreate = canCreateWebsite(mode, role);
  const sorted = (list: Campaign[]) => [...list].sort((a, b) => campaignUpdatedAt(b).localeCompare(campaignUpdatedAt(a)));
  const list = sorted(showArchived ? archived : active);

  const onPublish = (c: Campaign) => {
    const result = publishCampaign(c.id, { silent: true });
    setMessages((m) => ({
      ...m,
      [c.id]: result.ok
        ? { ok: true, text: "Published — the link works in this browser." }
        : { ok: false, text: result.error },
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Pages"
        description="Drafts stay private until you publish them."
        actions={
          active.length > 0 ? (
            <ButtonLink href={newCampaignPath(state.organization.orgSlug)}>
              <Icon name="plus" />
              New Campaign
            </ButtonLink>
          ) : undefined
        }
      />

      {!websiteLive && active.length > 0 ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-soft)] p-4"
        >
          <div className="flex items-start gap-2.5">
            <Icon name="globe" size={18} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
            <p className="text-sm">
              <strong className="font-semibold">Your website isn&apos;t published yet.</strong>{" "}
              {canCreate
                ? "Published campaigns stay private until you publish your organization website."
                : "Published campaigns stay private until your organization website is published."}
            </p>
          </div>
          {canCreate ? (
            <ButtonLink href="/website" size="sm" className="shrink-0">
              Go to My Website
            </ButtonLink>
          ) : null}
        </div>
      ) : null}

      {archived.length ? (
        <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-white p-0.5 text-sm">
          {(
            [
              [false, `Active (${active.length})`],
              [true, `Archived (${archived.length})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={showArchived === value}
              onClick={() => setShowArchived(value)}
              className={`h-8 rounded-md px-3 font-medium transition ${
                showArchived === value ? "bg-[var(--color-bg)] text-[var(--color-text)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {list.length === 0 ? (
        showArchived ? (
          <EmptyState icon="megaphone" title="No archived pages" body="Archived pages are hidden from supporters." />
        ) : (
          <EmptyState
            icon="megaphone"
            title="You haven't created any campaigns yet."
            body="Your campaigns will show up here after you create one. Nothing is added automatically."
            action={
              <ButtonLink href={newCampaignPath(state.organization.orgSlug)}>
                <Icon name="plus" />
                Create Your First Campaign
              </ButtonLink>
            }
          />
        )
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const v = campaignDraftView(c);
            const s = campaignPublishState(c);
            const msg = messages[c.id];
            const livePath = publicCampaignPath(c.slug, state.organization.orgSlug);
            return (
              <li key={c.id} className="corise-card flex flex-col overflow-hidden">
                <Link href={`/campaigns/${c.id}`} className="group block focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]">
                  <HeroVisual imageKey={v.heroImage} aspect="aspect-[16/9]" className="rounded-none" sizes="(min-width: 1280px) 340px, (min-width: 640px) 50vw, 100vw" />
                </Link>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge state={s} />
                    {c.featureOnWebsite && s !== "archived" && s !== "draft" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
                        <Icon name="globe" size={12} />
                        On website
                      </span>
                    ) : null}
                  </div>
                  <Link href={`/campaigns/${c.id}`} className="text-[16px] font-semibold leading-snug hover:text-[var(--color-primary)]">
                    {v.title}
                  </Link>
                  <p className="line-clamp-2 text-sm text-[var(--color-text-muted)]">{v.headline}</p>
                  <p className="mt-auto pt-1 text-xs text-[var(--color-text-muted)]">Updated {relativeTime(campaignUpdatedAt(c))}</p>
                  <div className="flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-3">
                    {s === "draft" || s === "changes" ? (
                      <Button size="sm" onClick={() => onPublish(c)}>
                        {s === "changes" ? "Publish updates" : "Publish"}
                      </Button>
                    ) : null}
                    {s === "published" || s === "changes" ? (
                      <>
                        <CopyLinkButton path={livePath} />
                        <ButtonLink href={livePath} target="_blank" rel="noreferrer" variant="ghost" size="sm">
                          <Icon name="external" />
                          View live
                        </ButtonLink>
                      </>
                    ) : null}
                    <ButtonLink href={s === "archived" ? `/campaigns/${c.id}` : `/preview?id=${c.id}`} variant="outline" size="sm">
                      {s !== "archived" ? (
                        <>
                          <Icon name="edit" />
                          Edit
                        </>
                      ) : (
                        <>
                          <Icon name="eye" />
                          Preview
                        </>
                      )}
                    </ButtonLink>
                  </div>
                  {msg ? (
                    <p role="status" className={`text-xs font-medium ${msg.ok ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                      {msg.text}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
