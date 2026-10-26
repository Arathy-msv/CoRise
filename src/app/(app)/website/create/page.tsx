"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { AddSectionModal, ImagePickerModal } from "@/components/website/EditorModals";
import { WebsiteEditProvider, type ImageTarget, type WebsiteEditApi } from "@/components/website/InlineEditing";
import { OrgWebsiteRenderer } from "@/components/website/OrgWebsiteRenderer";
import { useApp } from "@/context/AppContext";
import { useCorise, websiteCandidate } from "@/context/CoriseContext";
import { canAccessOrgDashboard } from "@/lib/deployment";
import { ORG_DO_EXAMPLE } from "@/lib/suggestions";
import { buildWebsiteFromSimpleInput } from "@/lib/website-suggestions";
import { createSectionFromTemplate, insertSectionAt, removeSectionAt, swapSections } from "@/lib/website-sections";
import { THEME_COLORS, type ThemePreset, type WebsiteSection } from "@/types/corise";

const THEME_NAMES: Record<string, string> = { forest: "Forest green" };
const UNDO_MS = 8000;

function themeName(key: string) {
  return THEME_NAMES[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

function CreateWebsiteForm() {
  const { state, updateWebsiteDraft } = useCorise();
  const [orgName, setOrgName] = useState(state.organization.name);
  const [whatWeDo, setWhatWeDo] = useState(state.organization.description || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    if (!orgName.trim()) return setError("Please enter your organization name.");
    if (!whatWeDo.trim()) return setError("Please tell us what your organization does.");
    setError("");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 450));
    updateWebsiteDraft(buildWebsiteFromSimpleInput(orgName, whatWeDo, state.organization));
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Create your website" description="Answer two questions and Corise drafts the website for you. Nothing is public until you publish." />
      <div className="corise-card space-y-4 p-5">
        <Field label="What is your organization called?">
          <TextInput value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. GreenSteps Community Foundation" autoFocus />
        </Field>
        <Field label="Tell us about your organization." hint={`Example: ${ORG_DO_EXAMPLE}`} error={error || undefined}>
          <TextArea value={whatWeDo} onChange={(e) => setWhatWeDo(e.target.value)} placeholder={ORG_DO_EXAMPLE} />
        </Field>
        <Button className="w-full" size="lg" loading={busy} onClick={() => void create()}>
          {busy ? "Drafting your website…" : "Create My Website"}
        </Button>
      </div>
    </div>
  );
}

