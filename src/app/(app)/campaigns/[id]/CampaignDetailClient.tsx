"use client";

import Link from "next/link";
import { useState } from "react";
import { CampaignPreview } from "@/components/impact-space/CampaignPreview";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { InviteSupporters } from "@/components/campaign/InviteSupporters";
import { PageHeader, SectionHeader } from "@/components/ui/PageHeader";
import { PublicLink } from "@/components/ui/PublicLink";
import { useCorise } from "@/context/CoriseContext";
import { relativeTime } from "@/lib/format";
import { campaignDraftView, campaignPublishState, campaignUpdatedAt } from "@/lib/impact-space/publish";
import { publicCampaignPath } from "@/lib/paths";
import { campaignProgress, isCampaignClosed } from "@/lib/progress";

type Callout = { tone: "success" | "error"; text: string };

export default function CampaignDetailClient({ id }: { id: string }) {
  const { state, getCampaign, updateCampaign, publishCampaign, showToast } = useCorise();
  const campaign = getCampaign(id);
  const [busy, setBusy] = useState(false);
  const [callout, setCallout] = useState<Callout | null>(null);
  const [inviting, setInviting] = useState(false);

  if (!campaign) {
    return (
      <EmptyState
        icon="megaphone"
        title="Campaign not found"
        body="It may have been removed, or the link is incomplete."
        action={
          <Link href="/campaigns" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            Back to My Pages
          </Link>
        }
      />
    );
  }

  const view = campaignDraftView(campaign);
  const s = campaignPublishState(campaign);
  const isLive = campaign.status === "published" && !campaign.archived;
  const goal = campaignProgress(campaign);
  const gameLabel =
    goal?.goalType === "amount" && goal.widget === "tree"
      ? "Open garden view"
      : goal?.goalType === "amount" && goal.widget === "race"
        ? "Open race view"
        : goal?.goalType === "amount" && goal.widget === "shelter"
          ? "Open sanctuary view"
          : goal?.goalType === "amount" && goal.widget === "campfire"
            ? "Open campfire view"
            : goal?.goalType === "amount" && goal.widget === "castle"
              ? "Open castle view"
              : "View public page";

  const onPublish = async () => {
    setBusy(true);
    setCallout(null);
    await new Promise((r) => setTimeout(r, 450));
    const result = publishCampaign(campaign.id, { silent: true });
    setBusy(false);
    setCallout(
      result.ok
        ? { tone: "success", text: "Campaign published. Supporters can join without an account at the link below (this browser only for now)." }
        : { tone: "error", text: `Couldn't publish: ${result.error}` }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/campaigns" className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <Icon name="arrowLeft" size={14} />
          My Pages
        </Link>
      </div>
      <PageHeader
        title={view.title}
        meta={
          <>
            {isCampaignClosed(campaign) ? <Badge>Closed</Badge> : <StatusBadge state={s} />}
            {campaign.featureOnWebsite && isLive ? (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <Icon name="globe" size={12} />
                On website
              </span>
            ) : null}
            <span className="text-xs text-[var(--color-text-muted)]">Updated {relativeTime(campaignUpdatedAt(campaign))}</span>
          </>
        }
        actions={
          s === "archived" ? null : (
            <>
              {isLive ? (
                <Button variant="secondary" onClick={() => setInviting(true)}>
                  <Icon name="mail" />
                  Invite supporters
                </Button>
              ) : null}
              {isLive ? (
                <ButtonLink href={publicCampaignPath(campaign.slug, state.organization.orgSlug)} target="_blank" rel="noreferrer" variant="secondary">
                  <Icon name="external" />
                  {gameLabel}
                </ButtonLink>
              ) : null}
              <ButtonLink href={`/preview?id=${campaign.id}`} variant="secondary">
                <Icon name="edit" />
                Edit Page
              </ButtonLink>
              {s === "draft" || s === "changes" ? (
                <Button onClick={() => void onPublish()} loading={busy}>
                  {busy ? "Publishing…" : "Publish"}
                </Button>
              ) : null}
            </>
          )
        }
      />

      {callout ? (
        <div
          role="status"
          className={`flex gap-2 rounded-lg border px-3 py-2.5 text-sm ${
            callout.tone === "success" ? "border-[var(--color-success)]/25 bg-[var(--color-success-soft)]" : "border-[var(--color-danger)]/25 bg-[var(--color-danger-soft)]"
          }`}
        >
          <Icon name={callout.tone === "success" ? "check" : "alert"} className="mt-0.5 shrink-0" />
          {callout.text}
        </div>
      ) : null}

      {isLive ? <PublicLink path={publicCampaignPath(campaign.slug, state.organization.orgSlug)} label="Public campaign link" /> : null}

      {inviting && isLive ? (
        <Modal
          title="Invite supporters"
          description={`Invitations to ${campaign.title} appear on each supporter's Invitations page in this browser. Nothing is emailed.`}
          onClose={() => setInviting(false)}
        >
          <InviteSupporters
            onBack={() => setInviting(false)}
            backLabel="Close"
            campaign={{ id: campaign.id, title: campaign.title, orgSlug: state.organization.orgSlug }}
          />
        </Modal>
      ) : null}

      <div>
        <section className="min-w-0 space-y-2" aria-label="Campaign preview">
          <p className="text-[13px] font-medium text-[var(--color-text-muted)]">
            {s === "draft"
              ? "Draft preview — supporters can't see this yet"
              : s === "changes"
                ? "Preview includes unpublished changes — supporters still see the live version"
                : s === "archived"
                  ? "Archived — hidden from supporters"
                  : "Matches the live version"}
          </p>
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)]">
            <div className="max-h-[75vh] overflow-y-auto">
              <CampaignPreview campaign={view} />
            </div>
          </div>
        </section>
      </div>

        <section className="space-y-3">
          <SectionHeader title="Settings" />
          <div className="corise-card divide-y divide-[var(--color-border)]">
            <label className="flex cursor-pointer items-start justify-between gap-4 p-4">
              <span>
                <span className="block text-sm font-semibold">Show on organization website</span>
                <span className="block text-xs text-[var(--color-text-muted)]">Only published campaigns appear to visitors. Takes effect immediately.</span>
              </span>
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                checked={campaign.featureOnWebsite}
                onChange={(e) => updateCampaign(campaign.id, { featureOnWebsite: e.target.checked })}
              />
            </label>
            {campaign.pendingChanges ? (
              <div className="flex items-center justify-between gap-4 p-4">
                <span>
                  <span className="block text-sm font-semibold">Discard unpublished changes</span>
                  <span className="block text-xs text-[var(--color-text-muted)]">Go back to the version supporters see now.</span>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!window.confirm("Discard all unpublished changes to this campaign?")) return;
                    updateCampaign(campaign.id, { pendingChanges: undefined });
                    showToast("Unpublished changes discarded.", "info");
                  }}
                >
                  Discard
                </Button>
              </div>
            ) : null}
              <div className="flex items-center justify-between gap-4 p-4">
                <span>
                  <span className="block text-sm font-semibold">{campaign.archived ? "Unarchive campaign" : "Archive campaign"}</span>
                  <span className="block text-xs text-[var(--color-text-muted)]">
                    {campaign.archived ? "Make it available again." : "Hides it from supporters and your website. You can undo this."}
                  </span>
                </span>
                <Button
                  variant={campaign.archived ? "secondary" : "danger"}
                  size="sm"
                  onClick={() => {
                    updateCampaign(campaign.id, { archived: !campaign.archived });
                    showToast(campaign.archived ? "Campaign restored." : "Campaign archived — hidden from supporters and the website.", "info");
                  }}
                >
                  {campaign.archived ? "Unarchive" : "Archive"}
                </Button>
              </div>
          </div>
        </section>
    </div>
  );
}
