"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useCorise } from "@/context/CoriseContext";
import { publicCampaignPath } from "@/lib/paths";

export default function EngagementStudioPage() {
  const { state, startDraft } = useCorise();
  const router = useRouter();

  const withQuiz = state.campaigns.filter((c) => c.quiz.enabled);
  const withChallenge = state.campaigns.filter((c) => c.challenge.enabled);
  const withPoll = state.campaigns.filter((c) => c.poll.enabled);

  return (
    <div className="animate-fade-up corise-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--color-primary)]">
            Settings & more · Optional
          </p>
          <h1 className="corise-page-title font-display text-[28px] font-semibold">
            Quizzes & activities
          </h1>
          <p className="-mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
            You do not need this for a basic campaign. Use it only if you added a quiz or
            challenge.
          </p>
        </div>
        <Button
          onClick={() => {
            startDraft();
            router.push("/campaigns/create");
          }}
        >
          Create campaign with activity
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          {
            title: "Quiz",
            count: withQuiz.length,
            body: "Multiple-choice experience with scoring and a completion message.",
          },
          {
            title: "Challenge",
            count: withChallenge.length,
            body: "Simple habit or action challenges with a completion reward message.",
          },
          {
            title: "Poll",
            count: withPoll.length,
            body: "Live voting with visible result bars on the campaign page.",
          },
        ].map((card) => (
          <div key={card.title} className="corise-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{card.title}</h2>
              <Badge tone="accent">{card.count} active</Badge>
            </div>
            <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{card.body}</p>
          </div>
        ))}
      </div>

      <section className="corise-card p-4">
        <h2 className="font-display text-lg font-semibold">Campaigns with engagement</h2>
        <ul className="mt-3 space-y-2.5">
          {state.campaigns
            .filter((c) => c.quiz.enabled || c.challenge.enabled || c.poll.enabled)
            .map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {[
                      c.quiz.enabled && "Quiz",
                      c.challenge.enabled && "Challenge",
                      c.poll.enabled && "Poll",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ButtonLink href={`/campaigns/${c.id}`} variant="secondary" size="sm">
                    Manage
                  </ButtonLink>
                  <ButtonLink
                    href={publicCampaignPath(c.slug, state.organization.orgSlug)}
                    variant="ghost"
                    size="sm"
                    target="_blank"
                  >
                    Preview as Supporter
                  </ButtonLink>
                </div>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
