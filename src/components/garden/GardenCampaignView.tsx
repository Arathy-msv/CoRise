"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useTweened } from "@/components/campaign/CampaignGamifiedProgress";
import { publicAsset } from "@/lib/public-asset";
import { GardenTree } from "@/components/garden/GardenTree";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { onDemoFill } from "@/lib/demo-data";
import type { CarePrices } from "@/types/corise";
import {
  careActions,
  DEMO_CARE_ACTION,
  EMPTY_CART,
  GARDEN_STAGE_NAMES,
  GARDEN_UNLOCK_MESSAGES,
  addCare,
  careAction,
  cartActionCount,
  cartTotal,
  type CareActionId,
  type CareCart,
} from "@/lib/garden";
import { formatUsd, parsePledge, progressPercent, stageFor } from "@/lib/progress";

type Coin = { id: number; from: DOMRect; amount: number };
type Sparkle = { id: number; x: number; y: number };

const COIN_MS = 950;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** A gold coin that arcs along a quadratic Bezier from the clicked tile to the contribution badge. */
function FlyingCoin({
  from,
  amount,
  target,
  onArrive,
}: {
  from: DOMRect;
  amount: number;
  target: () => DOMRect | null;
  onArrive: (x: number, y: number) => void;
}) {
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
    const cx = sx + (ex - sx) * 0.2;
    const cy = Math.max(16, Math.min(sy, ey) - 60);
    const frames = Array.from({ length: 28 }, (_, i) => {
      const t = i / 27;
      const u = 1 - t;
      const x = u * u * sx + 2 * u * t * cx + t * t * ex;
      const y = u * u * sy + 2 * u * t * cy + t * t * ey;
      const scale = 1 - 0.35 * t;
      return { transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})` };
    });
    const anim = el.animate(frames, { duration: COIN_MS, easing: "cubic-bezier(0.45, 0.05, 0.4, 1)", fill: "forwards" });
    anim.onfinish = () => arrive.current(ex, ey);
    return () => anim.cancel();
  }, [from, target]);

  return (
    <span ref={ref} aria-hidden className="garden-coin">
      <img src={publicAsset("/images/garden/gold-coin.png")} alt="" />
      <span className="garden-suggested">
        +{formatUsd(amount)}
        <br />
        suggested
      </span>
    </span>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5Z" />
      <path d="M12 6.5v13M6 9h3M6 12h3M15 9h3M15 12h3" />
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

export function GardenCampaignView({
  title,
  organizationName,
  current,
  target,
  onPledge,
  onBack,
  payToggle,
  prices,
}: {
  title: string;
  organizationName: string;
  current: number;
  target: number;
  onPledge: (amount: number) => void;
  prices?: Partial<CarePrices>;
  /** Present when launched from the campaign details page — returns there. */
  onBack?: () => void;
  /** Present when the campaign offers both views — lets supporters switch to the plain Direct Pay form. */
  payToggle?: { onSwitch: () => void };
}) {
  const [cart, setCart] = useState<CareCart>(EMPTY_CART);
  const [points, setPoints] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [sceneFx, setSceneFx] = useState<{ id: number; action: "water" | "fertilizer" } | null>(null);
  const [hold, setHold] = useState(0);
  const plantRef = useRef<HTMLDivElement>(null);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [pulse, setPulse] = useState(0);
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

  const pricedActions = careActions(prices);
  const total = cartTotal(cart, prices);
  const actions = cartActionCount(cart);
  const shownTotal = useTweened(total - hold, 500);

  const badgeRect = useCallback(() => badgeRef.current?.getBoundingClientRect() ?? null, []);

  const release = (amount: number) => {
    setHold((h) => Math.max(0, h - amount));
    setPulse((p) => p + 1);
  };

  const care = (id: CareActionId, source: HTMLElement | null) => {
    const action = careAction(id, prices);
    setCart((c) => addCare(c, id));
    setPoints((p) => p + action.points);
    setThanks(null);
    if (!source || prefersReducedMotion()) {
      setPulse((p) => p + 1);
      return;
    }
    setHold((h) => h + action.price);
    if (id === "sunlight") {
      const plant = plantRef.current?.getBoundingClientRect();
      const from = plant
        ? new DOMRect(plant.left + plant.width / 2 - 20, plant.top + plant.height * 0.45, 40, 40)
        : source.getBoundingClientRect();
      setCoins((list) => [...list, { id: nextId.current++, from, amount: action.price }]);
      return;
    }
    const fxId = nextId.current++;
    setSceneFx({ id: fxId, action: id });
    window.setTimeout(() => {
      setSceneFx((currentFx) => (currentFx?.id === fxId ? null : currentFx));
      release(action.price);
    }, 1600);
  };

  const careRef = useRef(care);
  useEffect(() => {
    careRef.current = care;
  });
  useEffect(() => onDemoFill(() => careRef.current(DEMO_CARE_ACTION, demoRef.current)), []);

  const landed = (id: number, amount: number, x: number, y: number) => {
    setCoins((list) => list.filter((c) => c.id !== id));
    release(amount);
    const sparkleId = nextId.current++;
    setSparkles((list) => [...list, { id: sparkleId, x, y }]);
    window.setTimeout(() => setSparkles((list) => list.filter((s) => s.id !== sparkleId)), 650);
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
    setCart(EMPTY_CART);
    setCheckout(false);
  };

  return (
    <div className="garden-view flex min-h-[100dvh] flex-col gap-3 bg-[#f3f0e6] p-3 text-[#1f3d2b] lg:h-screen lg:overflow-hidden">
      <header className="flex shrink-0 flex-col gap-3 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl bg-[#e3e9dc] px-5 py-3.5 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex shrink-0 items-center gap-3">
            {onBack ? (
              <button type="button" onClick={onBack} aria-label="Back to campaign" className="text-[#2f5a3f] hover:text-[#1f3d2b]">
                <BookIcon />
              </button>
            ) : (
              <span className="text-[#2f5a3f]">
                <BookIcon />
              </span>
            )}
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
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
                <span data-testid="garden-raised" className="text-base font-bold text-[#1f3d2b]">
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
              <span className="mx-1.5">•</span>
              {actions} care action{actions === 1 ? "" : "s"}
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
        <section
          className="relative min-h-[420px] flex-1 bg-cover bg-center"
          style={{ backgroundImage: `url(${publicAsset("/images/garden/garden-bg.jpg")})` }}
          aria-label="Our shared garden"
        >
          <div className="relative z-10 max-w-md p-6 sm:p-8">
            <h2 className="font-serif text-3xl font-bold leading-tight text-[#1c3d29] sm:text-[34px]">
              Every little action can help us grow.
            </h2>
            <p className="mt-3 max-w-md text-sm text-emerald-900/80">
              Care for our shared tree and, together, we can grow a greener, brighter {title.toLowerCase()}.
            </p>
          </div>

          {unlocked ? (
            <p
              role="status"
              className="gp-unlock absolute left-1/2 top-5 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-4 py-1.5 text-sm font-bold text-[#2f5a3f] shadow-md"
            >
              🎉 {GARDEN_UNLOCK_MESSAGES[stage]}
            </p>
          ) : null}

          {thanks !== null ? (
            <p
              role="status"
              className="gp-unlock absolute bottom-4 left-4 z-20 max-w-xs rounded-xl bg-white/95 px-4 py-2.5 text-sm font-medium text-[#2f5a3f] shadow-md"
            >
              Thank you! Your {formatUsd(thanks)} pledge helps our garden grow. No payment was taken — it&apos;s recorded in this browser.
            </p>
          ) : null}

          <div ref={plantRef} className="pointer-events-none absolute bottom-0 left-1/2 h-[78%] w-[min(560px,70%)] -translate-x-1/2" data-stage={stage}>
            <GardenTree stage={stage} className="h-full w-full" />
            {sceneFx?.action === "water" ? (
              <div key={sceneFx.id} className="garden-water" aria-hidden>
                <img src={publicAsset("/images/garden/watering-can.png")} alt="" className="garden-can" />
                <span className="garden-drops">
                  {Array.from({ length: 7 }, (_, i) => (
                    <i key={i} style={{ animationDelay: `${i * 0.12}s`, left: `${46 + (i % 3) * 4}%` }} />
                  ))}
                </span>
              </div>
            ) : null}
            {sceneFx?.action === "fertilizer" ? (
              <div key={sceneFx.id} className="garden-feed" aria-hidden>
                <svg className="garden-roots" viewBox="0 0 220 90">
                  <path d="M110 8 C90 30 70 40 40 70" />
                  <path d="M110 8 C110 36 108 50 110 82" />
                  <path d="M110 8 C130 28 155 42 186 68" />
                  <path d="M110 20 C80 34 60 36 48 44" />
                  <path d="M110 20 C140 32 160 36 176 46" />
                </svg>
                <img src={publicAsset("/images/garden/fertilizer-scoop.png")} alt="" className="garden-scoop" />
                <span className="garden-pellets">
                  {Array.from({ length: 8 }, (_, i) => (
                    <i key={i} style={{ animationDelay: `${i * 0.08}s` }} />
                  ))}
                </span>
              </div>
            ) : null}
          </div>

          <div className="pointer-events-none absolute bottom-[9%] left-[62%] hidden sm:block" aria-label={`Shared campaign growth: ${GARDEN_STAGE_NAMES[stage]}, ${rounded}%`}>
            <div className="garden-sign rounded-md px-3 py-1.5 text-center text-[#3b2410]">
              <p className="text-[11px] font-semibold leading-tight">Shared campaign growth</p>
              <p data-testid="garden-stage" className="text-[10px] font-medium leading-tight">
                {GARDEN_STAGE_NAMES[stage]} · {rounded}%
              </p>
            </div>
            <div className="mx-auto h-12 w-2.5 rounded-b-sm bg-[#7a4e25] shadow-[inset_-2px_0_0_rgba(0,0,0,0.18)]" />
          </div>
        </section>

        <div className="relative z-10 flex shrink-0 flex-wrap items-stretch gap-3 border-t border-black/5 bg-white p-3">
          <button
            ref={demoRef}
            type="button"
            onClick={(e) => care(DEMO_CARE_ACTION, e.currentTarget)}
            className="flex min-w-[140px] flex-col items-start justify-center rounded-xl border-2 border-[#2f5a3f] bg-white px-3 py-2 text-left transition hover:bg-[#f3f7ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5a3f]"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="rounded-full bg-[#fde9a8] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#7a5a0a]">DEMO</span>
              Fill demo values
            </span>
            <span className="mt-0.5 text-base font-bold">{formatUsd(careAction(DEMO_CARE_ACTION, prices).price)}</span>
          </button>

          {pricedActions.map((a) => (
            <button
              key={a.id}
              type="button"
              data-care={a.id}
              aria-label={`${a.label}, ${formatUsd(a.price)}`}
              onClick={(e) => care(a.id, e.currentTarget)}
              className="relative flex min-w-[120px] flex-1 items-center gap-3 rounded-xl border border-black/5 bg-[#f7f5ef] px-4 py-2 text-left transition hover:-translate-y-0.5 hover:border-[#2f5a3f]/30 hover:bg-[#eef3e8] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5a3f] sm:max-w-[150px]"
            >
              <span className="text-xl" aria-hidden>
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
              <p className="text-sm text-[#1f3d2b]/75">Your care points</p>
              <p data-testid="care-points" className="text-2xl font-bold leading-none">
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

      {coins.map((c) => (
        <FlyingCoin key={c.id} from={c.from} amount={c.amount} target={badgeRect} onArrive={(x, y) => landed(c.id, c.amount, x, y)} />
      ))}
      {sparkles.map((s) => (
        <span key={s.id} aria-hidden className="garden-sparkle" style={{ left: s.x, top: s.y }}>
          ✨
        </span>
      ))}

      {checkout ? (
        <Modal
          title="Review your contribution"
          description={`Every care action helps ${organizationName} grow ${title}.`}
          onClose={() => setCheckout(false)}
        >
          <form onSubmit={confirm} noValidate className="space-y-4">
            {actions > 0 ? (
              <ul className="divide-y divide-black/5 rounded-xl bg-[#f7f5ef] px-4">
                {pricedActions.filter((a) => cart[a.id] > 0).map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span>
                      <span aria-hidden>{a.emoji}</span> {a.label} × {cart[a.id]}
                    </span>
                    <span className="font-semibold">{formatUsd(a.price * cart[a.id])}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Pick Water, Fertilizer or Sunlight, or enter any amount below.</p>
            )}
            <div>
              <label htmlFor="garden-amount" className="block text-sm font-semibold">
                Contribution amount
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input
                  id="garden-amount"
                  inputMode="numeric"
                  autoFocus
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setAmountError("");
                  }}
                  placeholder="25"
                  aria-invalid={Boolean(amountError)}
                  aria-describedby="garden-amount-note"
                  className="corise-input"
                  style={{ paddingLeft: 26 }}
                />
              </div>
              {amountError ? <p className="mt-2 text-xs font-medium text-[var(--color-danger)]">{amountError}</p> : null}
              <p id="garden-amount-note" className="mt-2 text-xs text-[var(--color-text-muted)]">
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