function WebsiteEditor() {
  const { state, updateWebsiteDraft, publishWebsite, clearWebsiteDraft, editWebsiteWizard } = useCorise();
  const router = useRouter();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [addAt, setAddAt] = useState<number | null>(null);
  const [imageTarget, setImageTarget] = useState<ImageTarget | null>(null);
  const [removed, setRemoved] = useState<{ section: WebsiteSection; index: number } | null>(null);

  useEffect(() => {
    if (!removed) return;
    const t = window.setTimeout(() => setRemoved(null), UNDO_MS);
    return () => window.clearTimeout(t);
  }, [removed]);

  const draft = state.websiteDraft;
  if (!draft?.generated) return <CreateWebsiteForm />;

  const isLive = state.website?.status === "published";
  const isNew = !state.website;
  const { website: previewWebsite, organization: previewOrg } = websiteCandidate(state);
  const siteName = draft.content.siteName || draft.orgName;
  const setSections = (sections: WebsiteSection[]) => updateWebsiteDraft({ sections });

  const api: WebsiteEditApi = {
    setContent: (patch) => updateWebsiteDraft({ content: { ...draft.content, ...patch } }),
    updateSection: (index, patch) => setSections(draft.sections.map((s, i) => (i === index ? { ...s, ...patch } : s))),
    swapSections: (a, b) => setSections(swapSections(draft.sections, a, b)),
    removeSection: (index) => {
      const section = draft.sections[index];
      if (!section) return;
      setRemoved({ section, index });
      setSections(removeSectionAt(draft.sections, index));
    },
    requestAddSection: setAddAt,
    requestImage: setImageTarget,
  };

  const currentImage =
    imageTarget?.kind === "section" ? (draft.sections[imageTarget.index]?.image ?? draft.heroImage) : draft.heroImage;

  const onPublish = async () => {
    setBusy(true);
    setError("");
    await new Promise((r) => setTimeout(r, 450));
    const result = publishWebsite();
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/website");
  };

  const onDiscard = () => {
    const msg = isNew
      ? "Discard this website draft and start over?"
      : "Discard all unpublished changes? The editor goes back to your last saved version.";
    if (!window.confirm(msg)) return;
    setRemoved(null);
    setError("");
    clearWebsiteDraft();
    if (!isNew) editWebsiteWizard();
  };

  return (
    <div>
      <div className="sticky top-14 z-40 -mx-4 -mt-6 mb-5 border-b border-white/10 bg-[#101512] text-white shadow-lg sm:-mx-6 md:top-0 md:-mx-8 md:-mt-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 md:px-8">
          <Link
            href="/website"
            aria-label="Back to My Website"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
          >
            <Icon name="arrowLeft" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {siteName} <span className="font-normal text-white/55">· Site Editor</span>
            </p>
            <p className="truncate text-[11px] text-white/55">
              {isLive ? "Unpublished changes — visitors see the live site until you publish" : "Draft — not public until you publish"}
            </p>
          </div>

          <div role="group" aria-label="Site colors" className="flex items-center gap-1.5">
            {(Object.keys(THEME_COLORS) as ThemePreset[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-label={`${themeName(key)} colors`}
                title={themeName(key)}
                aria-pressed={draft.brandTheme === key}
                onClick={() => updateWebsiteDraft({ brandTheme: key })}
                className={`h-5 w-5 rounded-full ring-offset-2 ring-offset-[#101512] transition focus-visible:outline-2 focus-visible:outline-white ${
                  draft.brandTheme === key ? "ring-2 ring-white" : "hover:ring-2 hover:ring-white/40"
                }`}
                style={{ background: THEME_COLORS[key].primary, boxShadow: `inset 0 0 0 2px ${THEME_COLORS[key].accent}` }}
              />
            ))}
          </div>

          <div className="inline-flex rounded-lg bg-white/10 p-0.5">
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
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition focus-visible:outline-2 focus-visible:outline-white ${
                  device === id ? "bg-white text-[#101512]" : "text-white/70 hover:text-white"
                }`}
              >
                <Icon name={icon} size={15} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onDiscard}
            className="rounded-md px-2 py-1.5 text-sm font-medium text-white/75 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-white"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={() => void onPublish()}
            disabled={busy}
            aria-busy={busy || undefined}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--color-success)] px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-70"
          >
            {busy ? <Spinner /> : <Icon name="check" />}
            {busy ? "Publishing…" : isLive ? "Save & Publish Updates" : "Save & Publish Website"}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mb-4 flex gap-2 rounded-lg border border-[var(--color-danger)]/25 bg-[var(--color-danger-soft)] px-3 py-2.5 text-sm">
          <Icon name="alert" className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}

      <p className="mb-3 flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
        <Icon name="edit" size={14} />
        Click any text to edit it. Hover a section to move, restyle or delete it. Changes save automatically.
      </p>

      <div className={device === "mobile" ? "mx-auto max-w-[400px]" : ""}>
        <div
          className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)]"
          aria-label="Website editor canvas"
          onClickCapture={(e) => {
            if ((e.target as HTMLElement).closest("a")) e.preventDefault();
          }}
        >
          {previewWebsite ? (
            <WebsiteEditProvider value={api}>
              <OrgWebsiteRenderer website={previewWebsite} organization={previewOrg} campaigns={state.campaigns} mode={device} embedded />
            </WebsiteEditProvider>
          ) : null}
        </div>
      </div>

      {removed ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-5 z-50 mx-auto flex w-fit items-center gap-3 rounded-full bg-[#101512] py-2 pl-4 pr-2 text-sm text-white shadow-lg"
        >
          <span>
            <span className="font-semibold">{removed.section.label}</span> section removed
          </span>
          <span aria-hidden className="text-white/40">
            ·
          </span>
          <button
            type="button"
            onClick={() => {
              setSections(insertSectionAt(draft.sections, removed.index, removed.section));
              setRemoved(null);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-semibold hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Icon name="undo" size={14} />
            Undo
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setRemoved(null)}
            className="rounded-full p-1.5 text-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ) : null}

      {addAt !== null ? (
        <AddSectionModal
          onClose={() => setAddAt(null)}
          onPick={(template) => {
            const image = draft.heroImage === "community" ? "trees" : "community";
            setSections(insertSectionAt(draft.sections, addAt, createSectionFromTemplate(template, image)));
            setAddAt(null);
          }}
        />
      ) : null}

      {imageTarget ? (
        <ImagePickerModal
          current={currentImage}
          onClose={() => setImageTarget(null)}
          onPick={(image) => {
            if (imageTarget.kind === "hero") updateWebsiteDraft({ heroImage: image });
            else api.updateSection(imageTarget.index, { image });
            setImageTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}

export default function WebsiteCreatePage() {
  const { mode, role, hydrated } = useApp();
  if (!hydrated) return <p className="text-sm text-[var(--color-text-muted)]">Loading editor…</p>;
  if (!canAccessOrgDashboard(mode, role)) {
    return (
      <div className="corise-card mx-auto max-w-lg space-y-3 p-6 text-center" role="alert">
        <h1 className="text-xl font-semibold">Organization admins only</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Only an organization admin can create or edit the organization website.
        </p>
        <Link href="/website" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
          Back to My Website
        </Link>
      </div>
    );
  }
  return (
    <Suspense fallback={<p className="text-sm text-[var(--color-text-muted)]">Loading editor…</p>}>
      <WebsiteEditor />
    </Suspense>
  );
}
