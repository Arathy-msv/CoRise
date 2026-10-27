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
import { newCampaignPath, orgDashboardPath, publicCampaignPath } from "@/lib/paths";
import { openAppPath } from "@/lib/static-nav";
import { DEFAULT_CARE_PRICES } from "@/lib/garden";
import {
  formatGoalValue,
  formatUsd,
  parseGoalTarget,
  PROGRESS_WIDGETS,
  validateOrgCampaignInput,
  type OrgCampaignErrors,
  type OrgCampaignInput,
} from "@/lib/progress";
import { DEFAULT_PIT_PRICES, PIT_PRICE_FIELDS, pitActions } from "@/lib/racer";
import { DEFAULT_SHELTER_PRICES, PET_PRICE_FIELDS, petActions } from "@/lib/shelter";
import { CAMP_PRICE_FIELDS, DEFAULT_CAMPFIRE_PRICES, campActions } from "@/lib/campfire";
import { BUILD_PRICE_FIELDS, DEFAULT_CASTLE_PRICES, buildActions } from "@/lib/castle";
import type { Campaign, GoalType, PresentationMode, ProgressWidget } from "@/types/corise";

const STEPS = ["Title & Goal", "Donation setup", "Publish"];

const DONATION_METHODS: { id: PresentationMode; icon: string; title: string; description: string }[] = [
  { id: "direct_pay", icon: "💳", title: "Direct Pay", description: "Quick, straightforward contributions." },
  { id: "game", icon: "🎮", title: "Play a Game", description: "Gamified experiences where actions equal funds." },
  { id: "both", icon: "💳🎮", title: "Both (Direct & Game)", description: "Let supporters choose how they want to participate." },
];

const GAME_CHOICES: { id: Extract<ProgressWidget, "tree" | "race" | "shelter">; title: string; description: string; preview: number }[] = [
  { id: "tree", title: "Grow The Tree", description: "Seed to sprout to a blooming fruit tree.", preview: 70 },
  { id: "race", title: "Grand Prix Racer", description: "Speed past checkpoints to the finish.", preview: 55 },
  { id: "shelter", title: "Cozy Paws Shelter", description: "Fill the meadow with rescued pets and warm mats.", preview: 45 },
];

const EMPTY: OrgCampaignInput = {
  headline: "",
  description: "",
  goalType: "amount",
  target: "",
  widget: "tree",
  presentationMode: "both",
  carePrices: DEFAULT_CARE_PRICES,
  pitPrices: DEFAULT_PIT_PRICES,
  shelterPrices: DEFAULT_SHELTER_PRICES,
  campfirePrices: DEFAULT_CAMPFIRE_PRICES,
  castlePrices: DEFAULT_CASTLE_PRICES,
};

