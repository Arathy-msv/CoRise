"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useTweened } from "@/components/campaign/CampaignGamifiedProgress";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { onDemoFill } from "@/lib/demo-data";
import { formatUsd, parsePledge, progressPercent, stageFor } from "@/lib/progress";
import {
  DEMO_PIT_ACTIONS,
  EMPTY_PIT_CART,
  RACE_STAGE_NAMES,
  RACE_UNLOCK_MESSAGES,
  TRACK_POINTS,
  pitActions,
  pitCartCount,
  pitCartTotal,
  trackPose,
  type PitActionId,
  type PitCart,
} from "@/lib/racer";
import type { PitPrices } from "@/types/corise";

type Coin = { id: number; from: DOMRect; amount: number };
type Burst = { id: number; x: number; y: number };

const COIN_MS = 950;
const CHECKPOINTS = [
  { label: "CP1", point: TRACK_POINTS[2], at: 25 },
  { label: "CP2", point: TRACK_POINTS[4], at: 50 },
  { label: "CP3", point: TRACK_POINTS[6], at: 75 },
];
const FINISH = TRACK_POINTS[TRACK_POINTS.length - 1];

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** A gold coin that arcs along a quadratic Bezier from the pit-stop tile to the contribution badge. */
function FlyingCoin({ from, target, onArrive }: { from: DOMRect; target: () => DOMRect | null; onArrive: (x: number, y: number) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const arrive = useRef(onArrive);
  useEffect(() => {
    arrive.current = onArrive;
  });

  useEffect(() => {
    const el = ref.current;
    const to = target();
    if (!el || !to) return;
    const sx = from.left + from.width / 2;
    const sy = from.top + from.height / 2;
    const ex = to.left + 26;
    const ey = to.top + to.height / 2;
    const cx = sx + (ex - sx) * 0.25;
    const cy = Math.max(16, Math.min(sy, ey) - 80);
    const frames = Array.from({ length: 28 }, (_, i) => {
      const t = i / 27;
      const u = 1 - t;
      const x = u * u * sx + 2 * u * t * cx + t * t * ex;
      const y = u * u * sy + 2 * u * t * cy + t * t * ey;
      return { transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${1.15 - 0.4 * t}) rotate(${t * 540}deg)` };
    });
    const anim = el.animate(frames, { duration: COIN_MS, easing: "cubic-bezier(0.45, 0.05, 0.4, 1)", fill: "forwards" });
    anim.onfinish = () => arrive.current(ex, ey);
    return () => anim.cancel();
  }, [from, target]);

  return (
    <span ref={ref} aria-hidden className="race-coin">
      🪙
    </span>
  );
}

function FlagCarIcon() {
  return (
    <span className="relative inline-flex h-9 w-10 shrink-0" aria-hidden>
      <span className="absolute left-0 top-0 text-2xl leading-none">🏁</span>
      <img src="/images/race/race-car.png" alt="" className="absolute bottom-0 right-0 h-4 w-auto" />
    </span>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 3.5h2.6l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 7.5H6" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden>
      <path d="M16 28C10 24 4 17 6 8c7 1 12 7 10 20Z" fill="#3F8A33" />
      <path d="M16 28c6-4 12-11 10-20-7 1-12 7-10 20Z" fill="#5DB547" />
      <path d="M16 28V14" stroke="#2F6B27" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function RetroRacerView({
  title,
  organizationName,
  description,
  current,
  target,
  prices,
  onPledge,
  onBack,
  payToggle,
}: {
  title: string;
  organizationName: string;
  description?: string;
  current: number;
  target: number;
  prices?: Partial<PitPrices>;
  onPledge: (amount: number) => void;
  /** Present when launched from the campaign details page — returns there. */
  onBack?: () => void;
  /** Present when the campaign offers both views — lets supporters switch to the plain Direct Pay form. */
  payToggle?: { onSwitch: () => void };
}) {
  const actions = pitActions(prices);
  const priceOf = (id: PitActionId) => actions.find((a) => a.id === id)?.price ?? 0;
  const demoTotal = DEMO_PIT_ACTIONS.reduce((sum, id) => sum + priceOf(id), 0);

  const [cart, setCart] = useState<PitCart>(EMPTY_PIT_CART);
  const [points, setPoints] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [smoke, setSmoke] = useState<Burst[]>([]);
  const [flashes, setFlashes] = useState<Burst[]>([]);
  const [hold, setHold] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [boost, setBoost] = useState(0);
  const [checkout, setCheckout] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [amountError, setAmountError] = useState("");
  const [thanks, setThanks] = useState<number | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLButtonElement>(null);
  const nextId = useRef(1);

  const percent = progressPercent(current, target);
  const stage = stageFor(percent);
  const shownPercent = useTweened(percent);
  const rounded = Math.floor(percent);
  const pose = trackPose(shownPercent);

  const [seenStage, setSeenStage] = useState(stage);
  const [unlocked, setUnlocked] = useState(false);
  if (stage !== seenStage) {
    if (stage > seenStage) setUnlocked(true);
    setSeenStage(stage);
  }
  useEffect(() => {
    if (!unlocked) return;
    const t = window.setTimeout(() => setUnlocked(false), 2600);
    return () => window.clearTimeout(t);
  }, [unlocked]);

  const total = pitCartTotal(cart, actions);
  const count = pitCartCount(cart);
  const shownTotal = useTweened(total - hold, 500);

  const badgeRect = useCallback(() => badgeRef.current?.getBoundingClientRect() ?? null, []);

  const burst = (setter: typeof setSmoke, x: number, y: number, ms: number) => {
    const id = nextId.current++;
    setter((list) => [...list, { id, x, y }]);
    window.setTimeout(() => setter((list) => list.filter((b) => b.id !== id)), ms);
  };

  const pit = (ids: PitActionId[], source: HTMLElement | null) => {
    const amount = ids.reduce((sum, id) => sum + priceOf(id), 0);
    setCart((c) => ids.reduce((next, id) => ({ ...next, [id]: next[id] + 1 }), c));
    setPoints((p) => p + ids.length);
    setThanks(null);
    if (!source || prefersReducedMotion()) {
      setPulse((p) => p + 1);
      return;
    }
    const from = source.getBoundingClientRect();
    setHold((h) => h + amount);
    setCoins((list) => [...list, { id: nextId.current++, from, amount }]);
    burst(setSmoke, from.left + from.width / 2, from.top + from.height / 2, 900);
  };

  const pitRef = useRef(pit);
  useEffect(() => {
    pitRef.current = pit;
  });
  useEffect(() => onDemoFill(() => pitRef.current(DEMO_PIT_ACTIONS, demoRef.current)), []);

  const landed = (coin: Coin, x: number, y: number) => {
    setCoins((list) => list.filter((c) => c.id !== coin.id));
    setHold((h) => Math.max(0, h - coin.amount));
    setPulse((p) => p + 1);
    setBoost((b) => b + 1);
    burst(setFlashes, x, y, 650);
  };

  const openCheckout = () => {
    setAmountInput(total > 0 ? String(total) : "");
    setAmountError("");
    setCheckout(true);
  };

  const confirm = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parsePledge(amountInput);
    if (!parsed.ok) {
      setAmountError(parsed.error);
      return;
    }
    onPledge(parsed.amount);
    setThanks(parsed.amount);
    setCart(EMPTY_PIT_CART);
    setCheckout(false);
  };

  return (
    <div className="race-view flex min-h-[100dvh] flex-col gap-3 bg-[#f3f0e6] p-3 text-[#1f3d2b] lg:h-screen lg:overflow-hidden">
      <header className="flex shrink-0 flex-col gap-3 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl bg-[#e3e9dc] px-5 py-3.5 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex shrink-0 items-center gap-3">
            {onBack ? (
              <button type="button" onClick={onBack} aria-label="Back to campaign">
                <FlagCarIcon />
              </button>
            ) : (
              <FlagCarIcon />
            )}
            <h1 className="max-w-[220px] text-lg font-semibold leading-tight tracking-tight">{title}</h1>
          </div>
          <span className="hidden h-9 w-px bg-[#1f3d2b]/15 sm:block" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-[#1f3d2b]/75">Shared campaign growth</p>
            <div className="mt-1.5 flex items-center gap-3">
              <div
                className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#cfd6c8]"
                role="progressbar"
                aria-label="Shared campaign growth"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={rounded}
              >
                <div className="h-full rounded-full bg-[#3d7a52]" style={{ width: `${shownPercent}%` }} />
              </div>
              <p className="shrink-0 text-sm text-[#1f3d2b]/75">
                <span data-testid="race-raised" className="text-base font-bold text-[#1f3d2b]">
                  {formatUsd(current)}
                </span>{" "}
                / {formatUsd(target)} · <span data-testid="progress-percent">{rounded}%</span>
              </p>
            </div>
          </div>
        </div>

        <div
          ref={badgeRef}
          data-testid="contribution-badge"
          className="flex shrink-0 items-center gap-4 rounded-2xl border border-black/5 bg-white px-5 py-3 shadow-sm md:min-w-[230px]"
        >
          <span className="text-[#1f3d2b]">
            <CartIcon />
          </span>
          <div key={pulse} className={pulse ? "garden-pulse" : ""} aria-live="polite">
            <p className="text-xs text-[#1f3d2b]/75">Suggested contribution</p>
            <p className="mt-0.5 text-sm text-[#1f3d2b]/75">
              <span data-testid="suggested-total" className="text-xl font-bold text-[#1f3d2b]">
                {formatUsd(Math.round(shownTotal))}
              </span>
              <span className="mx-1.5">·</span>
              {count} pit action{count === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {payToggle ? (
          <button
            type="button"
            onClick={payToggle.onSwitch}
            className="shrink-0 self-start rounded-full border border-black/5 bg-white px-4 py-2 text-sm font-semibold text-[#1f3d2b] shadow-sm transition hover:bg-[#f3f7ef] md:self-center"
          >
            💳 Direct pay
          </button>
        ) : null}
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] bg-white shadow-sm">
        <section className="race-scene relative min-h-[420px] flex-1 overflow-hidden" aria-label="Race track">
          <div className="race-stage" style={{ backgroundImage: "url(/images/race/race-bg.jpg)" }}>
            {CHECKPOINTS.map((cp) => (
              <span
                key={cp.label}
                className={`race-flag ${percent >= cp.at ? "race-flag-passed" : ""}`}
                style={{ left: `${cp.point[0]}%`, top: `${cp.point[1] - 3}%` }}
                aria-hidden
              >
                <span className="race-flag-cloth">{cp.label}</span>
              </span>
            ))}
            <span className="race-finish" style={{ left: `${FINISH[0]}%`, top: `${FINISH[1] - 2}%` }} aria-hidden>
              <span className="race-finish-banner" />
            </span>

            <div
              className="race-car-anchor"
              data-testid="race-car"
              data-stage={stage}
              style={{ left: `${pose.x}%`, top: `${pose.y}%`, transform: `translate(-50%, -82%) scale(${pose.scale})` }}
            >
              <div key={boost} className={boost ? "race-boost" : ""}>
                <img
                  src="/images/race/race-car.png"
                  alt={`Retro racer at ${RACE_STAGE_NAMES[stage]}`}
                  className="block w-full"
                  style={{ transform: pose.facingLeft ? "scaleX(-1)" : undefined }}
                />
                {boost ? (
                  <span className={`race-screech ${pose.facingLeft ? "race-screech-left" : ""}`} aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null}
              </div>
              {stage === 4 ? (
                <span className="race-trophy-sparkles" aria-hidden>
                  {["✨", "🏆", "✨", "⭐", "✨"].map((s, i) => (
                    <i key={i} style={{ animationDelay: `${i * 0.25}s` }}>
                      {s}
                    </i>
                  ))}
                </span>
              ) : null}
            </div>

            <div className="race-sign" aria-label={`Shared campaign growth: ${RACE_STAGE_NAMES[stage]}, ${rounded}%`}>
              <div className="garden-sign rounded-md px-3 py-1.5 text-center text-[#3b2410]">
                <p className="text-[11px] font-semibold leading-tight">Shared campaign growth</p>
                <p data-testid="race-stage" className="text-[10px] font-medium leading-tight">
                  {RACE_STAGE_NAMES[stage]} · {rounded}%
                </p>
              </div>
              <div className="mx-auto h-12 w-2.5 rounded-b-sm bg-[#7a4e25] shadow-[inset_-2px_0_0_rgba(0,0,0,0.18)]" />
            </div>
          </div>

          <div className="relative z-10 max-w-md p-6 sm:p-8">
            <h2 className="text-3xl font-bold leading-tight text-emerald-950">Every pit stop can help us finish.</h2>
            <p className="mt-1 max-w-md text-sm text-emerald-900/80">
              {description || "Support our neighborhood youth team and help our retro racer complete the race."}
            </p>
          </div>

          {stage === 4 ? (
            <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2">
              <div className="race-winner garden-plaque-card rounded-lg px-4 py-2 text-center text-sm font-extrabold text-[#fff6e4] shadow-md">
                🏆 Winner! You helped us reach the goal!
              </div>
            </div>
          ) : null}

          {unlocked && stage < 4 ? (
            <p
              role="status"
              className="gp-unlock absolute left-1/2 top-5 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-4 py-1.5 text-sm font-bold text-[#2f5a3f] shadow-md"
            >
              🏁 {RACE_UNLOCK_MESSAGES[stage]}
            </p>
          ) : null}

          {thanks !== null ? (
            <p
              role="status"
              className="gp-unlock absolute bottom-4 left-4 z-20 max-w-xs rounded-xl bg-white/95 px-4 py-2.5 text-sm font-medium text-[#2f5a3f] shadow-md"
            >
              Thank you! Your {formatUsd(thanks)} pledge keeps our racer moving. No payment was taken — it&apos;s recorded in this browser.
            </p>
          ) : null}
        </section>

        <div className="relative z-10 flex shrink-0 flex-wrap items-stretch gap-3 border-t border-black/5 bg-white p-3">
          <button
            ref={demoRef}
            type="button"
            onClick={(e) => pit(DEMO_PIT_ACTIONS, e.currentTarget)}
            className="flex min-w-[140px] flex-col items-start justify-center rounded-xl border-2 border-[#2f5a3f] bg-white px-3 py-2 text-left transition hover:bg-[#f3f7ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5a3f]"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="rounded-full bg-[#fde9a8] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#7a5a0a]">DEMO</span>
              Fill demo values
            </span>
            <span className="mt-0.5 text-base font-bold">{formatUsd(demoTotal)}</span>
          </button>

          {actions.map((a) => (
            <button
              key={a.id}
              type="button"
              data-pit={a.id}
              aria-label={`${a.label}, ${formatUsd(a.price)}`}
              onClick={(e) => pit([a.id], e.currentTarget)}
              className="relative flex min-w-[120px] flex-1 items-center gap-3 rounded-xl border border-black/5 bg-[#f7f5ef] px-4 py-2 text-left transition hover:-translate-y-0.5 hover:border-[#2f5a3f]/30 hover:bg-[#eef3e8] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5a3f] sm:max-w-[150px]"
            >
              <span className="text-2xl" aria-hidden>
                {a.emoji}
              </span>
              <span>
                <span className="block text-sm text-[#1f3d2b]/65">{a.label}</span>
                <span className="block text-base font-bold text-[#1f3d2b]/80">{formatUsd(a.price)}</span>
              </span>
              {cart[a.id] ? (
                <span className="absolute -right-1.5 -top-1.5 rounded-full bg-[#2f5a3f] px-1.5 py-0.5 text-[11px] font-bold text-white">
                  ×{cart[a.id]}
                </span>
              ) : null}
            </button>
          ))}

          <div className="flex items-center gap-3 border-black/10 px-2 sm:border-l sm:pl-5">
            <LeafIcon />
            <div>
              <p className="text-sm text-[#1f3d2b]/75">Your speed points</p>
              <p data-testid="speed-points" className="text-2xl font-bold leading-none">
                {points}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCheckout}
            className="ml-auto flex min-w-[200px] items-center justify-center gap-3 rounded-xl bg-[#1f4d34] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#173d29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f4d34]"
          >
            Review &amp; contribute <span aria-hidden>→</span>
          </button>
        </div>
      </main>

      {smoke.map((s) => (
        <span key={s.id} aria-hidden className="race-smoke" style={{ left: s.x, top: s.y }}>
          <i />
          <i />
          <i />
          <i />
        </span>
      ))}
      {coins.map((c) => (
        <FlyingCoin key={c.id} from={c.from} target={badgeRect} onArrive={(x, y) => landed(c, x, y)} />
      ))}
      {flashes.map((s) => (
        <span key={s.id} aria-hidden className="garden-sparkle" style={{ left: s.x, top: s.y }}>
          ✨
        </span>
      ))}

      {checkout ? (
        <Modal
          title="Review your contribution"
          description={`Every pit stop helps ${organizationName} finish ${title}.`}
          onClose={() => setCheckout(false)}
        >
          <form onSubmit={confirm} noValidate className="space-y-4">
            {count > 0 ? (
              <ul className="divide-y divide-black/5 rounded-xl bg-[#f7f5ef] px-4">
                {actions
                  .filter((a) => cart[a.id] > 0)
                  .map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                      <span>
                        <span aria-hidden>{a.emoji}</span> {a.label} × {cart[a.id]}
                      </span>
                      <span className="font-semibold">{formatUsd(a.price * cart[a.id])}</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Pick Nitro Boost, Super Tire or Tune Up, or enter any amount below.</p>
            )}
            <div>
              <label htmlFor="race-amount" className="block text-sm font-semibold">
                Contribution amount
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input
                  id="race-amount"
                  inputMode="numeric"
                  autoFocus
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setAmountError("");
                  }}
                  placeholder="25"
                  aria-invalid={Boolean(amountError)}
                  aria-describedby="race-amount-note"
                  className="corise-input"
                  style={{ paddingLeft: 26 }}
                />
              </div>
              {amountError ? <p className="mt-2 text-xs font-medium text-[var(--color-danger)]">{amountError}</p> : null}
              <p id="race-amount-note" className="mt-2 text-xs text-[var(--color-text-muted)]">
                Pledge only — no payment is taken. Recorded in this browser.
              </p>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Confirm pledge
            </Button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
