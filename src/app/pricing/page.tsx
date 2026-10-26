import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { WaitlistButton } from "@/components/marketing/WaitlistButton";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPlanPrice, PLANS } from "@/config/plans";

export const metadata: Metadata = {
  title: "Pricing — Corise",
  description: "Start free. Paid plans are coming later.",
};

export default function PricingPage() {
  return (
    <div className="surface-dark min-h-screen">
      <MarketingNav tone="dark" />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-12 md:pt-16">
        <div className="text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--color-emerald)]">Pricing</p>
          <h1 className="mt-3 text-[34px] font-semibold leading-tight text-white md:text-[44px]">Start free. Grow when you need to.</h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-[var(--color-navy-muted)]">
            Create your website and campaign on the Free plan today. Pro and Organization pricing isn&apos;t finalized yet —
            join the waitlist to show interest.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <section
              key={plan.id}
              aria-labelledby={`plan-${plan.id}`}
              className={`corise-card-dark flex flex-col p-6 ${plan.recommended ? "ring-1 ring-[var(--color-emerald)]/60" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 id={`plan-${plan.id}`} className="text-xl font-semibold text-white">
                  {plan.name}
                </h2>
                {plan.recommended ? (
                  <span className="rounded-full bg-[var(--color-emerald)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-emerald)]">
                    Available now
                  </span>
                ) : (
                  <span className="rounded-full border border-[var(--color-navy-border)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-navy-muted)]">
                    Coming later
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[var(--color-navy-muted)]">{plan.summary}</p>
              <p className="mt-5 text-[26px] font-semibold text-white">
                {plan.price ? formatPlanPrice(plan) : <span className="text-lg text-[var(--color-navy-text)]">Pricing not yet finalized</span>}
              </p>

              {plan.limits.length ? (
                <ul className="mt-3 space-y-1 text-xs text-[var(--color-navy-muted)]">
                  {plan.limits.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              ) : null}

              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    <Icon
                      name={f.available ? "check" : "clock"}
                      size={15}
                      className={`mt-0.5 shrink-0 ${f.available ? "text-[var(--color-emerald)]" : "text-[var(--color-navy-muted)]"}`}
                    />
                    <span className={f.available ? "text-[var(--color-navy-text)]" : "text-[var(--color-navy-muted)]"}>
                      {f.label}
                      {f.available ? null : <span className="ml-1 text-xs">(planned)</span>}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {plan.open ? (
                  <ButtonLink href="/#start" variant="brand" className="w-full">
                    Get started free
                  </ButtonLink>
                ) : (
                  <WaitlistButton planId={plan.id} planName={plan.name} />
                )}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-[var(--color-navy-muted)]">
          No payment details are collected and there is no checkout. Plan contents may change before launch.
        </p>
      </main>
    </div>
  );
}
