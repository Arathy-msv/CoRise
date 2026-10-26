import type { ProgressStage } from "@/lib/progress";
import type { CastlePrices } from "@/types/corise";

export type BuildActionId = "stone" | "window" | "flag";

export type BuildAction = { id: BuildActionId; label: string; emoji: string; price: number };

export const DEFAULT_CASTLE_PRICES: CastlePrices = { stone: 15, window: 35, flag: 60 };

export const BUILD_PRICE_FIELDS: { id: BuildActionId; label: string; emoji: string }[] = [
  { id: "stone", label: "Stone Block", emoji: "🧱" },
  { id: "window", label: "Arched Window", emoji: "🪟" },
  { id: "flag", label: "Turret Flag", emoji: "🚩" },
];

/** Build actions with this campaign's prices, falling back to the defaults. */
export function buildActions(prices?: Partial<CastlePrices>): BuildAction[] {
  return BUILD_PRICE_FIELDS.map((m) => {
    const p = prices?.[m.id];
    return { ...m, price: Number.isFinite(p) && (p as number) > 0 ? Math.round(p as number) : DEFAULT_CASTLE_PRICES[m.id] };
  });
}

/** What "Fill demo values" adds: one Stone Block and one Arched Window ($50 at default prices). */
export const DEMO_BUILD_ACTIONS: BuildActionId[] = ["stone", "window"];

export type BuildCart = Record<BuildActionId, number>;

export const EMPTY_BUILD_CART: BuildCart = { stone: 0, window: 0, flag: 0 };

export function buildCartTotal(cart: BuildCart, actions: BuildAction[]): number {
  return actions.reduce((sum, a) => sum + a.price * cart[a.id], 0);
}

export function buildCartCount(cart: BuildCart): number {
  return cart.stone + cart.window + cart.flag;
}

export const CASTLE_UNLOCK_MESSAGES: Record<ProgressStage, string> = {
  0: "The foundation is laid!",
  1: "The fortress walls are up!",
  2: "The watchtowers are rising!",
  3: "The great doors are fitted!",
  4: "The castle is complete!",
};

/** One painted scene per construction stage, all from the same camera. */
export const CASTLE_STAGE_IMAGES = [0, 1, 2, 3, 4].map((i) => `/images/castle/castle-stage${i}.jpg`);

/**
 * Animal builders placed on the castle scenes, as percentages of the 16:9 scene.
 * x is the sprite's center, y its bottom edge, w its width; shown for stages from..to.
 */
export const CASTLE_BUILDERS: {
  id: string;
  src: string;
  label: string;
  from: ProgressStage;
  to: ProgressStage;
  x: number;
  y: number;
  w: number;
  flip?: boolean;
}[] = [
  { id: "bear", src: "/images/castle/builder-bear.png", label: "Bear builder carrying a stone", from: 0, to: 4, x: 40, y: 80, w: 7 },
  { id: "bunny", src: "/images/castle/builder-bunny.png", label: "Bunny builder reading the blueprint", from: 0, to: 4, x: 50, y: 84, w: 6.5 },
  { id: "mouse", src: "/images/castle/builder-mouse.png", label: "Mouse builder with a hammer", from: 1, to: 4, x: 80, y: 77, w: 5, flip: true },
  { id: "mouse-top", src: "/images/castle/builder-mouse.png", label: "Mouse builder on the tower scaffolding", from: 2, to: 2, x: 70.5, y: 34.5, w: 3 },
];
