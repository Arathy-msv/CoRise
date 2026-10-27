"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { HeroVisual } from "@/components/campaign/HeroVisual";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyLinkButton } from "@/components/ui/CopyLinkButton";
import { Field, TextArea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { campaignDraftView } from "@/lib/impact-space/publish";
import { shareCampaignPath } from "@/lib/paths";
import { campaignProgress, formatGoalValue, formatUsd, isCampaignClosed, progressPercent } from "@/lib/progress";
import { absoluteUrl } from "@/lib/public-asset";
import { loadSupporterJoins, sampleRaisedAmount, saveSupporterJoin, type SupporterJoin } from "@/lib/supporter-joins";
import type { Campaign } from "@/types/corise";

const SAMPLE_PEOPLE = [
  { name: "Rahul S.", amount: 200 },
  { name: "Maya K.", amount: 90 },
];

type DialogState =
  | { kind: "join"; campaign: Campaign }
  | { kind: "edit"; campaign: Campaign; join: SupporterJoin }
  | { kind: "link"; campaign: Campaign; join: SupporterJoin };

function boardFor(raised: number): { name: string; amount: number; you?: boolean }[] {
  return [{ name: "You", amount: raised, you: true }, ...SAMPLE_PEOPLE].sort((a, b) => b.amount - a.amount);
}

function CampaignLink({ path }: { path: string }) {
  const url = absoluteUrl(path);
  return (
    <div className="space-y-2">
      <p className="text-[13px] font-semibold">Campaign link</p>
      <input readOnly value={url} aria-label="Campaign link" className="corise-input w-full" onFocus={(event) => event.currentTarget.select()} />
      <CopyLinkButton path={path} label="Copy link" />
    </div>
  );
}

function JoinModal({
  dialog,
  orgSlug,
  onClose,
  onSave,
}: {
  dialog: DialogState;
  orgSlug: string;
  onClose: () => void;
  onSave: (campaign: Campaign, note: string, existing: SupporterJoin | null) => void;
}) {
  const noteId = useId();
  const existing = dialog.kind === "join" ? null : dialog.join;
  const [note, setNote] = useState(existing?.note ?? "");
  const view = campaignDraftView(dialog.campaign);
  const path = shareCampaignPath(dialog.campaign.slug, orgSlug);

  return (
    <Modal
      title={dialog.kind === "edit" ? "Edit your note" : dialog.kind === "link" ? "You joined this campaign" : `Join ${view.title}`}
      description={
        dialog.kind === "link"
          ? "Copy the link to share this campaign. Nothing was emailed."
          : "Add a short note for yourself. You will get a link to share. Nothing is emailed."
      }
      onClose={onClose}
      wide
    >
      {dialog.kind === "link" ? (
        <div className="space-y-4">
          {dialog.join.note ? <p className="text-sm text-[var(--color-text)]">{dialog.join.note}</p> : <p className="text-sm text-[var(--color-text-muted)]">No note yet. You can add one later.</p>}
          <CampaignLink path={path} />
          <Button className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(dialog.campaign, note.trim().slice(0, 400), existing);
          }}
        >
          <Field label="Your note" hint="Optional. Example: I’ll share this with my class.">
            <TextArea id={noteId} value={note} maxLength={400} autoFocus placeholder="e.g. I’ll share this with my class" onChange={(event) => setNote(event.target.value)} />
          </Field>
          {dialog.kind === "edit" ? <CampaignLink path={path} /> : null}
          <Button type="submit" className="w-full">
            {dialog.kind === "edit" ? "Save note" : "Join campaign"}
          </Button>
        </form>
      )}
    </Modal>
  );
}

