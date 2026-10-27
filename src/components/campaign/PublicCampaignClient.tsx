"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CampaignGamifiedProgress } from "@/components/campaign/CampaignGamifiedProgress";
import { CampaignLayout, campaignHasActivities } from "@/components/campaign/CampaignLayout";
import { EndorsementBanner } from "@/components/campaign/EndorsementBanner";
import { PersonalizedShareModal } from "@/components/campaign/PersonalizedShareModal";
import { QuizPlayer } from "@/components/campaign/QuizPlayer";
import { DirectPayView } from "@/components/garden/DirectPayView";
import { GardenCampaignView } from "@/components/garden/GardenCampaignView";
import { RetroRacerView } from "@/components/racer/RetroRacerView";
import { CozyPawsView } from "@/components/shelter/CozyPawsView";
import { CampfireView } from "@/components/campfire/CampfireView";
import { CastleView } from "@/components/castle/CastleView";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ToastHost } from "@/components/ui/Toast";
import { useCorise } from "@/context/CoriseContext";
import { formatInr, percent } from "@/lib/format";
import { findWorkspaceBySlug, type OrgWorkspace } from "@/lib/org-access";
import { publicCampaignPath, publicOrgPath } from "@/lib/paths";
import { CAMPAIGN_CLOSED_MESSAGE, campaignProgress, formatGoalValue, formatUsd, isCampaignClosed, parsePledge, progressPercent } from "@/lib/progress";
import type { Campaign } from "@/types/corise";
import { CAMPAIGN_TYPE_META } from "@/types/corise";

function SharePill({ prominent = false, onClick }: { prominent?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        prominent
          ? "inline-flex items-center gap-1.5 rounded-full border border-transparent bg-[#F5EDE1] px-4 py-1.5 text-xs font-semibold text-amber-950 shadow-xs transition-all hover:bg-[#EBDDCE]"
          : "inline-flex items-center gap-1.5 rounded-full border border-amber-200/55 bg-amber-100/50 px-3 py-1 text-xs font-medium text-amber-950 transition-all hover:bg-amber-100"
      }
    >
      <span aria-hidden>{prominent ? "📤" : "🔗"}</span>
      Share
    </button>
  );
}

/** Progress is shown only when real (or clearly labeled sample) money has been recorded. */
function showFundraisingProgress(c: Campaign): boolean {
  return c.showProgress && Boolean(c.fundraisingTarget) && c.metrics.fundsRaised > 0;
}

