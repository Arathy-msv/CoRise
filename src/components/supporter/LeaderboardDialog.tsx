"use client";

import { useSupporterNetwork } from "@/components/supporter/supporter-data";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { formatUsd } from "@/lib/progress";
import { campaignLeaderboard, type LeaderboardRow } from "@/lib/supporter-network";
import { supporterInitials, type DemoSupporter } from "@/lib/supporters";
import type { Campaign } from "@/types/corise";

const PODIUM = [
  "bg-amber-100 text-amber-900 ring-amber-300",
  "bg-slate-100 text-slate-800 ring-slate-300",
  "bg-orange-100 text-orange-900 ring-orange-300",
];

function conversionsLabel(row: LeaderboardRow): string {
  return `${row.conversions} ${row.conversions === 1 ? "supporter" : "supporters"} brought in`;
}

export function LeaderboardDialog({
  campaign,
  orgSlug,
  supporter,
  onClose,
}: {
  campaign: Campaign;
  orgSlug: string;
  supporter: DemoSupporter;
  onClose: () => void;
}) {
  const network = useSupporterNetwork();
  const rows = campaignLeaderboard(network, orgSlug, campaign.id);
  const active = rows.filter((row) => row.conversions > 0);
  const top = active[0]?.amount ?? 0;
  const mine = rows.find((row) => row.supporterId === supporter.id);

  return (
    <Modal
      title="Community champions"
      description={`Supporters of ${campaign.title}, ranked by pledges and sign-ups that came through their personal link.`}
      onClose={onClose}
      wide
    >
      <div className="space-y-4">
        {mine ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-primary-soft)] px-4 py-3 text-[var(--color-primary)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">Your position</p>
              <p className="text-lg font-semibold">
                {mine.conversions > 0 ? `#${mine.rank} of ${rows.length}` : "Not ranked yet"}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{formatUsd(mine.amount)}</p>
              <p className="text-xs">{conversionsLabel(mine)}</p>
            </div>
          </div>
        ) : null}

        {active.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-[var(--color-border-strong)] px-6 py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <Icon name="trophy" size={20} />
            </span>
            <p className="mt-3 font-semibold">No activity yet</p>
            <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">
              {rows.length} {rows.length === 1 ? "supporter has" : "supporters have"} joined. The board fills in when someone pledges or
              signs up through a supporter&apos;s link.
            </p>
          </div>
        ) : (
          <ol className="space-y-2" aria-label="Leaderboard">
            {active.map((row) => {
              const podium = row.rank <= 3 ? PODIUM[row.rank - 1] : "";
              const isMe = row.supporterId === supporter.id;
              const width = top > 0 ? (row.amount / top) * 100 : 0;
              return (
                <li
                  key={row.supporterId}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    isMe ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]/40" : "border-[var(--color-border)]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      podium ? `ring-2 ${podium}` : "bg-[var(--color-bg)] text-[var(--color-text-muted)]"
                    }`}
                    aria-label={`Rank ${row.rank}`}
                  >
                    {row.rank}
                  </span>
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy-elevated)] text-[11px] font-bold text-white"
                  >
                    {supporterInitials(row.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {row.name}
                        {isMe ? <span className="ml-1.5 text-xs font-medium text-[var(--color-primary)]">(you)</span> : null}
                      </p>
                      <p className="shrink-0 text-sm font-semibold">{formatUsd(row.amount)}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5" aria-hidden>
                        <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${width}%` }} />
                      </div>
                      <span className="shrink-0 text-[11px] text-[var(--color-text-muted)]">{conversionsLabel(row)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <p className="text-xs text-[var(--color-text-muted)]">
          Only this campaign&apos;s supporters are listed, by display name. Pledges are recorded in this browser — no payment is taken.
        </p>
      </div>
    </Modal>
  );
}
