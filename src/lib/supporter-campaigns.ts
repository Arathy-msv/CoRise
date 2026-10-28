import { formatInr } from "@/lib/format";
import { campaignProgress, formatGoalValue, progressPercent } from "@/lib/progress";
import type { Campaign, OrgWebsite } from "@/types/corise";

/** The public campaign page only opens published, unarchived campaigns of a published website. */
export function supporterVisibleCampaigns(campaigns: Campaign[], website: OrgWebsite | null | undefined): Campaign[] {
  if (website?.status !== "published") return [];
  return campaigns.filter((c) => c.status === "published" && !c.archived);
}

export type CampaignFundraising = {
  raisedLabel: string;
  goalLabel: string;
  /** 0–100, safe when the goal is missing or zero. */
  percent: number;
};

/** Same figures the public campaign page shows: goal progress first, then the older fundraising target. */
export function campaignFundraising(c: Campaign): CampaignFundraising | null {
  const goal = campaignProgress(c);
  if (goal) {
    return {
      raisedLabel: formatGoalValue(goal.goalType, goal.current),
      goalLabel: formatGoalValue(goal.goalType, goal.target),
      percent: progressPercent(goal.current, goal.target),
    };
  }
  if (c.fundraisingTarget && c.fundraisingTarget > 0) {
    return {
      raisedLabel: formatInr(c.metrics.fundsRaised),
      goalLabel: formatInr(c.fundraisingTarget),
      percent: progressPercent(c.metrics.fundsRaised, c.fundraisingTarget),
    };
  }
  return null;
}
