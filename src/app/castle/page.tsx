"use client";

import { CastleView } from "@/components/castle/CastleView";
import { ToastHost } from "@/components/ui/Toast";
import { useCorise } from "@/context/CoriseContext";
import { campaignProgress } from "@/lib/progress";
import { CASTLE_SLUG } from "@/lib/storage";

/** The castle game itself. Stays on /castle instead of sending the browser to the campaign page. */
export default function CastlePage() {
  const { hydrated, state, recordPledge } = useCorise();
  const campaign = state.campaigns.find((c) => c.slug === CASTLE_SLUG);
  const goal = campaign ? campaignProgress(campaign) : null;

  if (!hydrated) {
    return <p className="py-20 text-center text-sm text-[var(--color-text-muted)]">Opening the castle workshop…</p>;
  }

  return (
    <>
      <CastleView
        title={campaign?.title ?? "Castle Workshop"}
        organizationName={campaign?.organizationName ?? state.organization.name}
        description={campaign?.description}
        current={goal?.current ?? 0}
        target={goal?.target ?? 1000}
        prices={campaign?.castlePrices}
        onPledge={(amount) => {
          if (campaign) recordPledge(campaign.id, amount);
        }}
      />
      <ToastHost />
    </>
  );
}
