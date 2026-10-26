import { HERO_IMAGE_KEYS } from "@/lib/hero-images";
import { PROGRESS_WIDGET_IDS, isPlayableWidget, type OrgCampaignInput } from "@/lib/progress";
import type { CampaignChangeSet, GoalType, ThemePreset } from "@/types/corise";

/**
 * Randomized sample content for the floating "Fill with demo data" button.
 * Every click re-rolls from these pools, so the values are different each time.
 */
const IDEAS = [
  "Organize a community tree-planting drive",
  "Collect books for our school library",
  "Run a beach clean-up with neighbors",
  "Start a weekend soup kitchen for the shelter",
  "Set up a free bike-repair day for students",
  "Launch a neighborhood recycling challenge",
  "Host a winter coat drive for families in need",
  "Plan a community garden for our block",
  "Organize a weekend blood donation camp",
  "Run a reading buddies program for kids",
];

const FIRST_NAMES = ["Asha", "Noah", "Priya", "Leo", "Maya", "Kenji", "Zara", "Omar", "Elena", "Theo"];
const LAST_NAMES = ["Rao", "Patel", "Kim", "Garcia", "Novak", "Khan", "Silva", "Dubois", "Okafor", "Lund"];
const EMAIL_DOMAINS = ["example.org", "mail.com", "demo.co", "inbox.dev"];

const TITLES = [
  "Join Us for the Community Drive",
  "Let's Make a Difference Together",
  "Everyone's Welcome — Take Part",
  "Help Us Reach Our Goal",
  "Our Neighborhood Needs You",
  "Be Part of Something Good",
];

const HEADLINES = [
  "Join us and make a difference",
  "Everyone's welcome — let's get started",
  "Be part of something good this week",
  "Small steps, big impact — join in",
  "Help us reach our goal together",
  "One small action, one big difference",
];

const DESCRIPTIONS = [
  "We're bringing neighbors together for one clear goal. It only takes a few minutes to join, and every bit of help counts.",
  "This is a simple, low-pressure way to give back to the community. Come for ten minutes or stay for the whole thing — either way, you'll help.",
  "A short, friendly activity open to everyone nearby. No experience needed, just show up and pitch in.",
  "We set a small, achievable goal and we're inviting people nearby to help us get there together.",
];

const CTAS = ["Join the drive", "Count me in", "I'm in", "Join us", "Sign me up", "Take part"];

const THEMES: ThemePreset[] = ["forest", "amber", "ocean", "rose"];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function randomIdea(): string {
  return `${pick(IDEAS)} and invite people to take part.`;
}

export function randomPerson(): { name: string; email: string } {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const tag = Math.floor(Math.random() * 90 + 10);
  return {
    name: `${first} ${last}`,
    email: `${first}.${last}${tag}@${pick(EMAIL_DOMAINS)}`.toLowerCase(),
  };
}

export function randomCampaignPatch(): CampaignChangeSet {
  return {
    title: pick(TITLES),
    headline: pick(HEADLINES),
    description: pick(DESCRIPTIONS),
    primaryCta: pick(CTAS),
    theme: pick(THEMES),
    heroImage: pick(HERO_IMAGE_KEYS),
  };
}

const AMOUNT_TARGETS = [500, 1000, 2500, 5000, 7500, 10000, 20000];
const PARTICIPANT_TARGETS = [25, 50, 100, 150, 250, 500];

export function randomOrgCampaign(): OrgCampaignInput {
  const goalType: GoalType = Math.random() < 0.5 ? "amount" : "participants";
  const widget = pick(PROGRESS_WIDGET_IDS.filter((w) => w !== "none"));
  return {
    headline: pick(IDEAS),
    description: pick(DESCRIPTIONS),
    goalType,
    target: String(pick(goalType === "amount" ? AMOUNT_TARGETS : PARTICIPANT_TARGETS)),
    widget,
    presentationMode: isPlayableWidget(widget) ? "both" : "game",
    castlePrices: { stone: 15, window: 35, flag: 60 },
    campfirePrices: { firewood: 15, tent: 35, lights: 50 },
    pitPrices: { nitro: 50, tire: 25, tune: 15 },
    shelterPrices: { meal: 15, toys: 25, vet: 50 },
  };
}

export type DemoBundle = {
  /** Unique per click so listeners can tell two fills apart even if the random text repeats. */
  nonce: number;
  idea: string;
  person: { name: string; email: string };
  campaign: CampaignChangeSet;
  orgCampaign: OrgCampaignInput;
};

export function randomDemoBundle(): DemoBundle {
  return {
    nonce: Date.now() + Math.random(),
    idea: randomIdea(),
    person: randomPerson(),
    campaign: randomCampaignPatch(),
    orgCampaign: randomOrgCampaign(),
  };
}

export const DEMO_FILL_EVENT = "corise:demo-fill";

/** Broadcasts a fresh, randomized demo bundle to every listening form on the current page. */
export function dispatchDemoFill(): DemoBundle {
  const bundle = randomDemoBundle();
  window.dispatchEvent(new CustomEvent<DemoBundle>(DEMO_FILL_EVENT, { detail: bundle }));
  return bundle;
}

export function onDemoFill(handler: (bundle: DemoBundle) => void): () => void {
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<DemoBundle>).detail;
    if (detail) handler(detail);
  };
  window.addEventListener(DEMO_FILL_EVENT, listener);
  return () => window.removeEventListener(DEMO_FILL_EVENT, listener);
}
