"use client";

import { useState } from "react";
import { HeroVisual } from "@/components/campaign/HeroVisual";
import { CampaignFigures } from "@/components/supporter/CampaignFigures";
import { EditNoteDialog } from "@/components/supporter/EditNoteDialog";
import { LeaderboardDialog } from "@/components/supporter/LeaderboardDialog";
import { ShareLinkDialog } from "@/components/supporter/ShareLinkDialog";
import { SupporterHeader } from "@/components/supporter/SupporterShell";
import { useSupporterNetwork, type SupporterOrg } from "@/components/supporter/supporter-data";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useCorise } from "@/context/CoriseContext";
import { supporterViewPath } from "@/lib/paths";
import { formatUsd, isCampaignClosed } from "@/lib/progress";
import { campaignLeaderboard } from "@/lib/supporter-network";
import type { DemoSupporter } from "@/lib/supporters";

type Dialog = { kind: "share" | "edit" | "leaderboard"; campaignId: string } | null;

function IconAction({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

export function MyCampaignsView({ org, supporter }: { org: SupporterOrg; supporter: DemoSupporter }) {
  const network = useSupporterNetwork();
  const { showToast } = useCorise();
  const [dialog, setDialog] = useState<Dialog>(null);

  const mine = network.memberships
    .filter((m) => m.orgSlug === org.orgSlug && m.supporterId === supporter.id)
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
  const joined = mine.flatMap((membership) => {
    const campaign = org.campaigns.find((c) => c.id === membership.campaignId);
    return campaign ? [{ membership, campaign }] : [];
  });
  const hidden = mine.length - joined.length;
  const open = dialog ? joined.find((j) => j.campaign.id === dialog.campaignId) : undefined;
  const close = () => setDialog(null);

  return (
    <div className="space-y-6">
      <SupporterHeader
        eyebrow="Supporter view"
        title="My campaigns"
        body="Campaigns you've joined. Share your personal link, edit the note people see, and check the leaderboard."
        action={
          <ButtonLink href={supporterViewPath("campaigns", org.orgSlug)} variant="accent">
            <Icon name="plus" />
            Join more
          </ButtonLink>
        }
      />

      {joined.length === 0 ? (
        <EmptyState
          icon="megaphone"
          title="You haven't joined a campaign yet"
          body={`Browse ${org.orgName}'s campaigns and join one to get your own share link. Joining is free and takes no payment.`}
          action={<ButtonLink href={supporterViewPath("campaigns", org.orgSlug)}>Explore campaigns</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {joined.map(({ membership, campaign }) => {
            const board = campaignLeaderboard(network, org.orgSlug, campaign.id);
            const me = board.find((row) => row.supporterId === supporter.id);
            const closed = isCampaignClosed(campaign);
            return (
              <li key={membership.id} className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
                <HeroVisual imageKey={campaign.heroImage} aspect="aspect-[16/9]" className="rounded-none" />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={closed ? "neutral" : "success"}>{closed ? "Closed" : "Live"}</Badge>
                    {membership.source === "invitation" ? <Badge tone="info">Invited</Badge> : null}
                  </div>
                  <div>
                    <h2 className="text-[17px] font-semibold leading-snug">{campaign.title}</h2>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{campaign.organizationName || org.orgName}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--color-bg)] px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Your note</p>
                    {membership.personalNote ? (
                      <p className="mt-0.5 line-clamp-2 break-words text-sm italic">&ldquo;{membership.personalNote}&rdquo;</p>
                    ) : (
                      <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">No note yet — your link uses the default message.</p>
                    )}
                  </div>
                  <div className="mt-auto space-y-3">
                    <CampaignFigures campaign={campaign} />
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Through your link: <span className="font-semibold text-[var(--color-text)]">{formatUsd(me?.amount ?? 0)}</span>
                      {me && me.conversions > 0 ? ` · Rank #${me.rank}` : ""}
                    </p>
                    <div className="flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
                      <IconAction icon="share" label={`Share ${campaign.title}`} onClick={() => setDialog({ kind: "share", campaignId: campaign.id })} />
                      <IconAction icon="edit" label={`Edit your note for ${campaign.title}`} onClick={() => setDialog({ kind: "edit", campaignId: campaign.id })} />
                      <IconAction
                        icon="trophy"
                        label={`Leaderboard for ${campaign.title}`}
                        onClick={() => setDialog({ kind: "leaderboard", campaignId: campaign.id })}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hidden > 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          {hidden} joined {hidden === 1 ? "campaign is" : "campaigns are"} no longer public, so {hidden === 1 ? "it's" : "they're"} hidden here.
        </p>
      ) : null}

      {open && dialog?.kind === "share" ? (
        <ShareLinkDialog
          campaign={open.campaign}
          orgSlug={org.orgSlug}
          supporter={supporter}
          membership={open.membership}
          onClose={close}
          onEditNote={() => setDialog({ kind: "edit", campaignId: open.campaign.id })}
        />
      ) : null}
      {open && dialog?.kind === "edit" ? (
        <EditNoteDialog
          campaign={open.campaign}
          supporter={supporter}
          membership={open.membership}
          onClose={close}
          onSaved={(cleared) => {
            close();
            showToast(cleared ? "Note cleared — your link uses the default message." : "Note saved. It shows on your shared link.", "success");
          }}
        />
      ) : null}
      {open && dialog?.kind === "leaderboard" ? (
        <LeaderboardDialog campaign={open.campaign} orgSlug={org.orgSlug} supporter={supporter} onClose={close} />
      ) : null}
    </div>
  );
}
