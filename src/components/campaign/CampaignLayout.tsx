import type { ReactNode } from "react";
import { HeroVisual } from "@/components/campaign/HeroVisual";
import { themeStyle } from "@/components/website/OrgWebsiteRenderer";
import type { Campaign } from "@/types/corise";
import { CAMPAIGN_TYPE_META } from "@/types/corise";

export function campaignHasActivities(c: Campaign): boolean {
  return c.quiz.enabled || c.challenge.enabled || c.poll.enabled;
}

/** Above-the-fold, two-column composition for the public campaign page — fits a standard laptop screen without scrolling. */
type HeroFold = {
  tag: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Rendered directly above the hero image, e.g. a personalized-share endorsement banner. */
  banner?: ReactNode;
  whyItMatters?: ReactNode;
  /** Right of the hero: the cartoon graphic only, so the photo can match its height. */
  widget?: ReactNode;
  /** Compact progress row, shown under the graphic (or beside the story when there is no graphic). */
  stats?: ReactNode;
  /** Pledge/CTA form, full width along the bottom. */
  actionBox: ReactNode;
};

/** Shared supporter-facing campaign page used by both the draft preview and the public route. */
export function CampaignLayout({
  campaign,
  primary,
  headerAction,
  beforeDetails,
  activities,
  afterActivities,
  footer,
  embedded = false,
  heroFold,
}: {
  campaign: Campaign;
  primary: ReactNode;
  headerAction?: ReactNode;
  beforeDetails?: ReactNode;
  activities?: ReactNode;
  afterActivities?: ReactNode;
  footer?: ReactNode;
  /** Rendered inside a manager page, which already provides the page's main landmark. */
  embedded?: boolean;
  /** Opt in to the fixed-viewport two-column layout used by the public campaign page. */
  heroFold?: HeroFold;
}) {
  const Main = embedded ? "div" : "main";
  const showMilestones = campaign.milestones.length > 0 && campaign.type !== "awareness";

  const header = (
    <header className="shrink-0 border-b border-black/5 bg-[#fbfaf6]/95">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[11px] font-bold text-white"
          >
            {(campaign.organizationName || "O").slice(0, 2).toUpperCase()}
          </div>
          <p className="truncate text-[15px] font-semibold">{campaign.organizationName}</p>
        </div>
        {headerAction}
      </div>
    </header>
  );

  if (heroFold) {
    const extras = showMilestones || activities || afterActivities;
    return (
      <div
        className="@container flex min-h-screen flex-col bg-[#fbfaf6] text-[var(--color-text)]"
        style={themeStyle(campaign.theme)}
      >
        {header}

        <Main className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4">
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12 lg:gap-6">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">{heroFold.tag}</p>
                <h1 className="mt-1 text-2xl font-bold leading-tight lg:text-3xl">{heroFold.title}</h1>
                {heroFold.subtitle ? (
                  <p className="mt-1.5 line-clamp-1 text-sm text-[var(--color-text-muted)] lg:text-base">{heroFold.subtitle}</p>
                ) : null}
                {heroFold.banner ? <div className="mt-3">{heroFold.banner}</div> : null}
              </div>

              <div className="lg:col-span-7 lg:h-full">
                <HeroVisual
                  imageKey={campaign.heroImage}
                  priority
                  sizes="(min-width: 1024px) 640px, 100vw"
                  aspect={heroFold.widget ? "h-[220px] w-full lg:h-full" : "aspect-[16/9] max-h-[300px]"}
                  className={heroFold.widget ? "lg:h-full" : ""}
                />
              </div>
              {heroFold.widget ? <div className="lg:col-span-5">{heroFold.widget}</div> : null}

              {heroFold.whyItMatters ? (
                <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm lg:col-span-7">
                  <h2 className="text-[15px] font-semibold">Why this matters</h2>
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{heroFold.whyItMatters}</p>
                </div>
              ) : null}
              {heroFold.stats ? <div className="lg:col-span-5">{heroFold.stats}</div> : null}
            </div>

            {extras ? (
              <div className="space-y-4">
                {showMilestones ? (
                  <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                    <h2 className="text-[15px] font-semibold">How we get there</h2>
                    <ol className="mt-2.5 space-y-2">
                      {campaign.milestones.map((m, i) => (
                        <li key={m} className="flex items-start gap-2.5 text-sm">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[11px] font-semibold text-[var(--color-primary)]">
                            {i + 1}
                          </span>
                          <span className="pt-0.5 text-[var(--color-text-muted)]">{m}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
                {activities}
                {afterActivities}
              </div>
            ) : null}

            <div className="lg:mt-auto">{heroFold.actionBox}</div>
          </div>
        </Main>

        {footer ? <div className="shrink-0">{footer}</div> : null}
      </div>
    );
  }

  return (
    <div className="@container min-h-full bg-[#fbfaf6] text-[var(--color-text)]" style={themeStyle(campaign.theme)}>
      {header}

      <Main className="mx-auto max-w-3xl px-4 pb-28 pt-6 @3xl:pb-16 @3xl:pt-10">
        <HeroVisual imageKey={campaign.heroImage} priority sizes="(min-width: 768px) 720px, 100vw" />

        <section className="mt-6 @3xl:mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
            {CAMPAIGN_TYPE_META[campaign.type]?.label ?? "Campaign"}
          </p>
          <h1 className="mt-2 text-[28px] font-semibold leading-[1.15] @3xl:text-[36px]">
            {campaign.headline || campaign.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[var(--color-text-muted)]">{campaign.description}</p>
          <div className="mt-5">{primary}</div>
        </section>

        {beforeDetails ? <div className="mt-8">{beforeDetails}</div> : null}

        <section className="mt-10 grid gap-4 @2xl:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="text-[17px] font-semibold">Why this matters</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-text-muted)]">{campaign.whyItMatters}</p>
            {campaign.beneficiaries ? (
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-text)]">Who benefits:</span> {campaign.beneficiaries}
              </p>
            ) : null}
          </div>
          {showMilestones ? (
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <h2 className="text-[17px] font-semibold">How we get there</h2>
              <ol className="mt-3 space-y-2.5">
                {campaign.milestones.map((m, i) => (
                  <li key={m} className="flex items-start gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-xs font-semibold text-[var(--color-primary)]">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-[var(--color-text-muted)]">{m}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </section>

        {activities ? <section className="mt-10 space-y-4">{activities}</section> : null}
        {afterActivities ? <div className="mt-8 space-y-4">{afterActivities}</div> : null}
      </Main>

      {footer}
    </div>
  );
}
