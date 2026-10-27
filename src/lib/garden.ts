import type { ProgressStage } from "@/lib/progress";
import type { CarePrices } from "@/types/corise";

export type CareActionId = "water" | "fertilizer" | "sunlight";

export type CareAction = { id: CareActionId; label: string; emoji: string; price: number; points: number };

export const DEFAULT_CARE_PRICES: CarePrices = { water: 50, fertilizer: 75, sunlight: 25 };

const CARE_META: { id: CareActionId; label: string; emoji: string; points: number }[] = [
  { id: "water", label: "Water", emoji: "💧", points: 10 },
  { id: "fertilizer", label: "Fertilizer", emoji: "🌱", points: 15 },
  { id: "sunlight", label: "Sunlight", emoji: "☀️", points: 5 },
];

export const CARE_ACTIONS: CareAction[] = CARE_META.map((action) => ({ ...action, price: DEFAULT_CARE_PRICES[action.id] }));

/** Care actions with this campaign's prices, falling back to the defaults. */
export function careActions(prices?: Partial<CarePrices>): CareAction[] {
  return CARE_META.map((action) => {
    const price = prices?.[action.id];
    return {
      ...action,
      price: Number.isFinite(price) && (price as number) > 0 ? Math.round(price as number) : DEFAULT_CARE_PRICES[action.id],
    };
  });
}

/** What the "Fill demo values" tile adds: one Sunlight, the $25 shown on the tile. */
export const DEMO_CARE_ACTION: CareActionId = "sunlight";

export type CareCart = Record<CareActionId, number>;

export const EMPTY_CART: CareCart = { water: 0, fertilizer: 0, sunlight: 0 };

export function careAction(id: CareActionId, prices?: Partial<CarePrices>): CareAction {
  return careActions(prices).find((a) => a.id === id) ?? careActions(prices)[0];
}

export function cartTotal(cart: CareCart, prices?: Partial<CarePrices>): number {
  return careActions(prices).reduce((sum, a) => sum + a.price * cart[a.id], 0);
}

export function cartActionCount(cart: CareCart): number {
  return CARE_ACTIONS.reduce((sum, a) => sum + cart[a.id], 0);
}

export function addCare(cart: CareCart, id: CareActionId): CareCart {
  return { ...cart, [id]: cart[id] + 1 };
}

export const GARDEN_STAGE_NAMES: Record<ProgressStage, string> = {
  0: "Sprout",
  1: "Sapling",
  2: "Blossoming",
  3: "Fruiting",
  4: "Full bloom",
};

export const GARDEN_UNLOCK_MESSAGES: Record<ProgressStage, string> = {
  0: "Our sprout is growing!",
  1: "Our sprout grew into a sapling!",
  2: "Our tree is blossoming!",
  3: "Our tree is bearing fruit!",
  4: "Our garden is in full bloom!",
};
