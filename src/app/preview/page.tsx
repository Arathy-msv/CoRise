"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OwnerSignupForm, type OwnerDetails } from "@/components/auth/OwnerSignupForm";
import { Logo } from "@/components/brand/Logo";
import { CampaignEditor } from "@/components/campaign/CampaignEditor";
import { PublishedModal } from "@/components/campaign/PublishedModal";
import { CampaignPreview } from "@/components/impact-space/CampaignPreview";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { ToastHost } from "@/components/ui/Toast";
import { AddSectionModal, ImagePickerModal } from "@/components/website/EditorModals";
import { WebsiteEditProvider, type ImageTarget, type WebsiteEditApi } from "@/components/website/InlineEditing";
import { OrgWebsiteRenderer } from "@/components/website/OrgWebsiteRenderer";
import { useCorise } from "@/context/CoriseContext";
import { campaignDraftView } from "@/lib/impact-space/publish";
import { publicCampaignPath, publicOrgPath } from "@/lib/paths";
import { createSectionFromTemplate, insertSectionAt, removeSectionAt, swapSections } from "@/lib/website-sections";
import type { WebsiteSection } from "@/types/corise";

type Device = "desktop" | "mobile";

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md space-y-3 px-4 py-24 text-center">{children}</div>;
}

function DeviceToggle({ value, onChange }: { value: Device; onChange: (d: Device) => void }) {
  return (
    <div className="inline-flex rounded-full bg-[var(--color-bg)] p-1" role="group" aria-label="Preview size">
      {(
        [
          ["desktop", "monitor", "Desktop"],
          ["mobile", "phone", "Mobile"],
        ] as const
      ).map(([id, icon, label]) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
            value === id ? "bg-white text-[var(--color-text)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <Icon name={icon} size={15} />
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * What "Build Organization Website" opens: the organization website itself.
 * Publishing makes that public website live at /org/:slug. No campaign is created with it.
 */
function OrgWebsitePreviewInner() {
  const { state, hydrated, signIn, claimPendingWebsite, discardPendingSpace, updatePendingWebsite, publishWebsite } = useCorise();
  const router = useRouter();
  const [device, setDevice] = useState<Device>("desktop");
  const [editing, setEditing] = useState(false);
  const [askDetails, setAskDetails] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [addAt, setAddAt] = useState<number | null>(null);
  const [imageTarget, setImageTarget] = useState<ImageTarget | null>(null);

  if (!hydrated) {
    return <p className="py-24 text-center text-sm text-[var(--color-text-muted)]">Loading your website…</p>;
  }

  const pending = state.pendingSpace;
  const website = pending ? pending.website : state.website;
  const organization = pending ? pending.organization : state.organization;

  if (!website || !organization) {
    return (
      <Centered>
        <h1 className="text-[26px] font-semibold">Nothing to preview yet</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Describe your organization and Corise will draft the website for you.</p>
        <ButtonLink href="/create">Start</ButtonLink>
      </Centered>
    );
  }

  const siteName = website.content.siteName || organization.name;
  const websiteCampaigns = pending
    ? []
    : state.campaigns.filter((c) => c.organizationName === organization.name);
  const currentImage =
    imageTarget?.kind === "section" ? (website.sections[imageTarget.index]?.image ?? website.heroImage) : website.heroImage;
  const setSections = (sections: WebsiteSection[]) => updatePendingWebsite({ sections });

  const api: WebsiteEditApi = {
    setContent: (patch) => updatePendingWebsite({ content: { ...website.content, ...patch } }),
    updateSection: (index, patch) => setSections(website.sections.map((s, i) => (i === index ? { ...s, ...patch } : s))),
    swapSections: (a, b) => setSections(swapSections(website.sections, a, b)),
    removeSection: (index) => setSections(removeSectionAt(website.sections, index)),
    requestAddSection: setAddAt,
    requestImage: setImageTarget,
  };

  const publish = async (details?: OwnerDetails) => {
    setBusy(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 400));
    if (details) signIn({ userName: details.name, email: details.email });
    claimPendingWebsite();
    const result = publishWebsite({ silent: true });
    setBusy(false);
    setAskDetails(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditing(false);
    setLive(true);
  };

  const onPrimary = () => {
    if (!state.isSignedIn) return setAskDetails(true);
    void publish();
  };

  const startOver = () => {
    if (!window.confirm("Discard this website and start again?")) return;
    discardPendingSpace();
    router.push("/create");
  };

  const actions = live ? null : (
    <>
      <button
        type="button"
        onClick={startOver}
        className="px-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
      >
        Start Over
      </button>
      <Button variant="secondary" onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
        <Icon name="edit" />
        {editing ? "Done" : "Edit"}
      </Button>
      <Button onClick={onPrimary} loading={busy && !askDetails}>
        {busy ? "Publishing…" : "Publish"}
      </Button>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link href={state.isSignedIn ? "/overview" : "/"} aria-label="Corise home" className="shrink-0">
              <Logo size="sm" />
            </Link>
            <div className="hidden min-w-0 items-center gap-2 md:flex">
              <p className="truncate text-sm font-semibold">{siteName}</p>
              {live ? <Badge tone="success">Live</Badge> : <Badge>Draft</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">{actions}</div>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <main className={`px-4 pb-28 pt-4 transition-[padding] sm:px-6 sm:pb-10 ${editing ? "lg:pr-[404px]" : ""}`}>
        <div className="flex flex-col items-center gap-3">
          <DeviceToggle value={device} onChange={setDevice} />
          <p className="text-xs text-[var(--color-text-muted)]">
            {live
              ? "Your organization website is live."
              : editing
                ? "Click any text to edit it. Hover a section to move, restyle or delete it."
                : "Only you can see this until you publish."}
          </p>
          {error ? (
            <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-danger)]">
              <Icon name="alert" size={14} />
              {error}
            </p>
          ) : null}
        </div>

        <div
          className={`mx-auto mt-4 overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-lg)] ring-1 ring-black/5 transition-[max-width] ${
            device === "mobile" ? "max-w-[390px]" : "max-w-6xl"
          }`}
          onClickCapture={(e) => {
            if (editing && (e.target as HTMLElement).closest("a")) e.preventDefault();
          }}
        >
          <div className={device === "mobile" ? "h-[760px] overflow-y-auto" : ""}>
            {editing ? (
              <WebsiteEditProvider value={api}>
                <OrgWebsiteRenderer website={website} organization={organization} campaigns={websiteCampaigns} mode={device} embedded />
              </WebsiteEditProvider>
            ) : (
              <OrgWebsiteRenderer website={website} organization={organization} campaigns={websiteCampaigns} mode={device} embedded />
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
          Written with Corise&apos;s built-in templates. No external AI service is called.
        </p>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-end gap-2 bg-white/95 px-4 py-3 shadow-[0_-1px_0_rgba(0,0,0,0.06)] backdrop-blur sm:hidden">
        {actions}
      </div>

      {addAt !== null ? (
        <AddSectionModal
          onClose={() => setAddAt(null)}
          onPick={(template) => {
            const image = website.heroImage === "community" ? "trees" : "community";
            setSections(insertSectionAt(website.sections, addAt, createSectionFromTemplate(template, image)));
            setAddAt(null);
          }}
        />
      ) : null}

      {imageTarget ? (
        <ImagePickerModal
          current={currentImage}
          onClose={() => setImageTarget(null)}
          onPick={(image) => {
            if (imageTarget.kind === "hero") updatePendingWebsite({ heroImage: image });
            else api.updateSection(imageTarget.index, { image });
            setImageTarget(null);
          }}
        />
      ) : null}

      {askDetails ? (
        <Modal
          title="Publish your website"
          description="Just your name and email. You'll own this website and can edit it anytime."
          onClose={() => !busy && setAskDetails(false)}
        >
          <OwnerSignupForm
            submitLabel={busy ? "Publishing…" : "Publish"}
            loading={busy}
            onSubmit={(details) => void publish(details)}
            footer={
              <p className="text-center text-xs text-[var(--color-text-muted)]">
                Demo sign-in, saved in this browser only.{" "}
                <Link href="/login?next=/preview" className="font-semibold text-[var(--color-primary)] hover:underline">
                  Log in instead
                </Link>
              </p>
            }
          />
        </Modal>
      ) : null}

      {live ? (
        <PublishedModal
          kind="website"
          title={siteName}
          path={publicOrgPath(state.organization.orgSlug)}
          onClose={() => router.push("/website")}
        />
      ) : null}
    </>
  );
}

function PreviewInner() {
  const { state, hydrated, signIn, claimPendingSpace, discardPendingSpace, editCampaign, publishCampaign } = useCorise();
  const router = useRouter();
  const idParam = useSearchParams().get("id");
  const [device, setDevice] = useState<Device>("desktop");
  const [editing, setEditing] = useState(false);
  const [askDetails, setAskDetails] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  if (!hydrated) {
    return <p className="py-24 text-center text-sm text-[var(--color-text-muted)]">Loading your page…</p>;
  }

  const pending = state.pendingSpace;
  const savedId = idParam ?? (pending ? null : state.claimedSpace?.campaignId ?? null);

  if (savedId && !state.isSignedIn) {
    return (
      <Centered>
        <h1 className="text-[26px] font-semibold">Log in to edit your page</h1>
        <ButtonLink href={`/login?next=${encodeURIComponent(`/preview?id=${savedId}`)}`}>Log in</ButtonLink>
      </Centered>
    );
  }

  const saved = savedId ? state.campaigns.find((c) => c.id === savedId) : undefined;
  const isPending = !saved && Boolean(pending);
  const campaign = saved ? campaignDraftView(saved) : pending?.campaign;

  if (!campaign) {
    return (
      <Centered>
        <h1 className="text-[26px] font-semibold">Nothing to preview yet</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Describe what you want to create and Corise will write the page for you.</p>
        <ButtonLink href="/create">Start</ButtonLink>
      </Centered>
    );
  }

  const live = Boolean(saved && saved.status === "published" && !saved.archived && !saved.pendingChanges);
  const sharedCampaign = sharedId ? state.campaigns.find((c) => c.id === sharedId) : undefined;

  const publish = async (details?: OwnerDetails) => {
    setBusy(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 400));
    if (details) signIn({ userName: details.name, email: details.email });
    const id = isPending ? claimPendingSpace() ?? campaign.id : campaign.id;
    const result = publishCampaign(id, { silent: true });
    setBusy(false);
    setAskDetails(false);
    if (!result.ok) {
      setError(result.error);
      if (isPending) router.replace(`/preview?id=${id}`);
      return;
    }
    setEditing(false);
    setSharedId(id);
    router.replace(`/preview?id=${id}`);
  };

  const onPrimary = () => {
    if (live && saved) return setSharedId(saved.id);
    if (!state.isSignedIn) return setAskDetails(true);
    void publish();
  };

  const startOver = () => {
    if (isPending) {
      if (!window.confirm("Discard this page and start again?")) return;
      discardPendingSpace();
    }
    router.push("/create");
  };

  const actions = (
    <>
      <button
        type="button"
        onClick={startOver}
        className="px-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
      >
        Start Over
      </button>
      <Button variant="secondary" onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
        <Icon name="edit" />
        Edit
      </Button>
      <Button onClick={onPrimary} loading={busy && !askDetails}>
        {live ? (
          <>
            <Icon name="share" />
            Share
          </>
        ) : busy ? (
          "Publishing…"
        ) : (
          "Publish"
        )}
      </Button>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link href={state.isSignedIn ? "/overview" : "/"} aria-label="Corise home" className="shrink-0">
              <Logo size="sm" />
            </Link>
            <div className="hidden min-w-0 items-center gap-2 md:flex">
              <p className="truncate text-sm font-semibold">{campaign.title}</p>
              {live ? <Badge tone="success">Live</Badge> : <Badge>Draft</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">{actions}</div>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <main className={`px-4 pb-28 pt-4 transition-[padding] sm:px-6 sm:pb-10 ${editing ? "lg:pr-[404px]" : ""}`}>
        <div className="flex flex-col items-center gap-3">
          <DeviceToggle value={device} onChange={setDevice} />
          <p className="text-xs text-[var(--color-text-muted)]">
            {live ? "This is your live page." : "Only you can see this until you publish."}
          </p>
          {error ? (
            <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-danger)]">
              <Icon name="alert" size={14} />
              {error}
            </p>
          ) : null}
        </div>

        <div
          className={`mx-auto mt-4 overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-lg)] ring-1 ring-black/5 transition-[max-width] ${
            device === "mobile" ? "max-w-[390px]" : "max-w-6xl"
          }`}
        >
          <div className={device === "mobile" ? "h-[760px] overflow-y-auto" : ""}>
            <CampaignPreview campaign={campaign} />
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
          Written with Corise&apos;s built-in templates. No external AI service is called.
        </p>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-end gap-2 bg-white/95 px-4 py-3 shadow-[0_-1px_0_rgba(0,0,0,0.06)] backdrop-blur sm:hidden">
        {actions}
      </div>

      {editing ? (
        <CampaignEditor key={campaign.id} campaign={campaign} live={live} onChange={(patch) => editCampaign(campaign.id, patch)} onClose={() => setEditing(false)} />
      ) : null}

      {askDetails ? (
        <Modal
          title="Publish your page"
          description="Just your name and email. You'll own this page and can edit it anytime."
          onClose={() => !busy && setAskDetails(false)}
        >
          <OwnerSignupForm
            submitLabel={busy ? "Publishing…" : "Publish"}
            loading={busy}
            onSubmit={(details) => void publish(details)}
            footer={
              <p className="text-center text-xs text-[var(--color-text-muted)]">
                Demo sign-in, saved in this browser only.{" "}
                <Link href="/login?next=/preview" className="font-semibold text-[var(--color-primary)] hover:underline">
                  Log in instead
                </Link>
              </p>
            }
          />
        </Modal>
      ) : null}

      {sharedCampaign ? (
        <PublishedModal
          title={sharedCampaign.title}
          path={publicCampaignPath(sharedCampaign.slug, state.organization.orgSlug)}
          onClose={() => setSharedId(null)}
          websiteLive={state.website?.status === "published"}
        />
      ) : null}
    </>
  );
}

/**
 * "Build Organization Website" always lands here with a pending space and no `?id=`.
 * That visit is the organization website, even if this browser already claimed an earlier page.
 * `?id=` stays the standalone campaign editor. The choice is locked once so publishing
 * (which clears `pendingSpace`) does not swap the page mid-flow.
 */
function PreviewRouter() {
  const { state, hydrated } = useCorise();
  const idParam = useSearchParams().get("id");
  const [isOrgWebsite, setIsOrgWebsite] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hydrated || isOrgWebsite !== null) return;
    setIsOrgWebsite(!idParam && Boolean(state.pendingSpace));
  }, [hydrated, idParam, state.pendingSpace, isOrgWebsite]);

  if (!hydrated || (!idParam && isOrgWebsite === null)) {
    return <p className="py-24 text-center text-sm text-[var(--color-text-muted)]">Loading your website…</p>;
  }

  return isOrgWebsite ? <OrgWebsitePreviewInner /> : <PreviewInner />;
}

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<p className="py-24 text-center text-sm text-[var(--color-text-muted)]">Loading your page…</p>}>
        <PreviewRouter />
      </Suspense>
      <ToastHost />
    </div>
  );
}
