"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroVisual } from "@/components/campaign/HeroVisual";
import { StatusBadge, type PublishState } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader, SectionHeader } from "@/components/ui/PageHeader";
import { PublicLink } from "@/components/ui/PublicLink";
import { OrgWebsiteRenderer } from "@/components/website/OrgWebsiteRenderer";
import { useApp } from "@/context/AppContext";
import { useCorise, websiteCandidate } from "@/context/CoriseContext";
import { canAccessOrgDashboard } from "@/lib/deployment";
import { relativeTime } from "@/lib/format";
import { campaignPublishState } from "@/lib/impact-space/publish";
import { publicOrgPath } from "@/lib/paths";

type Callout = { tone: "success" | "error"; text: string };

export default function OrganizationWebsitePage() {
  const { state, editWebsiteWizard, clearWebsiteDraft, deleteWebsite, publishWebsite, updateCampaign } = useCorise();
  const { mode, role } = useApp();
  const canCreate = canAccessOrgDashboard(mode, role);
  const router = useRouter();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [busy, setBusy] = useState(false);
  const [callout, setCallout] = useState<Callout | null>(null);
  const website = state.website;

  if (!website) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Website" description="One place for supporters to learn about your organization." />
        <EmptyState
          icon="globe"
          title="You don't have a website yet"
          body={
            canCreate
              ? "Corise drafts one from your organization name and a short description. Nothing is public until you publish."
              : "Only an organization admin can create the organization website."
          }
          action={
            canCreate ? (
              <Button
                onClick={() => {
                  clearWebsiteDraft();
                  router.push("/website/create");
                }}
              >
                <Icon name="plus" />
                Create My Website
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  const candidate = websiteCandidate(state);
  const draftView = candidate.website ?? website;
  const isLive = website.status === "published";
  const pubState: PublishState = isLive ? (state.websiteDraft ? "changes" : "published") : "draft";
  const livePath = publicOrgPath(state.organization.orgSlug);
  const activeCampaigns = state.campaigns.filter((c) => !c.archived);

  const openEditor = () => {
    editWebsiteWizard();
    router.push("/website/create");
  };

  const onPublish = async () => {
    setBusy(true);
    setCallout(null);
    await new Promise((r) => setTimeout(r, 450));
    const result = publishWebsite({ silent: true });
    setBusy(false);
    setCallout(
      result.ok
        ? {
            tone: "success",
            text: "Website published. The link below opens it in this browser — public hosting isn't connected yet.",
          }
        : { tone: "error", text: `Couldn't publish: ${result.error}` }
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Website"
        meta={
          <>
            <StatusBadge state={pubState} />
            <span className="text-sm text-[var(--color-text-muted)]">
              {draftView.content.siteName || candidate.organization.name} · edited {relativeTime(draftView.lastEditedAt)}
            </span>
          </>
        }
        actions={
          !canCreate || pubState === "published" ? (
            <ButtonLink href={livePath} target="_blank" rel="noreferrer">
              <Icon name="external" />
              View live
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href={`${livePath}?preview=1`} target="_blank" rel="noreferrer" variant="outline">
                <Icon name="eye" />
                Preview
              </ButtonLink>
              <Button onClick={() => void onPublish()} loading={busy}>
                {busy ? "Publishing…" : pubState === "changes" ? "Publish updates" : "Publish website"}
              </Button>
            </>
          )
        }
      />

      {callout ? (
        <div
          role="status"
          className={`flex gap-2 rounded-lg border px-3 py-2.5 text-sm ${
            callout.tone === "success"
              ? "border-[var(--color-success)]/25 bg-[var(--color-success-soft)]"
              : "border-[var(--color-danger)]/25 bg-[var(--color-danger-soft)]"
          }`}
        >
          <Icon name={callout.tone === "success" ? "check" : "alert"} className="mt-0.5 shrink-0" />
          {callout.text}
        </div>
      ) : null}

      {isLive ? <PublicLink path={livePath} label="Your public website" /> : null}
      {pubState === "changes" ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          The preview below includes unpublished changes. Visitors still see the live version until you publish updates.
        </p>
      ) : null}

      <section className="space-y-3" aria-label="Website preview">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {canCreate ? (
            <Button variant="secondary" size="sm" onClick={openEditor}>
              <Icon name="edit" />
              Edit website
            </Button>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">Only an organization admin can change this website.</p>
          )}
          <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-white p-0.5">
            {(
              [
                ["desktop", "monitor", "Desktop preview"],
                ["mobile", "phone", "Mobile preview"],
              ] as const
            ).map(([id, icon, label]) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                aria-pressed={device === id}
                onClick={() => setDevice(id)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                  device === id ? "bg-[var(--color-bg)] text-[var(--color-text)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                <Icon name={icon} size={16} />
              </button>
            ))}
          </div>
        </div>
        <div
          className={`overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)] ${
            device === "mobile" ? "mx-auto max-w-[400px]" : ""
          }`}
        >
          <div className="max-h-[70vh] overflow-y-auto">
            <OrgWebsiteRenderer
              website={draftView}
              organization={candidate.organization}
              campaigns={state.campaigns}
              mode={device}
              embedded
            />
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="featured-title">
        <SectionHeader
          title="Campaigns on your website"
          description="Only published campaigns appear to visitors. Changes here apply to the live site straight away."
        />
        {activeCampaigns.length ? (
          <ul className="corise-card divide-y divide-[var(--color-border)]">
            {activeCampaigns.map((c) => {
              const s = campaignPublishState(c);
              return (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <HeroVisual imageKey={c.heroImage} aspect="aspect-[4/3]" className="w-14 shrink-0 rounded-md" sizes="56px" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.title}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <StatusBadge state={s} />
                      {s === "draft" ? (
                        <span className="text-xs text-[var(--color-text-muted)]">Appears once published</span>
                      ) : null}
                    </div>
                  </div>
                  <label className={`flex shrink-0 items-center gap-2 text-sm ${canCreate ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
                    <input
                      type="checkbox"
                      checked={c.featureOnWebsite}
                      disabled={!canCreate}
                      onChange={(e) => updateCampaign(c.id, { featureOnWebsite: e.target.checked })}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    Show on website
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon="megaphone" title="No campaigns yet" body="When you publish a page, you can feature it here." />
        )}
      </section>

      {canCreate ? (
      <details className="corise-card p-4">
        <summary className="cursor-pointer text-sm font-semibold">Remove website</summary>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Removing takes the website offline and deletes it from this browser. Campaigns are kept.
        </p>
        <Button
          className="mt-3"
          variant="danger"
          size="sm"
          onClick={() => {
            if (window.confirm("Remove this website? Visitors will no longer be able to open it.")) deleteWebsite();
          }}
        >
          Remove website
        </Button>
      </details>
      ) : null}
    </div>
  );
}
