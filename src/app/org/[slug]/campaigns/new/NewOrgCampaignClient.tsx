"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CampaignGamifiedProgress } from "@/components/campaign/CampaignGamifiedProgress";
import { PublishedModal } from "@/components/campaign/PublishedModal";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { useCorise } from "@/context/CoriseContext";
import { onDemoFill } from "@/lib/demo-data";
import { newCampaignPath, publicCampaignPath } from "@/lib/paths";
import {
  formatGoalValue,
  formatUsd,
  isPlayableWidget,
  parseGoalTarget,
  PRESENTATION_MODES,
  PROGRESS_WIDGETS,
  validateOrgCampaignInput,
  type OrgCampaignErrors,
  type OrgCampaignInput,
} from "@/lib/progress";
import { DEFAULT_PIT_PRICES, PIT_PRICE_FIELDS, pitActions } from "@/lib/racer";
import { DEFAULT_SHELTER_PRICES, PET_PRICE_FIELDS, petActions } from "@/lib/shelter";
import { CAMP_PRICE_FIELDS, DEFAULT_CAMPFIRE_PRICES, campActions } from "@/lib/campfire";
import { BUILD_PRICE_FIELDS, DEFAULT_CASTLE_PRICES, buildActions } from "@/lib/castle";
import type { Campaign, GoalType } from "@/types/corise";

const STEPS = ["Title & Goal", "Progress widget", "Publish"];

const EMPTY: OrgCampaignInput = {
  headline: "",
  description: "",
  goalType: "amount",
  target: "",
  widget: "none",
  presentationMode: "both",
  pitPrices: DEFAULT_PIT_PRICES,
  shelterPrices: DEFAULT_SHELTER_PRICES,
  campfirePrices: DEFAULT_CAMPFIRE_PRICES,
  castlePrices: DEFAULT_CASTLE_PRICES,
};

