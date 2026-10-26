import { publicAsset } from "@/lib/public-asset";
import type { ProgressStage } from "@/lib/progress";
import type { ShelterPrices } from "@/types/corise";

export type PetActionId = "meal" | "toys" | "vet";

export type PetAction = { id: PetActionId; label: string; emoji: string; price: number };

export const DEFAULT_SHELTER_PRICES: ShelterPrices = { meal: 15, toys: 25, vet: 50 };

export const PET_PRICE_FIELDS: { id: PetActionId; label: string; emoji: string }[] = [
  { id: "meal", label: "Nutritious Meal", emoji: "🥣" },
  { id: "toys", label: "Toy Box", emoji: "🦴" },
  { id: "vet", label: "Vet Care", emoji: "🩺" },
];

/** Pet-care actions with this campaign's prices, falling back to the defaults. */
export function petActions(prices?: Partial<ShelterPrices>): PetAction[] {
  return PET_PRICE_FIELDS.map((m) => {
    const p = prices?.[m.id];
    return { ...m, price: Number.isFinite(p) && (p as number) > 0 ? Math.round(p as number) : DEFAULT_SHELTER_PRICES[m.id] };
  });
}

/** What "Fill demo values" adds: one Toy Box and one Vet Care ($75 at default prices). */
export const DEMO_PET_ACTIONS: PetActionId[] = ["toys", "vet"];

export type PetCart = Record<PetActionId, number>;

export const EMPTY_PET_CART: PetCart = { meal: 0, toys: 0, vet: 0 };

export function petCartTotal(cart: PetCart, actions: PetAction[]): number {
  return actions.reduce((sum, a) => sum + a.price * cart[a.id], 0);
}

export function petCartCount(cart: PetCart): number {
  return cart.meal + cart.toys + cart.vet;
}

export const SHELTER_STAGE_NAMES: Record<ProgressStage, string> = {
  0: "Opening day",
  1: "Shelter 1",
  2: "Shelter 2",
  3: "Shelter 3",
  4: "Shelter Full",
};

export const SHELTER_UNLOCK_MESSAGES: Record<ProgressStage, string> = {
  0: "Our first rescue is resting!",
  1: "Two kittens moved in!",
  2: "The meadow is full of cozy mats!",
  3: "The play yard is open!",
  4: "Every paw has a warm home!",
};

/**
 * Meadow sprites placed on shelter-bg.jpg, as percentages of the 16:9 scene.
 * x is the sprite's center, y its bottom edge, w its width.
 */
export const SHELTER_SPRITES: {
  id: string;
  src: string;
  label: string;
  from: ProgressStage;
  x: number;
  y: number;
  w: number;
  pet: boolean;
}[] = [
  { id: "playyard", src: publicAsset("/images/shelter/pet-playyard.png"), label: "Fenced play yard with a dog house", from: 3, x: 13, y: 77, w: 17, pet: false },
  { id: "puppy", src: publicAsset("/images/shelter/pet-puppy-sleep.png"), label: "Puppy asleep on a mat", from: 0, x: 34, y: 80, w: 12, pet: true },
  { id: "bowls", src: publicAsset("/images/shelter/pet-bowls.png"), label: "Food and water bowls", from: 0, x: 47, y: 87, w: 8, pet: false },
  { id: "kittens", src: publicAsset("/images/shelter/pet-kittens.png"), label: "Two kittens playing with yarn", from: 1, x: 59, y: 80, w: 13, pet: true },
  { id: "matpals", src: publicAsset("/images/shelter/pet-matpals.png"), label: "Puppy and cat relaxing on fleece mats", from: 2, x: 77, y: 77, w: 15, pet: true },
  { id: "dogs", src: publicAsset("/images/shelter/pet-dogs.png"), label: "Beagle and golden retriever", from: 2, x: 24, y: 91, w: 18, pet: true },
];
