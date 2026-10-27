"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroVisual } from "@/components/campaign/HeroVisual";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { PublicLink } from "@/components/ui/PublicLink";
import { useCorise } from "@/context/CoriseContext";
import { buildCampaignFromPrompt, IDEA_EXAMPLE } from "@/lib/suggestions";
import { formatInr } from "@/lib/format";
import { publicCampaignPath, publicOrgPath } from "@/lib/paths";
import { openAppPath } from "@/lib/static-nav";
import type { ThemePreset } from "@/types/corise";

type Phase = "create" | "review" | "done";
type Panel = null | "edit" | "engagement";

export default function CreateCampaignPage() {
  const {
    state,
    startDraft,
    updateDraft,
    publishDraft,
    clearDraft,
  } = useCorise();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("create");
  const [panel, setPanel] = useState<Panel>(null);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [engagementTab, setEngagementTab] = useState<
    "quiz" | "sponsor" | "challenge" | "none"
  >("none");

  const draft = state.draft;
  const view: Phase = phase === "create" && draft?.generated ? "review" : phase;

  const createCampaign = async () => {
    if (!prompt.trim()) {
      setError("Please describe what you would like to achieve.");
      return;
    }
    setError("");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 450));
    if (!state.draft) startDraft();
    const built = buildCampaignFromPrompt(prompt, state.organization, state.website);
    updateDraft(built);
    setPhase("review");
    setPanel(null);
    setEngagementTab("none");
    setBusy(false);
  };

  if (view === "done" && publishedId) {
    const camp = state.campaigns.find((c) => c.id === publishedId);
    return (
      <div className="mx-auto max-w-2xl animate-fade-up corise-card space-y-4 p-6 text-center">
        <Badge tone="success">Published</Badge>
        <h1 className="text-[28px] font-semibold">
          {camp?.title || "Campaign"} is live
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Supporters can join without an account. The link works in this browser — public hosting isn&apos;t connected yet.{" "}
          {camp?.featureOnWebsite
            ? state.website?.status === "published"
              ? "It's featured on your organization website."
              : "It will appear on your website once the website is published."
            : "It isn't featured on your organization website."}
        </p>
        {camp ? (
          <div className="text-left">
            <PublicLink path={publicCampaignPath(camp.slug, state.organization.orgSlug)} label="Public campaign link" />
          </div>
        ) : null}
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <Button variant="secondary" onClick={() => camp && openAppPath(`/campaigns/${camp.id}`, router)}>
            Manage campaign
          </Button>
          {state.website?.status === "published" ? (
            <Button variant="ghost" onClick={() => openAppPath(publicOrgPath(state.organization.orgSlug), router)}>
              View organization website
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearDraft();
              setPublishedId(null);
              setPhase("create");
              setPrompt("");
            }}
          >
            Create another
          </Button>
        </div>
      </div>
    );
  }

  if (view === "create") {
    return (
      <div className="animate-fade-up corise-page mx-auto max-w-2xl">
        <div>
          <h1 className="corise-page-title font-display text-[28px] font-semibold">
            Create a campaign
          </h1>
          <p className="-mt-2 text-[15px] text-[var(--color-text-muted)]">
            Tell us what you want people to know. Corise will write the rest.
          </p>
        </div>

        <div className="corise-card space-y-3 p-4">
          <Field
            label="What would you like to tell people about?"
            hint={`Example: ${IDEA_EXAMPLE}`}
          >
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={IDEA_EXAMPLE}
              autoFocus
            />
          </Field>
          {error ? <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p> : null}
          <Button className="w-full" size="lg" disabled={busy} onClick={createCampaign}>
            {busy ? "Creating your campaign…" : "Create My Campaign"}
          </Button>
        </div>
      </div>
    );
  }

  if (!draft) {
    return <p className="text-[var(--color-text-muted)]">Preparing campaign…</p>;
  }

  return (
    <div className="animate-fade-up corise-page">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-primary)]">
            Your campaign is ready to review
          </p>
          <h1 className="font-display text-[28px] font-semibold">
            {draft.title || draft.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Publish it now, change the wording, or add something optional.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            onClick={() => {
              const { id } = publishDraft();
              setPublishedId(id);
              setPhase("done");
            }}
          >
            Publish Campaign
          </Button>
          <Button
            variant="secondary"
            onClick={() => setPanel(panel === "edit" ? null : "edit")}
          >
            Change Text
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPanel(panel === "engagement" ? null : "engagement")}
          >
            Add Something Extra
          </Button>
        </div>
      </div>

      <p className="rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent-soft)] px-3.5 py-2.5 text-sm text-[var(--color-text)]">
        Publishing stays in this browser — public hosting isn&apos;t connected yet. Visitors are not charged real money.
      </p>

      <label className="flex items-start gap-2.5 rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4"
          checked={draft.featureOnWebsite}
          onChange={(e) => updateDraft({ featureOnWebsite: e.target.checked })}
        />
        <span>
          <strong>Also show this on my organization website</strong>
          <span className="mt-1 block text-[var(--color-text-muted)]">
            Turn this off if you only want a separate campaign page.
          </span>
        </span>
      </label>

      {panel === "edit" ? (
        <div className="corise-card grid gap-4 p-5 md:grid-cols-2">
          <Field label="Title">
            <TextInput
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value, name: e.target.value })}
            />
          </Field>
          <Field label="Call to action">
            <TextInput
              value={draft.primaryCta}
              onChange={(e) => updateDraft({ primaryCta: e.target.value })}
            />
          </Field>
          <Field label="Headline">
            <TextInput
              value={draft.headline}
              onChange={(e) => updateDraft({ headline: e.target.value })}
            />
          </Field>
          <Field label="Hero image">
            <Select
              value={draft.heroImage}
              onChange={(e) => updateDraft({ heroImage: e.target.value })}
            >
              <option value="trees">Trees</option>
              <option value="library">Library</option>
              <option value="cleanup">Clean-up</option>
              <option value="care">Care</option>
              <option value="bags">Bags</option>
            </Select>
          </Field>
          <Field label="Description">
            <TextArea
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
            />
          </Field>
          <Field label="Why it matters">
            <TextArea
              value={draft.whyItMatters}
              onChange={(e) => updateDraft({ whyItMatters: e.target.value })}
            />
          </Field>
          <Field label="Audience">
            <TextInput
              value={draft.suggestedAudience || draft.audience}
              onChange={(e) =>
                updateDraft({ suggestedAudience: e.target.value, audience: e.target.value })
              }
            />
          </Field>
          <Field label="Social share message">
            <TextArea
              value={draft.socialMessage}
              onChange={(e) => updateDraft({ socialMessage: e.target.value })}
            />
          </Field>
          <div className="md:col-span-2">
            <Button variant="ghost" onClick={() => setPanel(null)}>
              Done editing
            </Button>
          </div>
        </div>
      ) : null}

      {panel === "engagement" ? (
        <div className="corise-card space-y-4 p-5">
          <p className="text-sm text-[var(--color-text-muted)]">
            These are optional. You can publish without adding any of them.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                id: "quiz" as const,
                title: "Quiz",
                body: "Short questions supporters can complete.",
                on: draft.quiz.enabled,
              },
              {
                id: "challenge" as const,
                title: "Challenge",
                body: "A simple action habit for supporters.",
                on: draft.challenge.enabled,
              },
              {
                id: "sponsor" as const,
                title: "Sponsor pledge",
                body: "Illustrative local business pledge.",
                on: draft.sponsor.enabled,
              },
              {
                id: "none" as const,
                title: "Milestones",
                body: "Show progress checkpoints on the page.",
                on: draft.milestones.length > 0,
              },
            ].map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => {
                  if (card.id === "quiz") {
                    updateDraft({ quiz: { ...draft.quiz, enabled: !draft.quiz.enabled } });
                    setEngagementTab("quiz");
                  } else if (card.id === "challenge") {
                    updateDraft({
                      challenge: { ...draft.challenge, enabled: !draft.challenge.enabled },
                    });
                    setEngagementTab("challenge");
                  } else if (card.id === "sponsor") {
                    updateDraft({
                      sponsor: { ...draft.sponsor, enabled: !draft.sponsor.enabled },
                    });
                    setEngagementTab("sponsor");
                  } else {
                    setEngagementTab("none");
                  }
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  card.on
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                    : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
                }`}
              >
                <p className="font-semibold">{card.title}</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">{card.body}</p>
                <p className="mt-2 text-xs font-semibold text-[var(--color-primary)]">
                  {card.on ? "On — click to toggle" : "Off — click to enable"}
                </p>
              </button>
            ))}
          </div>

          {draft.quiz.enabled && engagementTab === "quiz" ? (
            <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <Field label="Quiz title">
                <TextInput
                  value={draft.quiz.title}
                  onChange={(e) =>
                    updateDraft({ quiz: { ...draft.quiz, title: e.target.value } })
                  }
                />
              </Field>
              <Field label="Completion message">
                <TextInput
                  value={draft.quiz.completionMessage}
                  onChange={(e) =>
                    updateDraft({
                      quiz: { ...draft.quiz, completionMessage: e.target.value },
                    })
                  }
                />
              </Field>
              <p className="text-xs text-[var(--color-text-muted)]">
                Sample questions are included. Fine-tune later from Engagement Studio if needed.
              </p>
            </div>
          ) : null}

          {draft.sponsor.enabled && engagementTab === "sponsor" ? (
            <div className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:grid-cols-2">
              <Field label="Sponsor name">
                <TextInput
                  value={draft.sponsor.name}
                  onChange={(e) =>
                    updateDraft({ sponsor: { ...draft.sponsor, name: e.target.value } })
                  }
                />
              </Field>
              <Field label="Pledge per action (₹)">
                <TextInput
                  value={String(draft.sponsor.pledgeAmount)}
                  onChange={(e) =>
                    updateDraft({
                      sponsor: {
                        ...draft.sponsor,
                        pledgeAmount: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Cap (₹)">
                <TextInput
                  value={String(draft.sponsor.maxCap)}
                  onChange={(e) =>
                    updateDraft({
                      sponsor: { ...draft.sponsor, maxCap: Number(e.target.value) || 0 },
                    })
                  }
                />
              </Field>
              <Field label="Reward / voucher">
                <TextInput
                  value={draft.sponsor.voucherDescription}
                  onChange={(e) =>
                    updateDraft({
                      sponsor: { ...draft.sponsor, voucherDescription: e.target.value },
                    })
                  }
                />
              </Field>
              <p className="md:col-span-2 text-xs text-[var(--color-text-muted)]">
                Example: {formatInr(draft.sponsor.pledgeAmount)} per quiz completion up to{" "}
                {formatInr(draft.sponsor.maxCap)} — illustrative only, not money received.
              </p>
            </div>
          ) : null}

          {draft.challenge.enabled && engagementTab === "challenge" ? (
            <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <Field label="Challenge title">
                <TextInput
                  value={draft.challenge.title}
                  onChange={(e) =>
                    updateDraft({
                      challenge: { ...draft.challenge, title: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Instructions">
                <TextArea
                  value={draft.challenge.instructions}
                  onChange={(e) =>
                    updateDraft({
                      challenge: { ...draft.challenge, instructions: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
          ) : null}

          <Button variant="ghost" onClick={() => setPanel(null)}>
            Done
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="corise-card overflow-hidden">
          <HeroVisual
            imageKey={draft.heroImage}
            title={draft.headline}
            className="min-h-[220px] rounded-none"
          />
          <div className="space-y-4 p-6">
            <p className="text-sm font-semibold text-[var(--color-primary)]">
              {draft.organizationName}
            </p>
            <h2 className="font-display text-2xl font-semibold">{draft.title}</h2>
            <p className="text-[var(--color-text-muted)]">{draft.description}</p>
            <p className="text-sm">
              <strong>Why it matters:</strong> {draft.whyItMatters}
            </p>
            {draft.milestones.length ? (
              <div>
                <p className="text-sm font-semibold">Milestones</p>
                <ol className="mt-1 list-decimal pl-5 text-sm text-[var(--color-text-muted)]">
                  {draft.milestones.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ol>
              </div>
            ) : null}
            <Button>{draft.primaryCta}</Button>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
              {draft.quiz.enabled ? <Badge tone="accent">Quiz on</Badge> : null}
              {draft.challenge.enabled ? <Badge tone="accent">Challenge on</Badge> : null}
              {draft.sponsor.enabled ? <Badge tone="accent">Sponsor on</Badge> : null}
              {!draft.quiz.enabled && !draft.challenge.enabled && !draft.sponsor.enabled ? (
                <span>No optional engagement — ready to publish</span>
              ) : null}
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="corise-card space-y-3 p-5 text-sm">
            <p className="font-semibold">Theme</p>
            <Select
              value={draft.theme}
              onChange={(e) => updateDraft({ theme: e.target.value as ThemePreset })}
            >
              <option value="forest">Forest</option>
              <option value="amber">Amber</option>
              <option value="ocean">Ocean</option>
              <option value="rose">Rose</option>
            </Select>
            <p className="text-xs text-[var(--color-text-muted)]">
              Inherited from your organization website when available.
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              clearDraft();
              setPhase("create");
              setPanel(null);
              setPrompt("");
            }}
          >
            Start over
          </Button>
        </aside>
      </div>
    </div>
  );
}