function CampaignCard({
  campaign,
  join,
  onJoin,
  onEdit,
}: {
  campaign: Campaign;
  join: SupporterJoin | undefined;
  onJoin: () => void;
  onEdit: () => void;
}) {
  const view = campaignDraftView(campaign);
  const live = campaign.status === "published";
  const goal = campaignProgress(campaign);
  const board = join ? boardFor(join.raised) : [];

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-sm)]">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <HeroVisual imageKey={view.heroImage} title={view.title} aspect="aspect-[4/3]" className="w-full shrink-0 rounded-xl sm:w-28" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isCampaignClosed(campaign) ? <Badge>Closed</Badge> : live ? <Badge tone="success">Live</Badge> : <Badge>Draft</Badge>}
            {join ? <Badge tone="primary">Joined</Badge> : null}
            {goal ? (
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                {Math.floor(progressPercent(goal.current, goal.target))}% of {formatGoalValue(goal.goalType, goal.target)}
              </span>
            ) : null}
          </div>
          <h2 className="mt-1.5 text-xl font-semibold leading-tight">{view.title}</h2>
          {view.description ? <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-muted)]">{view.description}</p> : null}
        </div>
      </div>

      {join ? (
        <div className="space-y-4 border-t border-[var(--color-border)] px-6 py-5">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-muted)]">Amount you raised</p>
            <p className="mt-1 text-4xl font-semibold leading-none tracking-[-0.03em]">{formatUsd(join.raised)}</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Sample amount in this browser. No money is collected.</p>
          </div>
          {join.note ? <p className="text-sm">{join.note}</p> : <p className="text-sm text-[var(--color-text-muted)]">No note yet.</p>}
          <ol className="space-y-2" aria-label={`Leaderboard for ${view.title}`}>
            {board.map((row, index) => (
              <li key={row.name} className={`flex items-center justify-between gap-3 text-sm ${row.you ? "font-semibold text-[var(--color-primary)]" : ""}`}>
                <span>
                  #{index + 1} {row.name}
                </span>
                <span>{formatUsd(row.amount)}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-[var(--color-text-muted)]">Sample names beside you. No money is collected.</p>
        </div>
      ) : null}

      <div className="border-t border-[var(--color-border)] p-4">
        {join ? (
          <Button variant="secondary" className="w-full" onClick={onEdit}>
            <Icon name="edit" />
            Edit note
          </Button>
        ) : (
          <Button className="w-full" onClick={onJoin}>
            Join campaign
          </Button>
        )}
      </div>
    </article>
  );
}

export function SupporterDashboard({
  orgName,
  orgSlug,
  campaigns,
  backHref,
  backLabel,
}: {
  orgName: string;
  orgSlug: string;
  campaigns: Campaign[];
  backHref: string;
  backLabel: string;
}) {
  const [joins, setJoins] = useState<SupporterJoin[] | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setJoins(loadSupporterJoins(orgSlug));
  }, [orgSlug]);

  const save = (campaign: Campaign, note: string, existing: SupporterJoin | null) => {
    const join: SupporterJoin = {
      campaignId: campaign.id,
      note,
      raised: existing?.raised ?? sampleRaisedAmount(campaign.id),
      joinedAt: existing?.joinedAt ?? new Date().toISOString(),
    };
    const result = saveSupporterJoin(orgSlug, join);
    setJoins(result.joins);
    setNotice(result.saved ? "" : "Your note is showing now, but it may disappear if you refresh.");
    setDialog(existing ? null : { kind: "link", campaign, join });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        <Link href={backHref} className="inline-flex text-sm font-semibold text-[var(--color-primary)] hover:underline">
          {backLabel}
        </Link>

        <section aria-label="Organization" className="rounded-2xl bg-[var(--color-navy)] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-navy-muted)]">Supporter view</p>
          <h1 className="mt-1 text-2xl font-semibold">{orgName}</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-navy-muted)]">
            Every campaign for this organization. Join one to add a note and get a link.
          </p>
        </section>

        {notice ? (
          <p role="status" className="rounded-2xl border border-[var(--color-border)] bg-white p-4 text-sm">
            {notice}
          </p>
        ) : null}

        {joins === null ? (
          <p className="py-16 text-center text-sm text-[var(--color-text-muted)]">Loading campaigns…</p>
        ) : campaigns.length === 0 ? (
          <div className="py-8 text-center">
            <h2 className="text-[28px] font-semibold">No campaigns yet</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--color-text-muted)]">
              When this organization adds a campaign, it will show up here.
            </p>
          </div>
        ) : (
          <section aria-labelledby="supporter-campaigns" className="space-y-4">
            <h2 id="supporter-campaigns" className="text-lg font-semibold">
              All campaigns
            </h2>
            <ul className="space-y-4">
              {campaigns.map((campaign) => (
                <li key={campaign.id}>
                  <CampaignCard
                    campaign={campaign}
                    join={joins.find((item) => item.campaignId === campaign.id)}
                    onJoin={() => setDialog({ kind: "join", campaign })}
                    onEdit={() => {
                      const join = joins.find((item) => item.campaignId === campaign.id);
                      if (join) setDialog({ kind: "edit", campaign, join });
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {dialog ? (
        <JoinModal
          key={`${dialog.kind}-${dialog.campaign.id}`}
          dialog={dialog}
          orgSlug={orgSlug}
          onClose={() => setDialog(null)}
          onSave={save}
        />
      ) : null}
    </div>
  );
}
