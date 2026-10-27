"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useTweened } from "@/components/campaign/CampaignGamifiedProgress";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { onDemoFill } from "@/lib/demo-data";
import { formatUsd, parsePledge, progressPercent, stageFor, takePledge } from "@/lib/progress";
import {
  CASTLE_BUILDERS,
  CASTLE_STAGE_IMAGES,
  CASTLE_UNLOCK_MESSAGES,
  DEMO_BUILD_ACTIONS,
  EMPTY_BUILD_CART,
  buildActions,
  buildCartCount,
  buildCartTotal,
  type BuildActionId,
  type BuildCart,
} from "@/lib/castle";
import type { CastlePrices } from "@/types/corise";

type Coin = { id: number; from: DOMRect; amount: number; builder: string | null };
type Burst = { id: number; x: number; y: number };

const COIN_MS = 950;
const FIREWORKS = [
  { x: 52, y: 14, c: "#ffcf4a", delay: 0 },
  { x: 72, y: 8, c: "#ff6b8a", delay: 0.9 },
  { x: 88, y: 18, c: "#6bc7ff", delay: 1.8 },
  { x: 62, y: 24, c: "#b28bff", delay: 2.5 },
];

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** A gold coin that arcs along a quadratic Bezier from the build tile to the contribution badge. */
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

function CastleIcon() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden>
      <path d="M8 16h6v-4h3v4h6v-4h3v4h6v20H8Z" fill="#b9ad9a" stroke="#6f6454" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5 12h3v-3h2v3h2v24H5ZM28 12h2v-3h2v3h3v24h-7Z" fill="#a69a86" stroke="#6f6454" strokeWidth="1.2" />
      <path d="M17 36v-8a3 3 0 0 1 6 0v8" fill="#7a4e25" />
      <path d="M8.5 9V3l5 2-5 2" fill="#d6463b" stroke="#8a2a22" strokeWidth="0.8" />
      <path d="M31 9V3l5 2-5 2" fill="#3c8fd6" stroke="#245c8c" strokeWidth="0.8" />
      <rect x="11" y="20" width="2" height="4" rx="1" fill="#4a4238" />
      <rect x="27" y="20" width="2" height="4" rx="1" fill="#4a4238" />
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

