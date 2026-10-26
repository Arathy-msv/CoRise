"use client";

import { Fragment, type CSSProperties, type ReactNode } from "react";
import { HeroVisual } from "@/components/campaign/HeroVisual";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Badge";
import {
  AddSectionDivider,
  ChangeImageButton,
  EditableSectionWrapper,
  EditableText,
  useWebsiteEdit,
} from "@/components/website/InlineEditing";
import type { Campaign, Organization, OrgWebsite, OrgWebsiteContent, WebsiteSection } from "@/types/corise";
import { THEME_COLORS } from "@/types/corise";
import { publicCampaignPath } from "@/lib/paths";
import { getFeaturedWebsiteCampaigns } from "@/lib/sample-data";
import { sectionBackground, sectionKey } from "@/lib/website-sections";

export function themeStyle(theme: keyof typeof THEME_COLORS): CSSProperties {
  const t = THEME_COLORS[theme] ?? THEME_COLORS.forest;
  return {
    ["--color-primary" as string]: t.primary,
    ["--color-primary-hover" as string]: t.primary,
    ["--color-accent" as string]: t.accent,
    ["--color-primary-soft" as string]: t.soft,
  } as CSSProperties;
}

type TextField = Exclude<
  { [K in keyof OrgWebsiteContent]-?: OrgWebsiteContent[K] extends string | undefined ? K : never }[keyof OrgWebsiteContent],
  "footerBackground"
>;

const STAT_FIELDS: [TextField, TextField][] = [
  ["impactStatOneValue", "impactStatOneLabel"],
  ["impactStatTwoValue", "impactStatTwoLabel"],
  ["impactStatThreeValue", "impactStatThreeLabel"],
];

const EYEBROW = "text-xs font-semibold uppercase tracking-[0.12em] text-[var(--site-eyebrow,var(--color-primary))]";

