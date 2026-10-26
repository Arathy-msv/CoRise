"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useTweened } from "@/components/campaign/CampaignGamifiedProgress";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { onDemoFill } from "@/lib/demo-data";
import { formatUsd, parsePledge, progressPercent, stageFor } from "@/lib/progress";
import {
  CAMPFIRE_SPRITES,
  CAMPFIRE_UNLOCK_MESSAGES,
  DEMO_CAMP_ACTIONS,
  EMPTY_CAMP_CART,
  FIRE_RING,
  campActions,
  campCartCount,
  campCartTotal,
  type CampActionId,
  type CampCart,
} from "@/lib/campfire";
import type { CampfirePrices } from "@/types/corise";

type Coin = { id: number; from: DOMRect; amount: number };
type Burst = { id: number; x: number; y: number };

const COIN_MS = 950;
const FLAME_SCALE = [0, 0.55, 1, 1.05, 1.3];
const FIREFLIES = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 47) % 100,
  y: 38 + ((i * 29) % 46),
  d: 3 + (i % 5) * 0.8,
  delay: (i % 7) * 0.6,
}));
const LAKE_FIREFLIES = Array.from({ length: 12 }, (_, i) => ({ x: 36 + i * 3.2, y: 62 + (i % 3) * 2.2, d: 2.6 + (i % 4) * 0.7, delay: (i % 5) * 0.5 }));
/** Fairy-light strings as quadratic curves across the tree branches, in a 1600×900 scene. */
const LIGHT_STRINGS = [
  { from: [40, 330], ctrl: [220, 470], to: [430, 360] },
  { from: [180, 250], ctrl: [330, 380], to: [520, 300] },
  { from: [1080, 330], ctrl: [1260, 470], to: [1480, 330] },
  { from: [1200, 240], ctrl: [1380, 380], to: [1580, 260] },
];
const SHOOTING_STARS = [0, 1, 2, 3];
const FIREWORKS = [
  { x: 30, y: 16, c: "#ffd36b", delay: 0 },
  { x: 62, y: 10, c: "#ff9ec7", delay: 1.1 },
  { x: 76, y: 22, c: "#9ee6ff", delay: 2.2 },
];

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function bulbs(s: (typeof LIGHT_STRINGS)[number], n = 9) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const u = 1 - t;
    return [u * u * s.from[0] + 2 * u * t * s.ctrl[0] + t * t * s.to[0], u * u * s.from[1] + 2 * u * t * s.ctrl[1] + t * t * s.to[1]];
  });
}

/** A gold coin that arcs along a quadratic Bezier from the action tile to the contribution badge. */
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

function CampIcon() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden>
      <path d="M4 32 15 10l11 22Z" fill="#d9a35b" stroke="#8a5a26" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M15 10v22M11 32l4-9 4 9" fill="#f6c977" stroke="#8a5a26" strokeWidth="1.2" />
      <path d="M30 33c-4 0-5-3-4-6 1 2 2 2 2 2-1-4 2-7 4-8 0 3 3 4 3 8 0 2-2 4-5 4Z" fill="#f28a2e" />
      <path d="M30.5 33c-1.8 0-2.4-1.6-1.6-3 .6 1 1.2 1 1.2 1 0-1.6 1-2.6 2-3 0 1.4 1.2 2 1.2 3.4 0 .9-1 1.6-2.8 1.6Z" fill="#ffd36b" />
      <path d="M24 35h14M26 33.5l10 3" stroke="#6b4423" strokeWidth="2" strokeLinecap="round" />
    </svg>
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

