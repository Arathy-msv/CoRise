"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { onDemoFill } from "@/lib/demo-data";
import { canCreateWebsite } from "@/lib/deployment";
import { generateImpactSpace, IDEA_PLACEHOLDER, validateIdea } from "@/lib/impact-space/generate";

const ORG_EXAMPLES = [
  {
    label: "🌱 Environmental Non-Profit",
    mission:
      "Green Roots is a local community non-profit dedicated to urban forestry. We bring neighbors together to plant trees and create cleaner, greener neighborhoods.",
  },
  {
    label: "🏫 School or Student Club",
    mission:
      "Riverside Student Club brings students and families together for service projects, school events, and learning that strengthens our community.",
  },
  {
    label: "🐾 Community Animal Rescue",
    mission:
      "Haven Paws is a volunteer animal rescue. We find homes for abandoned pets and help neighbors care for animals in our community.",
  },
  {
    label: "🤝 Neighborhood Association",
    mission:
      "Oak Street Neighbors is a resident association. We organize block gatherings, shared spaces, and small improvements that make our neighborhood better.",
  },
];

const MIN_GENERATING_MS = 900;

export default function HomePage() {
  const { state, hydrated, setPendingSpace } = useCorise();
  const { mode, role, hydrated: appHydrated } = useApp();
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(
    () =>
      onDemoFill((bundle) => {
        if (generating) return;
        setIdea(bundle.idea);
        setError("");
      }),
    [generating]
  );

  const create = async (e?: FormEvent) => {
    e?.preventDefault();
    const problem = validateIdea(idea);
    if (problem) {
      setError(problem);
      inputRef.current?.focus();
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const [space] = await Promise.all([
        generateImpactSpace(idea),
        new Promise((r) => setTimeout(r, MIN_GENERATING_MS)),
      ]);
      setPendingSpace(space);
      router.push("/preview");
    } catch {
      setGenerating(false);
      setError("Something went wrong. Your text is still here — please try again.");
    }
  };

  if (!appHydrated) {
    return <p className="py-24 text-center text-sm text-[var(--color-navy-muted)]">Loading…</p>;
  }

  if (!canCreateWebsite(mode, role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="max-w-md space-y-3 text-center" role="alert">
          <h1 className="text-2xl font-semibold">Platform admins only</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            In SaaS Cloud, only a platform admin can create an organization website. Switch to Platform Admin, or use the Licensed Edition as an org admin.
          </p>
          <Link href="/" className="inline-flex text-sm font-semibold text-[var(--color-primary)] hover:underline">
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-dark flex min-h-screen flex-col">
      <MarketingNav tone="dark" />

      <main className="relative flex flex-1 items-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(67,229,138,0.14),transparent_60%)]"
        />
        <div className="relative mx-auto w-full max-w-2xl px-4 py-16 sm:py-24">
          <h1 className="text-center text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-[48px]">
            Create your organization&apos;s website
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-[17px] leading-relaxed text-[var(--color-navy-muted)]">
            Set up your official home online in seconds, then launch campaigns and rally supporters from your dashboard.
          </p>

          <form onSubmit={create} noValidate className="mt-10">
            <label htmlFor="idea" className="sr-only">
              Describe your organization
            </label>
            <textarea
              id="idea"
              ref={inputRef}
              value={idea}
              disabled={generating}
              onChange={(e) => {
                setIdea(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void create();
              }}
              placeholder={IDEA_PLACEHOLDER}
              rows={4}
              maxLength={600}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "idea-error" : undefined}
              className="w-full resize-none rounded-2xl border border-[var(--color-navy-border)] bg-[var(--color-navy)] px-5 py-4 text-[17px] leading-relaxed text-white placeholder:text-[var(--color-navy-muted)] focus:border-[var(--color-emerald)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--color-emerald)]/20 disabled:opacity-60"
            />
            {error ? (
              <p id="idea-error" role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#ff9b8f]">
                <Icon name="alert" size={14} />
                {error}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {ORG_EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  disabled={generating}
                  onClick={() => {
                    setIdea(example.mission);
                    setError("");
                    inputRef.current?.focus();
                  }}
                  className="rounded-full border border-[var(--color-navy-border)] px-3 py-1.5 text-sm text-[var(--color-navy-muted)] transition hover:border-[var(--color-emerald)]/50 hover:text-white"
                >
                  {example.label}
                </button>
              ))}
            </div>

            <Button type="submit" variant="brand" size="lg" loading={generating} className="mt-8 w-full text-[16px]">
              {generating ? "Building your website…" : "Build Organization Website"}
              {generating ? null : <Icon name="arrowRight" />}
            </Button>
          </form>

          {hydrated && state.pendingSpace && !generating ? (
            <p className="mt-6 text-center text-sm text-[var(--color-navy-muted)]">
              <Link href="/preview" className="font-semibold text-[var(--color-emerald)] hover:underline">
                Continue your unsaved website
              </Link>
            </p>
          ) : null}
        </div>
      </main>

      <footer className="border-t border-[var(--color-navy-border)] px-4 py-6 text-center text-xs text-[var(--color-navy-muted)]">
        Your website is written with built-in templates in your browser. No external AI service is called.
      </footer>
    </div>
  );
}
