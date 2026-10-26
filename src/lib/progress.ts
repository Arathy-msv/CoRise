import type { Campaign, CampfirePrices, CastlePrices, GoalType, PitPrices, PresentationMode, ProgressWidget, ShelterPrices } from "@/types/corise";

export const PRESENTATION_MODES: { id: PresentationMode; label: string; tagline: string }[] = [
  { id: "both", label: "Game + direct pay", tagline: "Supporters land on the game first, with a Direct Pay option" },
  { id: "game", label: "Playable game only", tagline: "Supporters only see the game" },
  { id: "direct_pay", label: "Direct pay only", tagline: "Skip the game — supporters go straight to a payment form" },
];

export const PROGRESS_WIDGETS: { id: ProgressWidget; label: string; tagline: string }[] = [
  { id: "tree", label: "Grow The Tree", tagline: "Seed to sprout to a blooming fruit tree" },
  { id: "race", label: "Grand Prix Racer", tagline: "Speed past checkpoints to the finish line" },
  { id: "shelter", label: "Cozy Paws Shelter", tagline: "Fill the meadow with rescued pets and warm mats" },
  { id: "campfire", label: "Starry Night Campfire", tagline: "Light the fire, pitch tents, string fairy lights" },
  { id: "castle", label: "Castle Workshop", tagline: "Animal builders raise a storybook stone castle" },
  { id: "rocket", label: "Rocket Moonshot", tagline: "Fill the fuel tank and launch at 100%" },
  { id: "cake", label: "Celebration Cake", tagline: "Stack tiers, add frosting, light the candles" },
  { id: "none", label: "Simple progress bar", tagline: "A clean bar with the numbers" },
];

export const PROGRESS_WIDGET_IDS = PROGRESS_WIDGETS.map((w) => w.id);

export function isProgressWidget(value: unknown): value is ProgressWidget {
  return typeof value === "string" && (PROGRESS_WIDGET_IDS as string[]).includes(value);
}

export function progressPercent(current: number, target: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

/** 0: <25%, 1: <50%, 2: <75%, 3: <100%, 4: goal reached. */
export type ProgressStage = 0 | 1 | 2 | 3 | 4;

export function stageFor(percent: number): ProgressStage {
  if (percent >= 100) return 4;
  if (percent >= 75) return 3;
  if (percent >= 50) return 2;
  if (percent >= 25) return 1;
  return 0;
}

const STAGE_LABELS: Record<Exclude<ProgressWidget, "none">, [string, string, string, string, string]> = {
  tree: [
    "A seedling in fresh soil",
    "Sprouting with a little water",
    "Soaking up the sunshine",
    "Branches full of blossoms",
    "A blooming fruit tree — goal reached!",
  ],
  race: [
    "Engines revving at the start",
    "Past the first checkpoint",
    "Halfway around the track",
    "Final lap — almost there",
    "Across the finish line — goal reached!",
  ],
  shelter: [
    "A puppy resting in the meadow",
    "Kittens and bowls have arrived",
    "Cozy mats across the lawn",
    "The play yard is open",
    "Every paw has a warm home — goal reached!",
  ],
  campfire: [
    "A quiet fire ring waiting for wood",
    "A small flame and the first tent",
    "Glowing tents around a roaring fire",
    "Fairy lights strung through the trees",
    "The campfire is lit — goal reached!",
  ],
  castle: [
    "Foundation stones and scaffolding",
    "Fortress walls are rising",
    "Watchtowers going up",
    "Doors fitted, battlements finished",
    "The castle is complete — goal reached!",
  ],
  rocket: [
    "Fueling up on the launchpad",
    "Fuel tank a quarter full",
    "Engines warming up",
    "Countdown has started",
    "Launched into orbit — goal reached!",
  ],
  cake: [
    "Mixing the batter",
    "First tier baked",
    "Second tier stacked",
    "Frosting on top",
    "Candles lit — goal reached!",
  ],
};

export function stageLabel(type: ProgressWidget, stage: ProgressStage): string {
  if (type === "none") return stage === 4 ? "Goal reached!" : "In progress";
  return STAGE_LABELS[type][stage];
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export function formatGoalValue(goalType: GoalType, value: number): string {
  if (goalType === "amount") return formatUsd(value);
  return `${new Intl.NumberFormat("en-US").format(value)} ${value === 1 ? "participant" : "participants"}`;
}

export type CampaignProgress = { goalType: GoalType; current: number; target: number; widget: ProgressWidget };

/** Real progress only: pledges for amount goals, supporters for participant goals. */
export function campaignProgress(c: Campaign): CampaignProgress | null {
  if (!c.goalType || !c.goalTarget || c.goalTarget <= 0) return null;
  const current = c.goalType === "amount" ? (c.metrics.pledged ?? 0) : c.metrics.supporters;
  return { goalType: c.goalType, current, target: c.goalTarget, widget: c.progressWidget ?? "none" };
}

export const MAX_GOAL = 10_000_000;
export const MAX_PLEDGE = 1_000_000;

function parseWhole(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, "");
  if (!/^\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}

export function parsePledge(input: string): { ok: true; amount: number } | { ok: false; error: string } {
  const amount = parseWhole(input);
  if (amount === null || amount <= 0) return { ok: false, error: "Enter a whole amount greater than 0." };
  if (amount > MAX_PLEDGE) return { ok: false, error: `Pledges can be up to ${formatUsd(MAX_PLEDGE)}.` };
  return { ok: true, amount };
}

export type OrgCampaignInput = {
  headline: string;
  description: string;
  goalType: GoalType;
  target: string;
  widget: ProgressWidget;
  /** Only meaningful for playable widgets (tree and race). */
  presentationMode: PresentationMode;
  /** Retro Racer pit-stop prices; ignored for other widgets. */
  pitPrices?: PitPrices;
  /** Cozy Paws pet-care prices; ignored for other widgets. */
  shelterPrices?: ShelterPrices;
  /** Starry Night Campfire action prices; ignored for other widgets. */
  campfirePrices?: CampfirePrices;
  /** Castle Workshop build prices; ignored for other widgets. */
  castlePrices?: CastlePrices;
};

/** Widgets that open a full-screen playable game on the public page. */
export function isPlayableWidget(widget: ProgressWidget | undefined): boolean {
  return widget === "tree" || widget === "race" || widget === "shelter" || widget === "campfire" || widget === "castle";
}

export type OrgCampaignErrors = Partial<Record<"headline" | "description" | "target", string>>;

export function validateOrgCampaignInput(input: OrgCampaignInput): OrgCampaignErrors {
  const errors: OrgCampaignErrors = {};
  if (input.headline.trim().length < 4) errors.headline = "Give your campaign a headline (at least 4 characters).";
  if (input.description.trim().length < 10) errors.description = "Add a short description (at least 10 characters).";
  const target = parseWhole(input.target);
  if (target === null || target <= 0) errors.target = "Enter a whole number greater than 0.";
  else if (target > MAX_GOAL) errors.target = `Keep the goal under ${new Intl.NumberFormat("en-US").format(MAX_GOAL)}.`;
  return errors;
}

export function parseGoalTarget(input: string): number {
  return parseWhole(input) ?? 0;
}
