"use client";

import { ButtonLink } from "@/components/ui/Button";
import { useCorise } from "@/context/CoriseContext";
import { formatInr } from "@/lib/format";
import { publicCampaignPath } from "@/lib/paths";

export default function SponsorsPage() {
  const { state } = useCorise();
  const sponsored = state.campaigns.filter((c) => c.sponsor.enabled);

  return (
    <div className="animate-fade-up corise-page">
      <div>
        <p className="text-xs font-semibold text-[var(--color-primary)]">Sponsors & Rewards</p>
        <h1 className="corise-page-title font-display text-[28px] font-semibold">
          Local partners and milestones
        </h1>
        <p className="-mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
          Show how businesses can pledge per action and offer vouchers—without claiming payouts
          already happened.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {sponsored.map((c) => (
          <article key={c.id} className="corise-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white">
                {c.sponsor.logoLabel}
              </div>
              <div>
                <h2 className="text-base font-semibold">{c.sponsor.name}</h2>
                <p className="text-xs text-[var(--color-text-muted)]">{c.title}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              Pledges {formatInr(c.sponsor.pledgeAmount)} for each{" "}
              {c.sponsor.qualifyingAction.toLowerCase()}, up to {formatInr(c.sponsor.maxCap)}.
            </p>
            <p className="mt-1.5 text-sm">{c.sponsor.rewardDescription}</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Voucher: {c.sponsor.voucherDescription}
            </p>
            <div className="mt-3 flex gap-2">
              <ButtonLink href={`/campaigns/${c.id}`} variant="secondary" size="sm">
                Campaign
              </ButtonLink>
              <ButtonLink
                href={publicCampaignPath(c.slug, state.organization.orgSlug)}
                variant="ghost"
                size="sm"
                target="_blank"
              >
                Preview as Supporter
              </ButtonLink>
            </div>
          </article>
        ))}
      </div>

      <section className="corise-card space-y-2.5 p-4">
        <h2 className="font-display text-lg font-semibold">How Corise can grow fundraising</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-[var(--color-text-muted)]">
          <li>Match sponsors to qualifying supporter actions</li>
          <li>Offer local rewards and vouchers that encourage participation</li>
          <li>Sell cause products through the Cause Marketplace</li>
          <li>Keep campaigns and engagement in one workspace</li>
        </ul>
        <ButtonLink href="/campaigns/create">Configure on a new campaign</ButtonLink>
      </section>
    </div>
  );
}
