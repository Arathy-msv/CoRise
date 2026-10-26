import type { ProgressStage } from "@/lib/progress";

export type CareActionId = "water" | "fertilizer" | "sunlight";

export type CareAction = { id: CareActionId; label: string; emoji: string; price: number; points: number };

export const CARE_ACTIONS: CareAction[] = [
  { id: "water", label: "Water", emoji: "💧", price: 50, points: 10 },
  { id: "fertilizer", label: "Fertilizer", emoji: "🌱", price: 75, points: 15 },
  { id: "sunlight", label: "Sunlight", emoji: "☀️", price: 25, points: 5 },
];

/** What the "Fill demo values" tile adds: one Sunlight, the $25 shown on the tile. */
export const DEMO_CARE_ACTION: CareActionId = "sunlight";

export type CareCart = Record<CareActionId, number>;

export const EMPTY_CART: CareCart = { water: 0, fertilizer: 0, sunlight: 0 };

export function careAction(id: CareActionId): CareAction {
  return CARE_ACTIONS.find((a) => a.id === id) ?? CARE_ACTIONS[0];
}

export function cartTotal(cart: CareCart): number {
  return CARE_ACTIONS.reduce((sum, a) => sum + a.price * cart[a.id], 0);
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
