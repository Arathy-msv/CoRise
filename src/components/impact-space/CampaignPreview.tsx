"use client";

import { useState } from "react";
import { CampaignLayout, campaignHasActivities } from "@/components/campaign/CampaignLayout";
import { QuizPlayer } from "@/components/campaign/QuizPlayer";
import { Button } from "@/components/ui/Button";
import type { Campaign } from "@/types/corise";

/** Read-only rendering of a campaign draft — interactions here are never recorded. */
export function CampaignPreview({ campaign }: { campaign: Campaign }) {
  const [ctaClicked, setCtaClicked] = useState(false);

  return (
    <CampaignLayout
      campaign={campaign}
      embedded
      primary={
        <div className="space-y-2">
          <Button size="lg" onClick={() => setCtaClicked(true)}>
            {campaign.primaryCta}
          </Button>
          {ctaClicked ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              Preview only — once published, supporters who click this get a thank-you message and their interest is recorded.
            </p>
          ) : null}
        </div>
      }
      activities={
        campaignHasActivities(campaign) ? (
          <>
            <h2 className="text-[22px] font-semibold">Take part</h2>
            {campaign.quiz.enabled ? (
              <QuizPlayer
                key={`${campaign.quiz.title}-${campaign.quiz.questions.map((q) => q.prompt).join("|")}`}
                quiz={campaign.quiz}
                onComplete={() => undefined}
                nextStepLabel="Preview only — completions are recorded after publishing."
              />
            ) : null}
            {campaign.challenge.enabled ? (
              <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                <h3 className="text-[17px] font-semibold">{campaign.challenge.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{campaign.challenge.instructions}</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Complete when: {campaign.challenge.completionCondition}</p>
              </div>
            ) : null}
            {campaign.poll.enabled ? (
              <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                <h3 className="text-[17px] font-semibold">{campaign.poll.question}</h3>
                <ul className="mt-3 space-y-2">
                  {campaign.poll.options.map((opt) => (
                    <li key={opt} className="rounded-xl border border-black/10 px-4 py-2.5 text-sm">
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : null
      }
    />
  );
}