export default function PublicCampaignClient({ slug, orgSlug }: { slug: string; orgSlug?: string }) {
  const { hydrated, state, getPublicCampaign, recordQuizCompletion, castPollVote, recordParticipation, recordPledge, showToast } =
    useCorise();
  const orgMatches = !orgSlug || orgSlug === state.organization.orgSlug;
  const [externalWorkspace, setExternalWorkspace] = useState<OrgWorkspace | null>(null);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  useEffect(() => {
    if (!orgSlug || orgSlug === state.organization.orgSlug) {
      setExternalWorkspace(null);
    } else {
      setExternalWorkspace(findWorkspaceBySlug(orgSlug));
    }
    setWorkspaceReady(true);
  }, [orgSlug, state.organization.orgSlug]);
  const externalCampaign =
    externalWorkspace?.website?.status === "published"
      ? externalWorkspace.campaigns.find((c) => (c.slug === slug || c.id === slug) && c.status === "published" && !c.archived)
      : undefined;
  const campaign = (orgMatches ? getPublicCampaign(slug) : undefined) ?? externalCampaign;
  const publicOrganization = externalWorkspace && !orgMatches ? externalWorkspace.organization : state.organization;
  const websiteLive = Boolean(orgMatches ? state.website?.status === "published" : externalWorkspace?.website?.status === "published");
  const [challengeDone, setChallengeDone] = useState(false);
  const [ctaDone, setCtaDone] = useState(false);
  const [shared, setShared] = useState(false);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [pledgeInput, setPledgeInput] = useState("");
  const [pledgeError, setPledgeError] = useState("");
  const [pledged, setPledged] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  /** null = showing campaign details first; set once the supporter picks how to support. */
  const [launchMode, setLaunchMode] = useState<"play" | "pay" | null>(null);
  const [selectedMode, setSelectedMode] = useState<"play" | "pay">("play");
  const actionRef = useRef<HTMLDivElement>(null);
  const pledgeRef = useRef<HTMLInputElement>(null);
  const launchRef = useRef<HTMLDivElement>(null);

  if (!hydrated || (Boolean(orgSlug) && !orgMatches && !workspaceReady)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfaf6] text-sm text-[var(--color-text-muted)]">
        Loading campaign…
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#fbfaf6] px-4 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <Icon name="info" size={20} />
        </span>
        <h1 className="text-2xl font-semibold">Campaign unavailable</h1>
        <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
          This campaign isn&apos;t published yet, has been archived, or the link is incomplete.
        </p>
        {websiteLive ? (
          <Link href={publicOrgPath(publicOrganization.orgSlug)} className="text-sm font-semibold text-[var(--color-primary)] underline">
            Visit {publicOrganization.name}
          </Link>
        ) : null}
      </div>
    );
  }

  const goal = campaignProgress(campaign);
  const closed = isCampaignClosed(campaign);
  const pledgeGoal = goal?.goalType === "amount";
  const isTreeGame = Boolean(goal && pledgeGoal && goal.widget === "tree");
  const isRaceGame = Boolean(goal && pledgeGoal && goal.widget === "race");
  const isShelterGame = Boolean(goal && pledgeGoal && goal.widget === "shelter");
  const isCampfireGame = Boolean(goal && pledgeGoal && goal.widget === "campfire");
  const isCastleGame = Boolean(goal && pledgeGoal && goal.widget === "castle");
  const presentationMode = campaign.presentationMode ?? "game";
  const isPlayableGame = Boolean(goal && pledgeGoal && (isTreeGame || isRaceGame || isShelterGame || isCampfireGame || isCastleGame));
  const showToggle = presentationMode === "both";
  const playToggleLabel = isRaceGame
    ? "Play the race game"
    : isShelterGame
      ? "Play the sanctuary game"
      : isCampfireGame
        ? "Play the campfire game"
        : isCastleGame
          ? "Play the castle game"
          : undefined;

  /** The supporter has already chosen how to support — open the dedicated game or direct-pay page. */
  if (isPlayableGame && launchMode && goal && !closed) {
    const onPledge = (amount: number): number | false => {
      const result = recordPledge(campaign.id, amount);
      return result.accepted > 0 ? result.accepted : false;
    };
    const onBack = () => setLaunchMode(null);
    const payToggle = showToggle ? { onSwitch: () => { setSelectedMode("pay"); setLaunchMode("pay"); } } : undefined;
    const playToggle = showToggle ? { onSwitch: () => { setSelectedMode("play"); setLaunchMode("play"); }, label: playToggleLabel } : undefined;

    if (launchMode === "pay") {
      return (
        <>
          <DirectPayView
            title={campaign.title}
            organizationName={campaign.organizationName}
            description={campaign.description}
            current={goal.current}
            target={goal.target}
            onPledge={onPledge}
            onBack={onBack}
            playToggle={playToggle}
          />
          <ToastHost />
        </>
      );
    }
    return (
      <>
        {isRaceGame ? (
          <RetroRacerView
            title={campaign.title}
            organizationName={campaign.organizationName}
            description={campaign.description}
            current={goal.current}
            target={goal.target}
            prices={campaign.pitPrices}
            onPledge={onPledge}
            onBack={onBack}
            payToggle={payToggle}
          />
        ) : isCastleGame ? (
          <CastleView
            title={campaign.title}
            organizationName={campaign.organizationName}
            description={campaign.description}
            current={goal.current}
            target={goal.target}
            prices={campaign.castlePrices}
            onPledge={onPledge}
            onBack={onBack}
            payToggle={payToggle}
          />
        ) : isCampfireGame ? (
          <CampfireView
            title={campaign.title}
            organizationName={campaign.organizationName}
            description={campaign.description}
            current={goal.current}
            target={goal.target}
            prices={campaign.campfirePrices}
            onPledge={onPledge}
            onBack={onBack}
            payToggle={payToggle}
          />
        ) : isShelterGame ? (
          <CozyPawsView
            title={campaign.title}
            organizationName={campaign.organizationName}
            description={campaign.description}
            current={goal.current}
            target={goal.target}
            prices={campaign.shelterPrices}
            onPledge={onPledge}
            onBack={onBack}
            payToggle={payToggle}
          />
        ) : (
          <GardenCampaignView
            title={campaign.title}
            organizationName={campaign.organizationName}
            current={goal.current}
            target={goal.target}
            prices={campaign.carePrices}
            onPledge={onPledge}
            onBack={onBack}
            payToggle={payToggle}
          />
        )}
        <ToastHost />
      </>
    );
  }

  const submitPledge = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parsePledge(pledgeInput);
    if (!parsed.ok) {
      setPledgeError(parsed.error);
      return;
    }
    const result = recordPledge(campaign.id, parsed.amount);
    if (result.accepted <= 0) {
      setPledgeError(CAMPAIGN_CLOSED_MESSAGE);
      return;
    }
    setPledged(result.accepted);
    setPledgeError("");
    setPledgeInput("");
  };

  const primaryAction = () => {
    if (isPlayableGame) {
      launchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (pledgeGoal) {
      pledgeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      pledgeRef.current?.focus({ preventScroll: true });
      return;
    }
    if (campaignHasActivities(campaign)) {
      actionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (campaign.type === "awareness") {
      void navigator.clipboard?.writeText(campaign.socialMessage || campaign.headline).catch(() => undefined);
      setShared(true);
      return;
    }
    if (ctaDone) return;
    recordParticipation(campaign.id);
    setCtaDone(true);
  };

  const progress = campaign.fundraisingTarget
    ? Math.min(100, (campaign.metrics.fundsRaised / campaign.fundraisingTarget) * 100)
    : 0;
  const totalVotes = campaign.poll.votes.reduce((a, b) => a + b, 0);

  return (
    <>
      <CampaignLayout
        campaign={campaign}
        headerAction={
          websiteLive ? (
            <Link
              href={publicOrgPath(publicOrganization.orgSlug)}
              className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            >
              Visit organization
            </Link>
          ) : null
        }
        primary={null}
        heroFold={{
          tag: CAMPAIGN_TYPE_META[campaign.type]?.label ?? "Campaign",
          title: campaign.headline || campaign.title,
          subtitle: campaign.description,
          introShare: <SharePill onClick={() => setShareOpen(true)} />,
          banner: (
            <Suspense fallback={null}>
              <EndorsementBanner />
            </Suspense>
          ),
          whyItMatters: campaign.whyItMatters,
          whyShare: <SharePill prominent onClick={() => setShareOpen(true)} />,
          widget: closed ? (
            <div role="status" className="flex h-full flex-col justify-center gap-2 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold">This campaign is closed</p>
              <p className="text-sm text-[var(--color-text-muted)]">It reached its goal, so fundraising has stopped.</p>
            </div>
          ) : isPlayableGame ? (
            <div ref={launchRef} className="flex h-full flex-col justify-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold">How would you like to support?</p>
              {showToggle ? (
                <>
                  <div className="flex flex-col gap-2" role="radiogroup" aria-label="Choose how to support">
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3.5 py-2.5 text-sm font-medium transition ${
                        selectedMode === "play"
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                          : "border-black/10 hover:border-[var(--color-primary)]/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="support-mode"
                        value="play"
                        checked={selectedMode === "play"}
                        onChange={() => setSelectedMode("play")}
                        className="h-4 w-4 accent-[var(--color-primary)]"
                      />
                      🎮 Play the game
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3.5 py-2.5 text-sm font-medium transition ${
                        selectedMode === "pay"
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                          : "border-black/10 hover:border-[var(--color-primary)]/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="support-mode"
                        value="pay"
                        checked={selectedMode === "pay"}
                        onChange={() => setSelectedMode("pay")}
                        className="h-4 w-4 accent-[var(--color-primary)]"
                      />
                      💳 Direct pay
                    </label>
                  </div>
                  <Button size="lg" className="w-full" onClick={() => setLaunchMode(selectedMode)}>
                    Continue
                    <Icon name="arrowRight" />
                  </Button>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Play the game is selected by default — switch to Direct Pay any time.
                  </p>
                </>
              ) : (
                <>
                  <Button size="lg" className="w-full" onClick={() => setLaunchMode(presentationMode === "direct_pay" ? "pay" : "play")}>
                    {presentationMode === "direct_pay" ? "Direct pay" : "Play the game"}
                  </Button>
                  <p className="text-xs text-[var(--color-text-muted)]">Pledge only — no payment is taken. Recorded in this browser.</p>
                </>
              )}
            </div>
          ) : goal && goal.widget !== "none" ? (
            <CampaignGamifiedProgress
              type={goal.widget}
              currentAmount={goal.current}
              targetAmount={goal.target}
              goalType={goal.goalType}
              sceneOnly
              className="h-auto"
            />
          ) : undefined,
          stats: goal ? (
            <div className="flex h-full items-center gap-3 rounded-xl border border-black/5 bg-white p-3 shadow-sm">
              <span data-testid="progress-percent" className="shrink-0 text-base font-bold leading-none">
                {Math.floor(progressPercent(goal.current, goal.target))}%
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5" aria-hidden>
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{ width: `${progressPercent(goal.current, goal.target)}%` }}
                />
              </div>
              <span className="shrink-0 text-sm font-semibold text-[var(--color-text-muted)]">
                {formatGoalValue(goal.goalType, goal.current)} of {formatGoalValue(goal.goalType, goal.target)}
              </span>
            </div>
          ) : showFundraisingProgress(campaign) ? (
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-semibold">{formatInr(campaign.metrics.fundsRaised)}</span>
                <span className="text-[var(--color-text-muted)]">
                  of {campaign.fundraisingTarget ? formatInr(campaign.fundraisingTarget) : "goal"}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5">
                <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                {percent(progress)} · {campaign.isSample ? "Sample figures for demonstration" : "Recorded in this browser"}
              </p>
            </div>
          ) : undefined,
          actionBox: closed ? (
            <div role="status" className="rounded-2xl border border-black/5 bg-white p-4 text-sm shadow-sm">
              <p className="font-semibold">Fundraising has stopped</p>
              <p className="mt-1 text-[var(--color-text-muted)]">This campaign is closed because it reached its goal.</p>
            </div>
          ) : isPlayableGame ? null : (
            <div className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:gap-6">
              {pledgeGoal ? (
                <form onSubmit={submitPledge} noValidate className="min-w-0 flex-1">
                  <label htmlFor="pledge-amount" className="block text-sm font-semibold">
                    Pledge your support
                  </label>
                  <div className="mt-2 flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
                        $
                      </span>
                      <input
                        ref={pledgeRef}
                        id="pledge-amount"
                        inputMode="numeric"
                        value={pledgeInput}
                        onChange={(e) => {
                          setPledgeInput(e.target.value);
                          setPledgeError("");
                        }}
                        placeholder="25"
                        aria-invalid={Boolean(pledgeError)}
                        aria-describedby="pledge-note"
                        className="corise-input"
                        style={{ paddingLeft: 26 }}
                      />
                    </div>
                    <Button type="submit" size="lg" className="shrink-0">
                      Pledge
                    </Button>
                  </div>
                  {pledgeError ? <p className="mt-2 text-xs font-medium text-[var(--color-danger)]">{pledgeError}</p> : null}
                  {pledged !== null ? (
                    <p role="status" className="mt-2 rounded-xl bg-[var(--color-primary-soft)] px-3 py-2 text-sm font-medium text-[var(--color-primary)]">
                      Thank you! Your pledge of {formatUsd(pledged)} was recorded.
                    </p>
                  ) : null}
                  <p id="pledge-note" className="mt-2 text-xs text-[var(--color-text-muted)]">
                    Pledge only — no payment is taken. Recorded in this browser.
                  </p>
                </form>
              ) : (
                <div className="min-w-0 flex-1 space-y-2">
                  <Button size="lg" className="w-full lg:w-auto" onClick={primaryAction} disabled={ctaDone}>
                    {ctaDone ? <Icon name="check" /> : null}
                    {ctaDone ? "You're in" : campaign.primaryCta}
                  </Button>
                  {ctaDone ? (
                    <p role="status" className="rounded-xl bg-[var(--color-primary-soft)] px-3 py-2 text-sm font-medium text-[var(--color-primary)]">
                      Thank you for joining — your interest has been recorded. Share the link to bring a friend along.
                    </p>
                  ) : null}
                </div>
              )}
              {shared ? (
                <p role="status" className="rounded-xl bg-[var(--color-primary-soft)] px-3 py-2 text-sm font-medium text-[var(--color-primary)]">
                  Share message copied — thank you for helping spread the word.
                </p>
              ) : null}
              <div className="flex shrink-0 items-center gap-2 border-t border-black/5 pt-3 lg:border-t-0 lg:pt-0">
                <Button variant="ghost" size="sm" onClick={() => setShareOpen(true)}>
                  <Icon name="share" />
                  Share
                </Button>
                {campaignHasActivities(campaign) ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  >
                    <Icon name="sparkles" />
                    Play Game
                  </Button>
                ) : null}
              </div>
            </div>
          ),
        }}
        activities={
          campaignHasActivities(campaign) ? (
            <div ref={actionRef} className="scroll-mt-6 space-y-4">
              <h2 className="text-[22px] font-semibold">Take part</h2>
              {campaign.quiz.enabled ? (
                <QuizPlayer
                  quiz={campaign.quiz}
                  onComplete={() => recordQuizCompletion(campaign.id)}
                  nextStepLabel="Thank you — share this campaign with someone who might care."
                />
              ) : null}

              {campaign.challenge.enabled ? (
                <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                  <h3 className="text-[17px] font-semibold">{campaign.challenge.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{campaign.challenge.instructions}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">Complete when: {campaign.challenge.completionCondition}</p>
                  {challengeDone ? (
                    <p role="status" className="mt-4 rounded-xl bg-[var(--color-primary-soft)] p-3 text-sm font-medium text-[var(--color-primary)]">
                      {campaign.challenge.rewardMessage || "Challenge complete — thank you!"}
                    </p>
                  ) : (
                    <Button
                      className="mt-4"
                      onClick={() => {
                        setChallengeDone(true);
                        recordParticipation(campaign.id);
                      }}
                    >
                      Mark challenge complete
                    </Button>
                  )}
                </div>
              ) : null}

              {campaign.poll.enabled ? (
                <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                  <h3 className="text-[17px] font-semibold">{campaign.poll.question}</h3>
                  <div className="mt-3 space-y-2">
                    {campaign.poll.options.map((opt, i) => {
                      const share = totalVotes ? Math.round(((campaign.poll.votes[i] || 0) / totalVotes) * 100) : 0;
                      const voted = votedIndex !== null;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={voted}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            votedIndex === i
                              ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                              : "border-black/10 enabled:hover:border-[var(--color-primary)]/50"
                          }`}
                          onClick={() => {
                            castPollVote(campaign.id, i);
                            setVotedIndex(i);
                          }}
                        >
                          <div className="flex justify-between text-sm font-medium">
                            <span>{opt}</span>
                            {voted ? <span>{share}%</span> : null}
                          </div>
                          {voted ? (
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/5">
                              <div className="h-full bg-[var(--color-primary)]" style={{ width: `${share}%` }} />
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  {votedIndex !== null ? (
                    <p role="status" className="mt-3 text-xs text-[var(--color-text-muted)]">
                      Thanks for voting. Results include {totalVotes} vote{totalVotes === 1 ? "" : "s"} recorded in this browser.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : undefined
        }
        afterActivities={
          (campaign.sponsor.enabled && campaign.sponsor.name) || (campaign.type === "awareness" && campaign.socialMessage) ? (
          <>
            {campaign.sponsor.enabled && campaign.sponsor.name ? (
              <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Local sponsor</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white">
                    {campaign.sponsor.logoLabel}
                  </div>
                  <div>
                    <p className="font-semibold">{campaign.sponsor.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {formatInr(campaign.sponsor.pledgeAmount)} per {campaign.sponsor.qualifyingAction.toLowerCase()} · up to{" "}
                      {formatInr(campaign.sponsor.maxCap)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[var(--color-text-muted)]">Sample sponsor shown for demonstration — no pledge has been received.</p>
              </div>
            ) : null}
            {campaign.type === "awareness" && campaign.socialMessage ? (
              <div className="rounded-2xl border border-dashed border-black/10 p-5">
                <p className="text-sm text-[var(--color-text-muted)]">{campaign.socialMessage}</p>
                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(campaign.socialMessage);
                      setShared(true);
                    } catch {
                      showToast("Couldn't copy automatically — select the message to copy it.", "warn");
                    }
                  }}
                >
                  <Icon name="copy" />
                  Copy share message
                </Button>
              </div>
            ) : null}
          </>
          ) : undefined
        }
      />

      {isPlayableGame ? null : (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-black/5 bg-[#F6F8F5]/95 p-3 backdrop-blur md:hidden">
          <Button className="w-full" size="lg" onClick={primaryAction} disabled={ctaDone}>
            {ctaDone ? "You're in" : campaign.primaryCta}
          </Button>
        </div>
      )}
      {shareOpen ? (
        <PersonalizedShareModal
          path={publicCampaignPath(campaign.slug, publicOrganization.orgSlug)}
          campaignTitle={campaign.headline || campaign.title}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
      <ToastHost />
    </>
  );
}