export function CampfireView({
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
  prices?: Partial<CampfirePrices>;
  onPledge: (amount: number) => void;
  /** Present when launched from the campaign details page — returns there. */
  onBack?: () => void;
  /** Present when the campaign offers both views — lets supporters switch to the plain Direct Pay form. */
  payToggle?: { onSwitch: () => void };
}) {
  const actions = campActions(prices);
  const priceOf = (id: CampActionId) => actions.find((a) => a.id === id)?.price ?? 0;
  const demoTotal = DEMO_CAMP_ACTIONS.reduce((sum, id) => sum + priceOf(id), 0);

  const [cart, setCart] = useState<CampCart>(EMPTY_CAMP_CART);
  const [points, setPoints] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [embers, setEmbers] = useState<Burst[]>([]);
  const [flashes, setFlashes] = useState<Burst[]>([]);
  const [hold, setHold] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [flare, setFlare] = useState(0);
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
  const visible = CAMPFIRE_SPRITES.filter((s) => stage >= s.from);

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

  const total = campCartTotal(cart, actions);
  const count = campCartCount(cart);
  const shownTotal = useTweened(total - hold, 500);

  const badgeRect = useCallback(() => badgeRef.current?.getBoundingClientRect() ?? null, []);

  const burst = (setter: typeof setEmbers, x: number, y: number, ms: number) => {
    const id = nextId.current++;
    setter((list) => [...list, { id, x, y }]);
    window.setTimeout(() => setter((list) => list.filter((b) => b.id !== id)), ms);
  };

  const act = (ids: CampActionId[], source: HTMLElement | null) => {
    const amount = ids.reduce((sum, id) => sum + priceOf(id), 0);
    setCart((c) => ids.reduce((next, id) => ({ ...next, [id]: next[id] + 1 }), c));
    setPoints((p) => p + ids.length);
    setThanks(null);
    const from = source?.getBoundingClientRect();
    if (!from || prefersReducedMotion()) {
      setPulse((p) => p + 1);
      setFlare((f) => f + 1);
      return;
    }
    setHold((h) => h + amount);
    setCoins((list) => [...list, { id: nextId.current++, from, amount }]);
    burst(setEmbers, from.left + from.width / 2, from.top + from.height / 2, 1000);
  };

  const actRef = useRef(act);
  useEffect(() => {
    actRef.current = act;
  });
  useEffect(() => onDemoFill(() => actRef.current(DEMO_CAMP_ACTIONS, demoRef.current)), []);

  const landed = (coin: Coin, x: number, y: number) => {
    setCoins((list) => list.filter((c) => c.id !== coin.id));
    setHold((h) => Math.max(0, h - coin.amount));
    setPulse((p) => p + 1);
    setFlare((f) => f + 1);
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
    setCart(EMPTY_CAMP_CART);
    setCheckout(false);
  };

  const flameW = FIRE_RING.w * FLAME_SCALE[stage];
  const fireflies = FIREFLIES.slice(0, stage >= 3 ? 22 : stage >= 1 ? 12 : 6);

  return (
    <div className="campfire-view flex min-h-[100dvh] flex-col gap-3 bg-[#eef0ea] p-3 text-[#1f3d2b] lg:h-screen lg:overflow-hidden">
      <header className="flex shrink-0 flex-col gap-3 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl bg-[#e3e9dc] px-5 py-3.5 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex shrink-0 items-center gap-3">
            {onBack ? (
              <button type="button" onClick={onBack} aria-label="Back to campaign">
                <CampIcon />
              </button>
            ) : (
              <CampIcon />
            )}
            <h1 className="text-lg font-semibold leading-tight tracking-tight">{title}</h1>
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
                <span data-testid="campfire-raised" className="text-base font-bold text-[#1f3d2b]">
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
              {count} camp action{count === 1 ? "" : "s"}
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
        <section className="race-scene relative min-h-[420px] flex-1 overflow-hidden bg-[#0b1430]" aria-label="Campfire clearing at night">
          <div className="race-stage" data-stage={stage} style={{ backgroundImage: "url(/images/campfire/campfire-bg.jpg)" }}>
            <div className="campfire-dark" style={{ opacity: [0.35, 0.18, 0.06, 0, 0][stage] }} aria-hidden />
            {stage >= 1 ? (
              <div
                className="campfire-glow"
                style={{ left: `${FIRE_RING.x}%`, top: `${FIRE_RING.y - 4}%`, opacity: [0, 0.45, 0.75, 0.85, 1][stage] }}
                aria-hidden
              />
            ) : null}

            {fireflies.map((f, i) => (
              <i
                key={i}
                className="campfire-firefly"
                style={{ left: `${f.x}%`, top: `${f.y}%`, animationDuration: `${f.d}s`, animationDelay: `${f.delay}s` }}
                aria-hidden
              />
            ))}
            {stage >= 3
              ? LAKE_FIREFLIES.map((f, i) => (
                  <i
                    key={`lake-${i}`}
                    className="campfire-firefly campfire-firefly-lake"
                    style={{ left: `${f.x}%`, top: `${f.y}%`, animationDuration: `${f.d}s`, animationDelay: `${f.delay}s` }}
                    aria-hidden
                  />
                ))
              : null}

            {stage >= 3 ? (
              <svg className="campfire-lights" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-label="Fairy lights strung across the trees" role="img">
                {LIGHT_STRINGS.map((s, i) => (
                  <g key={i}>
                    <path
                      d={`M${s.from[0]} ${s.from[1]} Q${s.ctrl[0]} ${s.ctrl[1]} ${s.to[0]} ${s.to[1]}`}
                      fill="none"
                      stroke="#3a2a1a"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                    {bulbs(s).map(([x, y], k) => (
                      <circle
                        key={k}
                        cx={x}
                        cy={y + 4}
                        r="6"
                        fill={["#ffd36b", "#fff1b8", "#ffb867"][k % 3]}
                        className="campfire-bulb"
                        style={{ animationDelay: `${(k % 4) * 0.4}s` }}
                      />
                    ))}
                  </g>
                ))}
              </svg>
            ) : null}

            {stage === 4 ? (
              <div className="campfire-sky" aria-hidden>
                {SHOOTING_STARS.map((i) => (
                  <i key={i} className="campfire-shooting" style={{ left: `${20 + i * 18}%`, top: `${4 + (i % 2) * 8}%`, animationDelay: `${i * 1.3}s` }} />
                ))}
                {FIREWORKS.map((f, i) => (
                  <span key={i} className="campfire-firework" style={{ left: `${f.x}%`, top: `${f.y}%`, color: f.c, animationDelay: `${f.delay}s` }}>
                    {Array.from({ length: 10 }, (_, k) => (
                      <b key={k} style={{ transform: `rotate(${k * 36}deg)` }} />
                    ))}
                  </span>
                ))}
              </div>
            ) : null}

            {visible.map((s) => (
              <div
                key={s.id}
                className="shelter-sprite"
                data-sprite={s.id}
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, zIndex: Math.round(s.y) }}
              >
                <img src={s.src} alt={s.label} className={`gp-pop block w-full ${s.flip ? "-scale-x-100" : ""}`} />
              </div>
            ))}

            <div
              className="campfire-fire"
              data-testid="campfire-flame"
              style={{ left: `${FIRE_RING.x}%`, top: `${FIRE_RING.y}%`, width: `${Math.max(flameW, FIRE_RING.w * 0.4)}%`, zIndex: Math.round(FIRE_RING.y) }}
            >
              <div key={flare} className={flare ? "campfire-flare" : ""}>
                {stage >= 1 ? (
                  <img src="/images/campfire/camp-flame.png" alt={stage === 4 ? "Blazing campfire" : "Crackling campfire"} className="campfire-flicker block w-full" />
                ) : (
                  <span className="sr-only">Unlit fire ring</span>
                )}
              </div>
              {flare ? (
                <span key={`e${flare}`} className="campfire-embers campfire-embers-fire" aria-hidden>
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              ) : null}
            </div>

            {stage === 4 ? (
              <div className="campfire-banner" role="status">
                <div className="garden-plaque-card rounded-md px-4 py-1.5 text-center text-[13px] font-extrabold text-[#fff6e4] shadow-md">
                  ✨ The Campfire Is Lit! Thank You for Keeping Us Warm!
                </div>
              </div>
            ) : null}

            <div className="campfire-sign" aria-label={`Shared campaign growth: Campfire ${rounded}%`}>
              <div className="garden-sign rounded-md px-3 py-1.5 text-center text-[#3b2410]">
                <p className="text-[11px] font-semibold leading-tight">Shared campaign growth</p>
                <p data-testid="campfire-stage" className="text-[10px] font-medium leading-tight">
                  Campfire · {rounded}%
                </p>
              </div>
              <div className="mx-auto h-10 w-2.5 rounded-b-sm bg-[#6a4320] shadow-[inset_-2px_0_0_rgba(0,0,0,0.25)]" />
            </div>
          </div>

          <div className="relative z-[120] max-w-md p-6 sm:p-8">
            <h2 className="text-3xl font-bold leading-tight text-white drop-shadow-md">Keep our campfire burning.</h2>
            <p className="mt-1 max-w-md text-sm text-emerald-100/90 drop-shadow">
              {description || `Support ${organizationName} and help us gather around the fire.`}
            </p>
          </div>

          {unlocked && stage < 4 ? (
            <p
              role="status"
              className="gp-unlock absolute left-1/2 top-5 z-[130] -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-4 py-1.5 text-sm font-bold text-[#2f5a3f] shadow-md"
            >
              🔥 {CAMPFIRE_UNLOCK_MESSAGES[stage]}
            </p>
          ) : null}

          {thanks !== null ? (
            <p
              role="status"
              className="gp-unlock absolute bottom-4 right-4 z-[130] max-w-xs rounded-xl bg-white/95 px-4 py-2.5 text-sm font-medium text-[#2f5a3f] shadow-md"
            >
              Thank you! Your {formatUsd(thanks)} pledge keeps the fire going. No payment was taken — it&apos;s recorded in this browser.
            </p>
          ) : null}
        </section>

        <div className="relative z-10 flex shrink-0 flex-wrap items-stretch gap-3 border-t border-black/5 bg-white p-3">
          <button
            ref={demoRef}
            type="button"
            onClick={(e) => act(DEMO_CAMP_ACTIONS, e.currentTarget)}
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
              data-camp={a.id}
              aria-label={`${a.label}, ${formatUsd(a.price)}`}
              onClick={(e) => act([a.id], e.currentTarget)}
              className="relative flex min-w-[120px] flex-1 items-center gap-3 rounded-xl border border-black/5 bg-[#f7f5ef] px-4 py-2 text-left transition hover:-translate-y-0.5 hover:border-[#2f5a3f]/30 hover:bg-[#eef3e8] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5a3f] sm:max-w-[170px]"
            >
              <span className="text-2xl" aria-hidden>
                {a.emoji}
              </span>
              <span>
                <span className="block whitespace-nowrap text-sm text-[#1f3d2b]/65">{a.label}</span>
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
              <p className="text-sm text-[#1f3d2b]/75">Your camp points</p>
              <p data-testid="camp-points" className="text-2xl font-bold leading-none">
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

      {embers.map((p) => (
        <span key={p.id} aria-hidden className="campfire-embers" style={{ left: p.x, top: p.y }}>
          <i />
          <i />
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
          description={`Every camp action helps ${organizationName} keep the fire burning.`}
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
              <p className="text-sm text-[var(--color-text-muted)]">Pick Add Firewood, Pitch Tent or Fairy Lights, or enter any amount below.</p>
            )}
            <div>
              <label htmlFor="campfire-amount" className="block text-sm font-semibold">
                Contribution amount
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input
                  id="campfire-amount"
                  inputMode="numeric"
                  autoFocus
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setAmountError("");
                  }}
                  placeholder="25"
                  aria-invalid={Boolean(amountError)}
                  aria-describedby="campfire-amount-note"
                  className="corise-input"
                  style={{ paddingLeft: 26 }}
                />
              </div>
              {amountError ? <p className="mt-2 text-xs font-medium text-[var(--color-danger)]">{amountError}</p> : null}
              <p id="campfire-amount-note" className="mt-2 text-xs text-[var(--color-text-muted)]">
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