export function CastleView({
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
  prices?: Partial<CastlePrices>;
  onPledge: (amount: number) => number | false;
  /** Present when launched from the campaign details page — returns there. */
  onBack?: () => void;
  /** Present when the campaign offers both views — lets supporters switch to the plain Direct Pay form. */
  payToggle?: { onSwitch: () => void };
}) {
  const actions = buildActions(prices);
  const priceOf = (id: BuildActionId) => actions.find((a) => a.id === id)?.price ?? 0;
  const demoTotal = DEMO_BUILD_ACTIONS.reduce((sum, id) => sum + priceOf(id), 0);

  const [cart, setCart] = useState<BuildCart>(EMPTY_BUILD_CART);
  const [points, setPoints] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [dust, setDust] = useState<Burst[]>([]);
  const [flashes, setFlashes] = useState<Burst[]>([]);
  const [hold, setHold] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [tap, setTap] = useState<{ id: string; n: number } | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [amountError, setAmountError] = useState("");
  const [thanks, setThanks] = useState<number | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLButtonElement>(null);
  const builderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const nextId = useRef(1);

  const percent = progressPercent(current, target);
  const stage = stageFor(percent);
  const shownPercent = useTweened(percent);
  const rounded = Math.floor(percent);
  const builders = CASTLE_BUILDERS.filter((b) => stage >= b.from && stage <= b.to);

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

  const total = buildCartTotal(cart, actions);
  const count = buildCartCount(cart);
  const shownTotal = useTweened(total - hold, 500);

  const badgeRect = useCallback(() => badgeRef.current?.getBoundingClientRect() ?? null, []);

  const burst = (setter: typeof setDust, x: number, y: number, ms: number) => {
    const id = nextId.current++;
    setter((list) => [...list, { id, x, y }]);
    window.setTimeout(() => setter((list) => list.filter((b) => b.id !== id)), ms);
  };

  /** The visible animal builder closest to where the supporter clicked. */
  const nearestBuilder = (x: number): string | null => {
    let best: string | null = null;
    let bestDist = Infinity;
    for (const b of builders) {
      const el = builderRefs.current[b.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - x);
      if (d < bestDist) {
        bestDist = d;
        best = b.id;
      }
    }
    return best;
  };

  const build = (ids: BuildActionId[], source: HTMLElement | null) => {
    const amount = ids.reduce((sum, id) => sum + priceOf(id), 0);
    setCart((c) => ids.reduce((next, id) => ({ ...next, [id]: next[id] + 1 }), c));
    setPoints((p) => p + ids.length);
    setThanks(null);
    const from = source?.getBoundingClientRect();
    const builder = nearestBuilder(from ? from.left + from.width / 2 : 0);
    if (!from || prefersReducedMotion()) {
      setPulse((p) => p + 1);
      if (builder) setTap((t) => ({ id: builder, n: (t?.n ?? 0) + 1 }));
      return;
    }
    setHold((h) => h + amount);
    setCoins((list) => [...list, { id: nextId.current++, from, amount, builder }]);
    burst(setDust, from.left + from.width / 2, from.top + from.height / 2, 900);
  };

  const buildRef = useRef(build);
  useEffect(() => {
    buildRef.current = build;
  });
  useEffect(() => onDemoFill(() => buildRef.current(DEMO_BUILD_ACTIONS, demoRef.current)), []);

  const landed = (coin: Coin, x: number, y: number) => {
    setCoins((list) => list.filter((c) => c.id !== coin.id));
    setHold((h) => Math.max(0, h - coin.amount));
    setPulse((p) => p + 1);
    if (coin.builder) setTap((t) => ({ id: coin.builder as string, n: (t?.n ?? 0) + 1 }));
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
    const taken = takePledge(parsed.amount, onPledge);
    if (!taken.ok) {
      setAmountError(taken.error);
      return;
    }
    setThanks(taken.accepted);
    setCart(EMPTY_BUILD_CART);
    setCheckout(false);
  };

  return (
    <div className="castle-view flex min-h-[100dvh] flex-col gap-3 bg-[#f1efe6] p-3 text-[#1f3d2b] lg:h-screen lg:overflow-hidden">
      <header className="flex shrink-0 flex-col gap-3 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl bg-[#e3e9dc] px-5 py-3.5 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex shrink-0 items-center gap-3">
            {onBack ? (
              <button type="button" onClick={onBack} aria-label="Back to campaign">
                <CastleIcon />
              </button>
            ) : (
              <CastleIcon />
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
                <span data-testid="castle-raised" className="text-base font-bold text-[#1f3d2b]">
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
              {count} build action{count === 1 ? "" : "s"}
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
        <section className="race-scene relative min-h-[420px] flex-1 overflow-hidden" aria-label="Castle construction site">
          <div className="race-stage" data-stage={stage}>
            {CASTLE_STAGE_IMAGES.map((src, i) => (
              <div
                key={src}
                className="castle-layer"
                style={{ backgroundImage: `url(${src})`, opacity: i === stage ? 1 : 0 }}
                role={i === stage ? "img" : undefined}
                aria-label={i === stage ? `Castle construction: ${CASTLE_UNLOCK_MESSAGES[stage]}` : undefined}
                aria-hidden={i === stage ? undefined : true}
              />
            ))}

            {stage === 4 ? (
              <div className="campfire-sky" aria-hidden>
                {FIREWORKS.map((f, i) => (
                  <span key={i} className="campfire-firework" style={{ left: `${f.x}%`, top: `${f.y}%`, color: f.c, animationDelay: `${f.delay}s` }}>
                    {Array.from({ length: 10 }, (_, k) => (
                      <b key={k} style={{ transform: `rotate(${k * 36}deg)` }} />
                    ))}
                  </span>
                ))}
              </div>
            ) : null}

            {builders.map((b) => (
              <div
                key={b.id}
                ref={(el) => {
                  builderRefs.current[b.id] = el;
                }}
                className="shelter-sprite"
                data-builder={b.id}
                style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, zIndex: Math.round(b.y) }}
              >
                <div
                  key={tap?.id === b.id ? tap.n : 0}
                  className={`gp-pop ${tap?.id === b.id ? "castle-tap" : ""} ${stage === 4 ? "castle-cheer" : ""}`}
                >
                  <img src={b.src} alt={b.label} className={`block w-full ${b.flip ? "-scale-x-100" : ""}`} />
                </div>
              </div>
            ))}

            {stage === 4 ? (
              <div className="castle-banner" role="status">
                <div className="castle-banner-cloth px-5 py-1.5 text-center text-[13px] font-extrabold text-[#fff6e4] shadow-md">
                  🏰 Castle Complete! Thank You, Master Builders!
                </div>
              </div>
            ) : null}

            <div className="castle-sign" aria-label={`Shared campaign growth: Castle ${rounded}%`}>
              <div className="garden-sign rounded-md px-3 py-1.5 text-center text-[#3b2410]">
                <p className="text-[11px] font-semibold leading-tight">Shared campaign growth</p>
                <p data-testid="castle-stage" className="text-[10px] font-medium leading-tight">
                  Castle · {rounded}%
                </p>
              </div>
              <div className="mx-auto h-12 w-2.5 rounded-b-sm bg-[#7a4e25] shadow-[inset_-2px_0_0_rgba(0,0,0,0.18)]" />
            </div>
          </div>

          <div className="relative z-[120] max-w-md p-6 sm:p-8">
            <h2 className="text-3xl font-bold leading-tight text-emerald-950">Help us build our new castle!</h2>
            <p className="mt-1 max-w-md text-sm text-emerald-900/80">
              {description || `Support ${organizationName} and help our animal builders construct a storybook stone castle.`}
            </p>
          </div>

          {unlocked && stage < 4 ? (
            <p
              role="status"
              className="gp-unlock absolute left-1/2 top-5 z-[130] -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-4 py-1.5 text-sm font-bold text-[#2f5a3f] shadow-md"
            >
              🏗️ {CASTLE_UNLOCK_MESSAGES[stage]}
            </p>
          ) : null}

          {thanks !== null ? (
            <p
              role="status"
              className="gp-unlock absolute bottom-4 left-4 z-[130] max-w-xs rounded-xl bg-white/95 px-4 py-2.5 text-sm font-medium text-[#2f5a3f] shadow-md"
            >
              Thank you! Your {formatUsd(thanks)} pledge adds to the castle. No payment was taken — it&apos;s recorded in this browser.
            </p>
          ) : null}
        </section>

        <div className="relative z-10 flex shrink-0 flex-wrap items-stretch gap-3 border-t border-black/5 bg-white p-3">
          <button
            ref={demoRef}
            type="button"
            onClick={(e) => build(DEMO_BUILD_ACTIONS, e.currentTarget)}
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
              data-build={a.id}
              aria-label={`${a.label}, ${formatUsd(a.price)}`}
              onClick={(e) => build([a.id], e.currentTarget)}
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
              <p className="text-sm text-[#1f3d2b]/75">Your builder points</p>
              <p data-testid="builder-points" className="text-2xl font-bold leading-none">
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

      {dust.map((p) => (
        <span key={p.id} aria-hidden className="castle-dust" style={{ left: p.x, top: p.y }}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <em>✨</em>
          <em>✨</em>
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
          description={`Every build action helps ${organizationName} finish the castle.`}
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
              <p className="text-sm text-[var(--color-text-muted)]">Pick Stone Block, Arched Window or Turret Flag, or enter any amount below.</p>
            )}
            <div>
              <label htmlFor="castle-amount" className="block text-sm font-semibold">
                Contribution amount
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input
                  id="castle-amount"
                  inputMode="numeric"
                  autoFocus
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setAmountError("");
                  }}
                  placeholder="25"
                  aria-invalid={Boolean(amountError)}
                  aria-describedby="castle-amount-note"
                  className="corise-input"
                  style={{ paddingLeft: 26 }}
                />
              </div>
              {amountError ? <p className="mt-2 text-xs font-medium text-[var(--color-danger)]">{amountError}</p> : null}
              <p id="castle-amount-note" className="mt-2 text-xs text-[var(--color-text-muted)]">
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