export function OrgWebsiteRenderer({
  website,
  organization,
  campaigns,
  mode = "desktop",
  frame = false,
  embedded = false,
  featuredOverride,
  onCampaignAction,
}: {
  website: OrgWebsite;
  organization: Organization;
  campaigns: Campaign[];
  mode?: "desktop" | "mobile";
  frame?: boolean;
  /** Rendered inside a manager page, which already provides the page's main landmark. */
  embedded?: boolean;
  /** Preview-only: show these campaigns (e.g. an unpublished draft) instead of published ones. */
  featuredOverride?: Campaign[];
  /** Preview-only: replaces public campaign links, which do not exist for drafts. */
  onCampaignAction?: (campaign: Campaign) => void;
}) {
  const edit = useWebsiteEdit();
  const c = website.content;
  const featured = featuredOverride ?? getFeaturedWebsiteCampaigns(campaigns);
  const hasContact = Boolean(organization.contactLabel || organization.location);
  const socials = [organization.socialInstagram, organization.socialFacebook, organization.socialWebsite].filter(Boolean);
  const stats = edit ? STAT_FIELDS : STAT_FIELDS.filter(([value, label]) => c[value] && c[label]);
  const isVisible = (s: WebsiteSection) => s.enabled !== false && (s.id !== "contact" || hasContact);
  const enabled = (id: string) => website.sections.some((s) => s.id === id && isVisible(s));
  const visible = website.sections.map((section, index) => ({ section, index })).filter(({ section }) => isVisible(section));
  const firstCampaignsIndex = visible.find(({ section }) => section.id === "campaigns")?.index;
  const siteName = c.siteName || organization.name;
  const isModern = website.template === "modern";
  const Main = embedded ? "div" : "main";

  const text = (field: TextField, label: string, placeholder?: string) => (
    <EditableText value={c[field] ?? ""} onChange={(v) => edit?.setContent({ [field]: v })} label={label} placeholder={placeholder} />
  );
  const sectionText = (index: number, field: "heading" | "body" | "caption", value: string, label: string) => (
    <EditableText value={value} onChange={(v) => edit?.updateSection(index, { [field]: v })} label={label} />
  );

  const campaignGrid = (
    <>
      {featured.length === 0 ? (
        <div className="site-card mt-5 rounded-2xl border border-dashed border-black/10 bg-white/60 p-8 text-center text-sm text-[var(--color-text-muted)]">
          New campaigns will appear here soon.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 @2xl:grid-cols-2">
          {featured.map((camp) => (
            <article key={camp.id} className="site-card flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <HeroVisual imageKey={camp.heroImage} className="rounded-none" sizes="(min-width: 768px) 480px, 100vw" />
              <div className="flex flex-1 flex-col gap-2 p-4">
                {onCampaignAction && camp.status !== "published" ? (
                  <div>
                    <StatusBadge state="draft" />
                  </div>
                ) : null}
                <h3 className="text-[17px] font-semibold">{camp.title}</h3>
                <p className="line-clamp-3 flex-1 text-sm text-[var(--color-text-muted)]">{camp.description}</p>
                <div className="pt-1">
                  {onCampaignAction ? (
                    <Button onClick={() => onCampaignAction(camp)}>{camp.primaryCta}</Button>
                  ) : (
                    <ButtonLink href={publicCampaignPath(camp.slug, organization.orgSlug)}>
                      {camp.primaryCta}
                      <Icon name="arrowRight" />
                    </ButtonLink>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );

  const renderSection = (section: WebsiteSection, index: number): ReactNode => {
    switch (section.id) {
      case "hero":
        return (
          <section className="relative">
            <HeroVisual
              imageKey={website.heroImage}
              overlay
              priority
              aspect={isModern ? "aspect-[4/5] @xl:aspect-[16/9] @4xl:aspect-[21/8]" : "aspect-[4/5] @xl:aspect-[16/9] @4xl:aspect-[21/9]"}
              className="rounded-none"
              sizes="100vw"
            />
            <ChangeImageButton target={{ kind: "hero" }} className="left-3 top-3" />
            <div className="absolute inset-x-0 bottom-0">
              <div className="mx-auto max-w-5xl px-4 pb-6 @3xl:pb-10">
                <h1 className="max-w-2xl text-[28px] font-semibold leading-[1.1] text-white @3xl:text-[44px]">
                  {text("headline", "Headline", "Add a headline")}
                </h1>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/85 @3xl:text-base">
                  {text("heroDescription", "Introduction", "Add a short introduction")}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <ButtonLink href={c.primaryCtaHref || "#campaigns"} variant="secondary" size="lg">
                    {text("primaryCtaLabel", "Main button label", "Button label")}
                  </ButtonLink>
                  {enabled("support") ? (
                    <ButtonLink href="#support" variant="dark" size="lg">
                      {text("secondaryCtaLabel", "Second button label", "Button label")}
                    </ButtonLink>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        );

      case "about":
        return (
          <section id="about" className="mx-auto grid max-w-5xl scroll-mt-16 gap-6 px-4 py-12 @3xl:grid-cols-[1.25fr_1fr] @3xl:py-16">
            <div>
              <p className={EYEBROW}>About us</p>
              <h2 className="mt-2 text-[22px] font-semibold @3xl:text-[26px]">
                {sectionText(index, "heading", section.heading ?? "Who we are", "About heading")}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-muted)]">{text("about", "About text")}</p>
            </div>
            {c.featuredInitiatives.length ? (
              <ul className="site-card space-y-2 self-start rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                {c.featuredInitiatives.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm font-medium">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                      <Icon name="check" size={12} />
                    </span>
                    <EditableText
                      value={item}
                      label={`Initiative ${i + 1}`}
                      onChange={(v) => edit?.setContent({ featuredInitiatives: c.featuredInitiatives.map((x, j) => (j === i ? v : x)) })}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        );

      case "mission":
        return (
          <section className="mx-auto grid max-w-5xl gap-4 px-4 py-12 @3xl:grid-cols-2">
            <div className="site-card-soft rounded-2xl bg-white/80 p-5">
              <p className={EYEBROW}>Mission</p>
              <p className="mt-2 text-[17px] font-medium leading-snug">{text("mission", "Mission")}</p>
            </div>
            <div className="site-card-soft rounded-2xl bg-white/80 p-5">
              <p className={EYEBROW}>Vision</p>
              <p className="mt-2 text-[17px] font-medium leading-snug">{text("vision", "Vision")}</p>
            </div>
            {stats.length ? (
              <div className="grid gap-3 @xl:grid-cols-3 @3xl:col-span-2">
                {stats.map(([value, label], i) => (
                  <div key={i} className="site-card rounded-2xl bg-white p-4">
                    <p className="text-[22px] font-semibold text-[var(--color-primary)]">{text(value, `Stat ${i + 1} value`, "Number")}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{text(label, `Stat ${i + 1} label`, "What it counts")}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        );

      case "campaigns":
        return (
          <section
            id={index === firstCampaignsIndex ? "campaigns" : undefined}
            className="mx-auto max-w-5xl scroll-mt-16 px-4 py-12 @3xl:py-16"
          >
            <p className={EYEBROW}>Take part</p>
            <h2 className="mt-2 text-[22px] font-semibold @3xl:text-[26px]">
              {sectionText(index, "heading", section.heading ?? "Our campaigns", "Campaigns heading")}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {sectionText(index, "body", section.body ?? "Ways to take part right now.", "Campaigns subtitle")}
            </p>
            {campaignGrid}
          </section>
        );

      case "activities":
        return (
          <section className="mx-auto max-w-5xl px-4 py-12">
            <h2 className="text-[20px] font-semibold">{text("activitiesHeading", "Activities heading")}</h2>
            <p className="mt-2 max-w-3xl text-[15px] text-[var(--color-text-muted)]">{text("activitiesBody", "Activities text")}</p>
          </section>
        );

      case "support":
        return (
          <section id="support" className="scroll-mt-16 px-4 py-12">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-3xl bg-[var(--color-primary)] px-6 py-10 text-white @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:px-10">
              <div className="max-w-xl">
                <h2 className="text-[22px] font-semibold text-white">{text("supportHeading", "Get involved heading")}</h2>
                <p className="mt-2 text-[15px] text-white/80">{text("supportBody", "Get involved text")}</p>
              </div>
              <ButtonLink href="#campaigns" variant="secondary" size="lg">
                {text("supportCtaLabel", "Get involved button label", "Button label")}
              </ButtonLink>
            </div>
          </section>
        );

      case "contact":
        return (
          <section id="contact" className="mx-auto max-w-5xl scroll-mt-16 px-4 py-12">
            <h2 className="text-[20px] font-semibold">{text("contactHeading", "Contact heading")}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{text("contactBody", "Contact text")}</p>
            <div className="mt-4 grid gap-3 @xl:grid-cols-2">
              {organization.contactLabel ? (
                <div className="site-card rounded-2xl border border-black/5 bg-white p-4 text-sm">
                  <p className="font-semibold">Email</p>
                  <p className="text-[var(--color-text-muted)]">{organization.contactLabel}</p>
                </div>
              ) : null}
              {organization.location ? (
                <div className="site-card rounded-2xl border border-black/5 bg-white p-4 text-sm">
                  <p className="font-semibold">Location</p>
                  <p className="text-[var(--color-text-muted)]">{organization.location}</p>
                </div>
              ) : null}
            </div>
          </section>
        );

      case "story":
        return (
          <section className="mx-auto max-w-3xl px-4 py-12 @3xl:py-16">
            <h2 className="text-[22px] font-semibold @3xl:text-[26px]">{sectionText(index, "heading", section.heading ?? "", "Story heading")}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-muted)]">
              {sectionText(index, "body", section.body ?? "", "Story text")}
            </p>
          </section>
        );

      case "banner":
        return (
          <section className="mx-auto max-w-5xl px-4 py-10">
            <div className="relative">
              <HeroVisual
                imageKey={section.image ?? website.heroImage}
                aspect="aspect-[16/9] @3xl:aspect-[21/9]"
                sizes="(min-width: 1024px) 960px, 100vw"
              />
              <ChangeImageButton target={{ kind: "section", index }} className="left-3 top-3" />
            </div>
            {section.caption || edit ? (
              <p className="mt-3 text-center text-sm text-[var(--color-text-muted)]">
                {sectionText(index, "caption", section.caption ?? "", "Photo caption")}
              </p>
            ) : null}
          </section>
        );

      default:
        return null;
    }
  };

  const shell = (
    <div className="@container min-h-full bg-[#fbfaf6] text-[var(--color-text)]" style={themeStyle(website.brandTheme)}>
      <header className="sticky top-0 z-10 border-b border-black/5 bg-[#fbfaf6]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[11px] font-bold text-white">
              {website.logoLabel || organization.logoLabel}
            </div>
            <p className="truncate text-[15px] font-semibold">{siteName}</p>
          </div>
          <nav className="hidden items-center gap-5 text-sm font-medium text-[var(--color-text-muted)] @3xl:flex">
            {enabled("about") ? <a href="#about" className="hover:text-[var(--color-text)]">About</a> : null}
            {enabled("campaigns") ? <a href="#campaigns" className="hover:text-[var(--color-text)]">Campaigns</a> : null}
            {enabled("contact") ? <a href="#contact" className="hover:text-[var(--color-text)]">Contact</a> : null}
          </nav>
          {enabled("campaigns") ? (
            <ButtonLink href="#campaigns" size="sm">
              Get involved
            </ButtonLink>
          ) : null}
        </div>
      </header>

      <Main>
        {visible.map(({ section, index }, pos) => {
          const prev = visible[pos - 1]?.index;
          const next = visible[pos + 1]?.index;
          const isHero = section.id === "hero";
          return (
            <Fragment key={sectionKey(section)}>
              <EditableSectionWrapper
                label={section.label}
                background={isHero ? undefined : sectionBackground(section)}
                onBackground={isHero ? undefined : (background) => edit?.updateSection(index, { background })}
                onMoveUp={() => prev !== undefined && edit?.swapSections(index, prev)}
                onMoveDown={() => next !== undefined && edit?.swapSections(index, next)}
                onDelete={() => edit?.removeSection(index)}
                canMoveUp={prev !== undefined}
                canMoveDown={next !== undefined}
                canDelete={visible.length > 1}
              >
                {renderSection(section, index)}
              </EditableSectionWrapper>
              <AddSectionDivider index={index + 1} />
            </Fragment>
          );
        })}
      </Main>

      <EditableSectionWrapper
        as="footer"
        label="Footer"
        background={c.footerBackground ?? "dark"}
        onBackground={(footerBackground) => edit?.setContent({ footerBackground })}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 @3xl:flex-row @3xl:items-start @3xl:justify-between">
          <div>
            <p className="text-[15px] font-semibold">
              <EditableText value={siteName} onChange={(v) => edit?.setContent({ siteName: v })} label="Site name" />
            </p>
            <p className="mt-1.5 max-w-md text-sm opacity-70">
              <EditableText
                value={c.footerNote ?? organization.description}
                onChange={(v) => edit?.setContent({ footerNote: v })}
                label="Footer note"
                placeholder="A line about your organization"
              />
            </p>
          </div>
          <div className="text-sm opacity-70">
            {socials.map((s) => (
              <p key={s}>{s}</p>
            ))}
            <p className={socials.length ? "mt-3 text-xs opacity-70" : "text-xs opacity-70"}>Built with Corise</p>
          </div>
        </div>
      </EditableSectionWrapper>
    </div>
  );

  if (!frame) return shell;

  return (
    <div
      className={`mx-auto overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)] ${
        mode === "mobile" ? "max-w-[390px]" : "w-full"
      }`}
    >
      {shell}
    </div>
  );
}

export function WebsiteStatusBadge({ status }: { status: OrgWebsite["status"] | "none" }) {
  return <StatusBadge state={status === "none" ? "not_created" : status} />;
}

export function WebsiteThumbnail({ website }: { website: OrgWebsite }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
      <HeroVisual imageKey={website.heroImage} className="rounded-none" sizes="480px" />
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-semibold">{website.content.headline}</p>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{website.content.siteName}</p>
      </div>
    </div>
  );
}
