import type { ProgressStage } from "@/lib/progress";
import type { PitPrices } from "@/types/corise";

export type PitActionId = "nitro" | "tire" | "tune";

export type PitAction = { id: PitActionId; label: string; emoji: string; price: number };

export const DEFAULT_PIT_PRICES: PitPrices = { nitro: 50, tire: 25, tune: 15 };

const PIT_META: { id: PitActionId; label: string; emoji: string }[] = [
  { id: "nitro", label: "Nitro Boost", emoji: "🔥" },
  { id: "tire", label: "Super Tire", emoji: "🛞" },
  { id: "tune", label: "Tune Up", emoji: "🔧" },
];

export const PIT_PRICE_FIELDS = PIT_META;

/** Pit-stop actions with this campaign's prices, falling back to the defaults. */
export function pitActions(prices?: Partial<PitPrices>): PitAction[] {
  return PIT_META.map((m) => {
    const p = prices?.[m.id];
    return { ...m, price: Number.isFinite(p) && (p as number) > 0 ? Math.round(p as number) : DEFAULT_PIT_PRICES[m.id] };
  });
}

/** What "Fill demo values" adds: one Nitro Boost and one Super Tire ($75 at default prices). */
export const DEMO_PIT_ACTIONS: PitActionId[] = ["nitro", "tire"];

export type PitCart = Record<PitActionId, number>;

export const EMPTY_PIT_CART: PitCart = { nitro: 0, tire: 0, tune: 0 };

export function pitCartTotal(cart: PitCart, actions: PitAction[]): number {
  return actions.reduce((sum, a) => sum + a.price * cart[a.id], 0);
}

export function pitCartCount(cart: PitCart): number {
  return cart.nitro + cart.tire + cart.tune;
}

export const RACE_STAGE_NAMES: Record<ProgressStage, string> = {
  0: "Starting grid",
  1: "Checkpoint 1",
  2: "Checkpoint 2",
  3: "Checkpoint 3",
  4: "Finish",
};

export const RACE_UNLOCK_MESSAGES: Record<ProgressStage, string> = {
  0: "Engines are running!",
  1: "We passed Checkpoint 1!",
  2: "We reached Checkpoint 2!",
  3: "Checkpoint 3 — final straight!",
  4: "We crossed the finish line!",
};

/**
 * Points along the painted track in race-bg.jpg, as percentages of the 16:9 scene.
 * Index i sits at progress i / (length - 1); checkpoints land on every second point.
 */
export const TRACK_POINTS: [number, number][] = [
  [16, 64],
  [30, 68.5],
  [53, 67.5],
  [75, 62],
  [93, 54],
  [92, 49.5],
  [80, 47.3],
  [65, 46],
  [55, 46],
];

export type TrackPose = { x: number; y: number; scale: number; facingLeft: boolean };

export function trackPose(percent: number): TrackPose {
  const t = Math.min(1, Math.max(0, percent / 100)) * (TRACK_POINTS.length - 1);
  const i = Math.min(TRACK_POINTS.length - 2, Math.floor(t));
  const f = t - i;
  const [x0, y0] = TRACK_POINTS[i];
  const [x1, y1] = TRACK_POINTS[i + 1];
  const y = y0 + (y1 - y0) * f;
  const scale = 0.55 + ((y - 46) / (68.5 - 46)) * 0.45;
  return { x: x0 + (x1 - x0) * f, y, scale: Math.max(0.5, Math.min(1, scale)), facingLeft: x1 < x0 };
}