function PriceInputs<K extends string>({
  fields,
  values,
  onChange,
}: {
  fields: { id: K; label: string }[];
  values: Record<K, number>;
  onChange: (next: Record<K, number>) => void;
}) {
  return (
    <div className="mt-8">
      <p className="text-sm font-semibold text-gray-800">Set price per action (optional)</p>
      <p className="mt-1 text-xs text-gray-500">Supporters can click care actions to build their suggested donation amount.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {fields.map((field) => (
          <label key={field.id} className="flex items-center gap-2 text-sm text-gray-700">
            {field.label}
            <span className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                id={`price-${field.id}`}
                inputMode="numeric"
                aria-label={`${field.label} price`}
                value={values[field.id] ? String(values[field.id]) : ""}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^\d]/g, "").slice(0, 5));
                  onChange({ ...values, [field.id]: n });
                }}
                className="w-28 rounded-lg border border-gray-300 bg-white py-1.5 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#183B2E]"
              />
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
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-[#183B2E] text-white"
                  : done
                    ? "bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:ring-gray-300"
                    : "text-gray-500"
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
  const [published, setPublished] = useState<Campaign | null>(null);

  const wrongOrg = hydrated && slug !== org.orgSlug;
  useEffect(() => {
    if (wrongOrg) openAppPath(newCampaignPath(org.orgSlug), router, "replace");
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
  const carePrices = form.carePrices ?? DEFAULT_CARE_PRICES;
  const pitPrices = form.pitPrices ?? DEFAULT_PIT_PRICES;
  const shelterPrices = form.shelterPrices ?? DEFAULT_SHELTER_PRICES;
  const campfirePrices = form.campfirePrices ?? DEFAULT_CAMPFIRE_PRICES;
  const castlePrices = form.castlePrices ?? DEFAULT_CASTLE_PRICES;

  return (
    <div className="-mx-4 -my-6 min-h-full bg-[#F6F8F5] px-4 py-8 sm:-mx-6 md:-mx-8 md:-my-8">
      <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <p className="text-xs font-medium text-gray-500">
          <Link href={orgDashboardPath(org.orgSlug)} className="hover:text-gray-900">
            {org.name}
          </Link>
          {" / New campaign"}
        </p>
        <h1 className="mb-6 mt-3 text-3xl font-bold text-gray-900">Create a campaign</h1>
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
            <Button size="lg" onClick={goToWidgets} className="!bg-[#183B2E] hover:!bg-[#122D23]">
              Next: Donation setup
              <Icon name="arrowRight" />
            </Button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section aria-labelledby="step-donate" className="max-w-5xl rounded-2xl border border-gray-200/80 bg-white p-8 shadow-sm">
          <h2 id="step-donate" className="text-xl font-bold text-gray-900">
            How can people donate? <span className="font-bold text-gray-500">(optional)</span>
          </h2>
          <p className="mb-6 mt-1 text-sm text-gray-500">
            Choose if supporters can contribute directly, play an interactive game, or do both.
          </p>

          <div className="grid gap-4 md:grid-cols-3" role="group" aria-label="How can people donate?">
            {DONATION_METHODS.map((method) => {
              const selected = form.presentationMode === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    set("presentationMode", method.id);
                    if (method.id !== "direct_pay" && !GAME_CHOICES.some((game) => game.id === form.widget)) set("widget", "tree");
                  }}
                  className={`relative cursor-pointer rounded-xl border-2 p-5 text-left transition-all ${
                    selected ? "border-[#183B2E] bg-[#F0F5F2] shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {selected ? (
                    <span className="absolute right-3 top-3 text-xs font-semibold text-[#183B2E]">✓ Selected</span>
                  ) : null}
                  <span className="text-xl" aria-hidden>
                    {method.icon}
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-gray-900">{method.title}</span>
                  <span className="mt-1 block text-sm text-gray-600">{method.description}</span>
                </button>
              );
            })}
          </div>

          {form.presentationMode !== "direct_pay" ? (
            <>
              <h3 className="mb-4 mt-8 text-sm font-semibold text-gray-700">
                Select a Game Experience <span className="font-medium text-gray-500">(For &quot;Play a Game&quot; &amp; &quot;Both&quot; options)</span>
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {GAME_CHOICES.map((game) => {
                  const selected = form.widget === game.id;
                  return (
                    <button
                      key={game.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => set("widget", game.id)}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:border-gray-300"
                    >
                      <CampaignGamifiedProgress
                        type={game.id}
                        currentAmount={game.preview}
                        targetAmount={100}
                        sceneOnly
                        className="rounded-none border-0 shadow-none"
                      />
                      <span className="flex items-center justify-between gap-3 p-3">
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900">{game.title}</span>
                          <span className="mt-0.5 block text-xs text-gray-500">{game.description}</span>
                        </span>
                        <span
                          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                            selected ? "bg-[#183B2E] text-white" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {selected ? "Selected" : "Select"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {form.widget === "tree" ? (
                <PriceInputs fields={[{ id: "water", label: "Water" }, { id: "fertilizer", label: "Fertilizer" }, { id: "sunlight", label: "Sunlight" }]} values={carePrices} onChange={(next) => set("carePrices", next)} />
              ) : null}
              {form.widget === "race" ? (
                <PriceInputs fields={PIT_PRICE_FIELDS} values={pitPrices} onChange={(next) => set("pitPrices", next)} />
              ) : null}
              {form.widget === "shelter" ? (
                <PriceInputs fields={PET_PRICE_FIELDS} values={shelterPrices} onChange={(next) => set("shelterPrices", next)} />
              ) : null}
            </>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl bg-[#183B2E] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#122D23]"
            >
              Next: Review &amp; Publish →
            </button>
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
                  <dt className="text-[var(--color-text-muted)]">How people donate</dt>
                  <dd className="mt-0.5 font-semibold">{DONATION_METHODS.find((method) => method.id === form.presentationMode)?.title}</dd>
                </div>
                {form.presentationMode !== "direct_pay" ? (
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Game</dt>
                    <dd className="mt-0.5 font-semibold">{widgetMeta.label}</dd>
                  </div>
                ) : null}
                {form.widget === "tree" && form.presentationMode !== "direct_pay" ? (
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Care actions</dt>
                    <dd className="mt-0.5 font-semibold">
                      Water {formatUsd(carePrices.water)} · Fertilizer {formatUsd(carePrices.fertilizer)} · Sunlight {formatUsd(carePrices.sunlight)}
                    </dd>
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
    </div>
  );
}
