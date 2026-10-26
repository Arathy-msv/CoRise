"use client";

import { useMemo } from "react";
import { EngagementChart } from "@/components/dashboard/EngagementChart";
import { useCorise } from "@/context/CoriseContext";
import { formatInr, formatNumber, percent } from "@/lib/format";

export default function AnalyticsPage() {
  const { state } = useCorise();

  const totals = useMemo(() => {
    return state.campaigns.reduce(
      (acc, c) => ({
        interactions: acc.interactions + c.metrics.interactions,
        funds: acc.funds + c.metrics.fundsRaised,
        completions: acc.completions + c.metrics.completions,
        supporters: acc.supporters + c.metrics.supporters,
      }),
      { interactions: 0, funds: 0, completions: 0, supporters: 0 }
    );
  }, [state.campaigns]);

  const chart = state.campaigns.slice(0, 5).map((c) => ({
    label: c.title.split(" ").slice(0, 2).join(" "),
    value: c.metrics.interactions,
  }));

  return (
    <div className="animate-fade-up corise-page">
      <div>
        <p className="text-xs font-semibold text-[var(--color-primary)]">
          Settings & more · Optional
        </p>
        <h1 className="corise-page-title font-display text-[28px] font-semibold">
          Numbers & reports
        </h1>
        <p className="-mt-2 text-sm text-[var(--color-text-muted)]">
          Illustrative sample figures. You do not need this to create a website or
          campaign.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Interactions", value: formatNumber(totals.interactions) },
          { label: "Supporters", value: formatNumber(totals.supporters) },
          { label: "Activity completions", value: formatNumber(totals.completions) },
          { label: "Funds raised", value: formatInr(totals.funds) },
        ].map((m) => (
          <div key={m.label} className="corise-card p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {m.label}
            </p>
            <p className="mt-1.5 font-display text-xl font-semibold">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="corise-card p-4">
          <h2 className="mb-3 font-display text-lg font-semibold">Interactions by campaign</h2>
          <EngagementChart points={chart} />
        </section>

        <section className="corise-card p-4">
          <h2 className="font-display text-lg font-semibold">Campaign table</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                <tr>
                  <th className="pb-2 font-semibold">Campaign</th>
                  <th className="pb-2 font-semibold">Engagement</th>
                  <th className="pb-2 font-semibold">Funds</th>
                  <th className="pb-2 font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody>
                {state.campaigns.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--color-border)]">
                    <td className="py-2.5 font-medium">{c.title}</td>
                    <td className="py-2.5">{formatNumber(c.metrics.interactions)}</td>
                    <td className="py-2.5">{formatInr(c.metrics.fundsRaised)}</td>
                    <td className="py-2.5">{percent(c.metrics.engagementRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
