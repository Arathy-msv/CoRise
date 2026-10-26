import { publicAsset } from "@/lib/public-asset";
import type { ProgressStage } from "@/lib/progress";
import type { CampfirePrices } from "@/types/corise";

export type CampActionId = "firewood" | "tent" | "lights";

export type CampAction = { id: CampActionId; label: string; emoji: string; price: number };

export const DEFAULT_CAMPFIRE_PRICES: CampfirePrices = { firewood: 15, tent: 35, lights: 50 };

export const CAMP_PRICE_FIELDS: { id: CampActionId; label: string; emoji: string }[] = [
  { id: "firewood", label: "Add Firewood", emoji: "🪵" },
  { id: "tent", label: "Pitch Tent", emoji: "⛺" },
  { id: "lights", label: "Fairy Lights", emoji: "✨" },
];

/** Camp actions with this campaign's prices, falling back to the defaults. */
export function campActions(prices?: Partial<CampfirePrices>): CampAction[] {
  return CAMP_PRICE_FIELDS.map((m) => {
    const p = prices?.[m.id];
    return { ...m, price: Number.isFinite(p) && (p as number) > 0 ? Math.round(p as number) : DEFAULT_CAMPFIRE_PRICES[m.id] };
  });
}

/** What "Fill demo values" adds: one Add Firewood and one Pitch Tent ($50 at default prices). */
export const DEMO_CAMP_ACTIONS: CampActionId[] = ["firewood", "tent"];

export type CampCart = Record<CampActionId, number>;

export const EMPTY_CAMP_CART: CampCart = { firewood: 0, tent: 0, lights: 0 };

export function campCartTotal(cart: CampCart, actions: CampAction[]): number {
  return actions.reduce((sum, a) => sum + a.price * cart[a.id], 0);
}

export function campCartCount(cart: CampCart): number {
  return cart.firewood + cart.tent + cart.lights;
}

export const CAMPFIRE_UNLOCK_MESSAGES: Record<ProgressStage, string> = {
  0: "The fire ring is ready!",
  1: "A small flame is crackling!",
  2: "The tents are glowing!",
  3: "Fairy lights are up!",
  4: "The campfire is lit!",
};

/**
 * Campsite sprites placed on campfire-bg.jpg, as percentages of the 16:9 scene.
 * x is the sprite's center, y its bottom edge, w its width.
 */
export const CAMPFIRE_SPRITES: {
  id: string;
  src: string;
  label: string;
  from: ProgressStage;
  x: number;
  y: number;
  w: number;
  flip?: boolean;
}[] = [
  { id: "crate", src: publicAsset("/images/campfire/camp-crate.png"), label: "Wooden supply crate", from: 0, x: 71, y: 80, w: 6 },
  { id: "tent-left", src: publicAsset("/images/campfire/camp-tent.png"), label: "Glowing canvas tent", from: 1, x: 20, y: 76, w: 20 },
  { id: "tent-mid", src: publicAsset("/images/campfire/camp-tent.png"), label: "Glowing canvas tent", from: 2, x: 35, y: 70, w: 14, flip: true },
  { id: "belltent", src: publicAsset("/images/campfire/camp-belltent.png"), label: "Lit bell tent", from: 2, x: 79, y: 74, w: 21 },
  { id: "log-right", src: publicAsset("/images/campfire/camp-log.png"), label: "Log seat", from: 2, x: 62, y: 76, w: 10 },
  { id: "log-left", src: publicAsset("/images/campfire/camp-log.png"), label: "Log seat", from: 2, x: 38, y: 86, w: 10, flip: true },
];

/** Fire ring position in campfire-bg.jpg. */
export const FIRE_RING = { x: 50, y: 82, w: 11 };
