"use client";

import Link from "next/link";

export type SupporterStanding = { name: string; amount: number };

export type SupportedCampaign = {
  id: string;
  title: string;
  raised: number;
  board: SupporterStanding[];
};

const SUPPORTER = "Jan M.";

function money(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

function boardFor(raised: number, others: SupporterStanding[]): SupporterStanding[] {
  return [{ name: SUPPORTER, amount: raised }, ...others].sort((a, b) => b.amount - a.amount);
}

/** Demo amounts. Real sign-in is not involved. */
export function demoSupportedCampaigns(titles: string[]): SupportedCampaign[] {
  const samples = [
    { title: "Plan a community garden for our block", raised: 250, others: [{ name: "Rahul S.", amount: 200 }, { name: "Maya K.", amount: 120 }] },
    { title: "Cozy Paws Sanctuary", raised: 180, others: [{ name: "Asha K.", amount: 210 }, { name: "Leo P.", amount: 90 }] },
    { title: "Grand Prix Racer", raised: 90, others: [{ name: "Noah T.", amount: 140 }, { name: "Priya D.", amount: 110 }] },
  ];
  const chosen = titles.length > 0 ? titles : samples.map((sample) => sample.title);
  return chosen.slice(0, 4).map((title, index) => {
    const sample = samples[index % samples.length];
    return {
      id: `${index}-${title}`,
      title,
      raised: sample.raised,
      board: boardFor(sample.raised, sample.others),
    };
  });
}

export function SupporterDashboard({
  orgName,
  campaigns,
  backHref,
  backLabel,
}: {
  orgName: string;
  campaigns: SupportedCampaign[];
  backHref: string;
  backLabel: string;
}) {
  const total = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8F5]">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col px-5 py-5 sm:px-8">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-900">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#183B2E] text-xs font-bold text-white" aria-hidden>
              C
            </span>
            <span>Corise</span>
            <span className="text-gray-300" aria-hidden>
              |
            </span>
            <span className="truncate font-medium text-gray-700">{orgName}</span>
          </div>
          <Link href={backHref} className="shrink-0 text-xs font-semibold text-[#183B2E] underline">
            {backLabel}
          </Link>
        </header>

        <div className="mt-4 shrink-0">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Demo supporter</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Jan&apos;s campaigns</h1>
          <p className="mt-1 text-xs text-gray-500">A demo view. No supporter password is checked.</p>
        </div>

        <section className="mt-4 shrink-0 rounded-2xl border border-gray-200/80 bg-white px-5 py-4 shadow-xs">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Total raised by Jan</p>
          <p className="mt-1 text-3xl font-bold text-[#183B2E]">{money(total)}</p>
          <p className="mt-1 text-xs text-gray-500">
            Across {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"}
          </p>
        </section>

        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-2xl border border-gray-200/80 bg-white px-5 py-3 shadow-xs">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="min-w-0 truncate text-sm font-bold text-gray-900">{campaign.title}</h2>
                <p className="shrink-0 text-sm font-semibold text-gray-800">Jan raised {money(campaign.raised)}</p>
              </div>
              <ol className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-700">
                {campaign.board.map((row, index) => (
                  <li key={row.name} className={row.name === SUPPORTER ? "font-semibold text-[#183B2E]" : ""}>
                    #{index + 1} {row.name} ({money(row.amount)})
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