function PriceFields<K extends string>({
  title,
  fields,
  values,
  defaults,
  onChange,
}: {
  title: string;
  fields: { id: K; label: string; emoji: string }[];
  values: Record<K, number>;
  defaults: Record<K, number>;
  onChange: (next: Record<K, number>) => void;
}) {
  return (
    <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
      <div className="space-y-1">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        <p className="text-sm text-[var(--color-text-muted)]">Supporters tap these to build a suggested contribution.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {fields.map((f) => (
          <label key={f.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white p-3">
            <span className="text-xl" aria-hidden>
              {f.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{f.label}</span>
              <span className="relative mt-1 block">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input
                  id={`price-${f.id}`}
                  inputMode="numeric"
                  aria-label={`${f.label} price`}
                  value={values[f.id] ? String(values[f.id]) : ""}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/[^\d]/g, "").slice(0, 5));
                    onChange({ ...values, [f.id]: n });
                  }}
                  placeholder={String(defaults[f.id])}
                  className="corise-input"
                  style={{ paddingLeft: 22 }}
                />
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Stepper({ step, onJump }: { step: number; onJump: (n: number) => void }) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Campaign steps">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label}>
            <button
              type="button"
              disabled={!done}
              onClick={() => onJump(n)}
              aria-current={active ? "step" : undefined}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : done
                    ? "border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-white text-[var(--color-text-muted)]"
              }`}
            >
              <span aria-hidden>{done ? "✓" : n}</span>
              {label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function NewOrgCampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { state, hydrated, createOrgCampaign } = useCorise();
  const org = state.organization;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OrgCampaignInput>(EMPTY);
  const [errors, setErrors] = useState<OrgCampaignErrors>({});
  const [previewPercent, setPreviewPercent] = useState(60);
  const [published, setPublished] = useState<Campaign | null>(null);

  const wrongOrg = hydrated && slug !== org.orgSlug;
  useEffect(() => {
    if (wrongOrg) router.replace(newCampaignPath(org.orgSlug));
  }, [wrongOrg, org.orgSlug, router]);

  useEffect(
    () =>
      onDemoFill((bundle) => {
        setForm(bundle.orgCampaign);
        setErrors({});
      }),
    []
  );

  if (wrongOrg) {
    return <p className="py-20 text-center text-sm text-[var(--color-text-muted)]">Opening your organization…</p>;
  }

  const set = <K extends keyof OrgCampaignInput>(key: K, value: OrgCampaignInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const goToWidgets = () => {
    const found = validateOrgCampaignInput(form);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(2);
  };

  const publish = () => {
    const result = createOrgCampaign(form);
    if (!result.ok) {
      setErrors(result.errors);
      setStep(1);
      return;
    }
    setPublished(result.campaign);
  };

  const target = parseGoalTarget(form.target);
  const widgetMeta = PROGRESS_WIDGETS.find((w) => w.id === form.widget) ?? PROGRESS_WIDGETS[PROGRESS_WIDGETS.length - 1];
  const presentationMeta = PRESENTATION_MODES.find((m) => m.id === form.presentationMode) ?? PRESENTATION_MODES[0];
  const pitPrices = form.pitPrices ?? DEFAULT_PIT_PRICES;
  const shelterPrices = form.shelterPrices ?? DEFAULT_SHELTER_PRICES;
  const campfirePrices = form.campfirePrices ?? DEFAULT_CAMPFIRE_PRICES;
  const castlePrices = form.castlePrices ?? DEFAULT_CASTLE_PRICES;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-4">
        <p className="text-[13px] font-medium text-[var(--color-text-muted)]">
          <Link href="/overview" className="hover:text-[var(--color-text)]">
            {org.name}
          </Link>{" "}
          / New campaign
        </p>
        <h1 className="text-[28px] font-semibold leading-tight sm:text-[32px]">Create a campaign</h1>
        <Stepper step={step} onJump={setStep} />
      </header>

      {step === 1 ? (
        <section aria-labelledby="step-goal" className="space-y-6 rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
          <h2 id="step-goal" className="text-xl font-semibold">
            What&apos;s the campaign and its goal?
          </h2>
          <div className="flex flex-col gap-5">
            <Field label="Headline" error={errors.headline}>
              <TextInput
                id="campaign-headline"
                value={form.headline}
                onChange={(e) => set("headline", e.target.value)}
                placeholder="Help us plant 1,000 trees in Riverside Park"
                maxLength={90}
              />
            </Field>
            <Field label="Description" error={errors.description}>
              <TextArea
                id="campaign-description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Tell supporters what you're doing and why it matters."
                maxLength={600}
              />
            </Field>
            <div className="space-y-1.5">
              <p className="text-[13px] font-semibold">Goal type</p>
              <div className="inline-flex rounded-xl bg-[var(--color-bg)] p-1" role="group" aria-label="Goal type">
                {(
                  [
                    ["amount", "Amount ($)"],
                    ["participants", "Participants"],
                  ] as [GoalType, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={form.goalType === id}
                    onClick={() => set("goalType", id)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                      form.goalType === id ? "bg-white text-[var(--color-text)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Field
              label={form.goalType === "amount" ? "Target amount ($)" : "Target participants"}
              error={errors.target}
              hint={form.goalType === "amount" ? "Progress grows with pledges. No payment is taken." : "Progress grows as people join."}
            >
              <TextInput
                id="campaign-target"
                inputMode="numeric"
                value={form.target}
                onChange={(e) => set("target", e.target.value)}
                placeholder={form.goalType === "amount" ? "10000" : "250"}
                className="max-w-[220px]"
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button size="lg" onClick={goToWidgets}>
              Next: Progress widget
              <Icon name="arrowRight" />
            </Button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section aria-labelledby="step-widget" className="space-y-6 rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
          <div className="space-y-1">
            <h2 id="step-widget" className="text-xl font-semibold">
              Choose a progress widget <span className="font-normal text-[var(--color-text-muted)]">(optional)</span>
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">A playful scene that grows as your campaign moves toward its goal.</p>
          </div>

          <label className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold">Preview at</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={previewPercent}
              onChange={(e) => setPreviewPercent(Number(e.target.value))}
              aria-label="Preview progress"
              className="w-48 accent-[var(--color-primary)]"
            />
            <span className="w-10 font-semibold tabular-nums">{previewPercent}%</span>
            <span className="text-xs text-[var(--color-text-muted)]">Preview only — your page starts at 0%.</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRESS_WIDGETS.map((w) => {
              const selected = form.widget === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${w.label}${selected ? " (selected)" : ""}`}
                  onClick={() => set("widget", selected && w.id !== "none" ? "none" : w.id)}
                  className={`group flex flex-col overflow-hidden rounded-2xl border-2 text-left transition ${
                    selected
                      ? "border-[var(--color-primary)] shadow-[var(--shadow-md)]"
                      : "border-transparent bg-[var(--color-bg)] hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  <CampaignGamifiedProgress type={w.id} currentAmount={previewPercent} targetAmount={100} compact className="rounded-none border-0 shadow-none" />
                  <span className="flex items-start justify-between gap-3 bg-white p-4">
                    <span>
                      <span className="block text-[15px] font-semibold">{w.label}</span>
                      <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">{w.tagline}</span>
                    </span>
                    <span
                      className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        selected ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                      }`}
                    >
                      {selected ? "Selected" : "Select"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {form.widget === "race" ? (
            <PriceFields
              title="Pit-stop prices"
              fields={PIT_PRICE_FIELDS}
              values={pitPrices}
              defaults={DEFAULT_PIT_PRICES}
              onChange={(next) => set("pitPrices", next)}
            />
          ) : null}
          {form.widget === "castle" ? (
            <PriceFields
              title="Build action prices"
              fields={BUILD_PRICE_FIELDS}
              values={castlePrices}
              defaults={DEFAULT_CASTLE_PRICES}
              onChange={(next) => set("castlePrices", next)}
            />
          ) : null}
          {form.widget === "campfire" ? (
            <PriceFields
              title="Camp action prices"
              fields={CAMP_PRICE_FIELDS}
              values={campfirePrices}
              defaults={DEFAULT_CAMPFIRE_PRICES}
              onChange={(next) => set("campfirePrices", next)}
            />
          ) : null}
          {form.widget === "shelter" ? (
            <PriceFields
              title="Pet-care prices"
              fields={PET_PRICE_FIELDS}
              values={shelterPrices}
              defaults={DEFAULT_SHELTER_PRICES}
              onChange={(next) => set("shelterPrices", next)}
            />
          ) : null}

          {isPlayableWidget(form.widget) ? (
            <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
              <div className="space-y-1">
                <h3 className="text-[15px] font-semibold">How should supporters interact?</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{widgetMeta.label} is a full playable game. Choose what supporters see first.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {PRESENTATION_MODES.map((m) => {
                  const selected = form.presentationMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => set("presentationMode", m.id)}
                      className={`rounded-xl border-2 p-3.5 text-left transition ${
                        selected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                          : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{m.label}</span>
                      <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">{m.tagline}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <Icon name="arrowLeft" />
              Back
            </Button>
            <Button size="lg" onClick={() => setStep(3)}>
              Next: Review &amp; publish
              <Icon name="arrowRight" />
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section aria-labelledby="step-publish" className="grid gap-6 rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] sm:p-8 md:grid-cols-[1fr_minmax(0,340px)]">
          <div className="space-y-5">
            <h2 id="step-publish" className="text-xl font-semibold">
              Ready to publish
            </h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[var(--color-text-muted)]">Headline</dt>
                <dd className="mt-0.5 text-[17px] font-semibold">{form.headline}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-text-muted)]">Description</dt>
                <dd className="mt-0.5">{form.description}</dd>
              </div>
              <div className="flex flex-wrap gap-8">
                <div>
                  <dt className="text-[var(--color-text-muted)]">Goal</dt>
                  <dd className="mt-0.5 font-semibold">{formatGoalValue(form.goalType, target)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Progress widget</dt>
                  <dd className="mt-0.5 font-semibold">{widgetMeta.label}</dd>
                </div>
                {isPlayableWidget(form.widget) ? (
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Supporter view</dt>
                    <dd className="mt-0.5 font-semibold">{presentationMeta.label}</dd>
                  </div>
                ) : null}
                {form.widget === "castle" ? (
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Build actions</dt>
                    <dd className="mt-0.5 font-semibold">
                      {buildActions(castlePrices)
                        .map((a) => `${a.label} ${formatUsd(a.price)}`)
                        .join(" · ")}
                    </dd>
                  </div>
                ) : null}
                {form.widget === "campfire" ? (
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Camp actions</dt>
                    <dd className="mt-0.5 font-semibold">
                      {campActions(campfirePrices)
                        .map((a) => `${a.label} ${formatUsd(a.price)}`)
                        .join(" · ")}
                    </dd>
                  </div>
                ) : null}
                {form.widget === "shelter" ? (
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Pet care</dt>
                    <dd className="mt-0.5 font-semibold">
                      {petActions(shelterPrices)
                        .map((a) => `${a.label} ${formatUsd(a.price)}`)
                        .join(" · ")}
                    </dd>
                  </div>
                ) : null}
                {form.widget === "race" ? (
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Pit stops</dt>
                    <dd className="mt-0.5 font-semibold">
                      {pitActions(pitPrices)
                        .map((a) => `${a.label} ${formatUsd(a.price)}`)
                        .join(" · ")}
                    </dd>
                  </div>
                ) : null}
              </div>
              <div>
                <dt className="text-[var(--color-text-muted)]">Public link</dt>
                <dd className="mt-0.5 font-mono text-[13px]">/org/{org.orgSlug}/…</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <Icon name="arrowLeft" />
                Back
              </Button>
              <Button size="lg" onClick={publish}>
                <Icon name="globe" />
                Publish campaign
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">What supporters see at launch</p>
            <CampaignGamifiedProgress type={form.widget} currentAmount={0} targetAmount={target} goalType={form.goalType} />
          </div>
        </section>
      ) : null}

      {published ? (
        <PublishedModal
          title={published.title}
          path={publicCampaignPath(published.slug, org.orgSlug)}
          onClose={() => router.push("/overview")}
          websiteLive={state.website?.status === "published"}
        />
      ) : null}
    </div>
  );
}
