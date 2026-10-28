import { campaignFundraising } from "@/lib/supporter-campaigns";
import type { Campaign } from "@/types/corise";

/** Raised, goal, and a capped progress bar. Campaigns without a goal say so instead of showing 0%. */
export function CampaignFigures({ campaign }: { campaign: Campaign }) {
  const figures = campaignFundraising(campaign);
  if (!figures) {
    return <p className="text-xs text-[var(--color-text-muted)]">No fundraising goal for this campaign.</p>;
  }
  const rounded = Math.floor(figures.percent);
  return (
    <div>
      <div className="flex items-end justify-between gap-3 text-xs">
        <div>
          <p className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Raised</p>
          <p className="mt-0.5 text-sm font-semibold">{figures.raisedLabel}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Goal</p>
          <p className="mt-0.5 text-sm font-semibold">{figures.goalLabel}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-black/5"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rounded}
          aria-label="Progress toward goal"
        >
          <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${figures.percent}%` }} />
        </div>
        <span className="w-10 shrink-0 text-right text-xs font-semibold">{rounded}%</span>
      </div>
    </div>
  );
}
