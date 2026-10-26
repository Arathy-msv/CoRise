/**
 * Proposed Corise plan structure — not confirmed entitlements.
 * Edit prices, limits, and features here only; `/pricing` renders this file as-is.
 * `available: true` means the capability exists in the current app; everything else shows as planned.
 */

export type PlanId = "free" | "pro" | "organization";

export interface PlanFeature {
  label: string;
  available: boolean;
}

export interface PlanPrice {
  amount: number;
  currency: "INR" | "USD";
  interval: "month" | "year";
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  summary: string;
  /** `null` until final pricing is decided — the UI never invents a number. */
  price: PlanPrice | null;
  /** Usage limits, shown only when set. */
  limits: string[];
  features: PlanFeature[];
  /** Whether people can sign up for this plan today. */
  open: boolean;
  recommended?: boolean;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    summary: "Everything you need to turn one idea into a website and campaign.",
    price: { amount: 0, currency: "INR", interval: "month" },
    limits: [],
    features: [
      { label: "Website and campaign created from your idea", available: true },
      { label: "Shareable public pages for your organization and campaigns", available: true },
      { label: "Plain-language editing", available: true },
      { label: "Quiz, poll, and challenge activities", available: true },
    ],
    open: true,
    recommended: true,
  },
  {
    id: "pro",
    name: "Pro",
    summary: "For organizers who want more control over branding and campaigns.",
    price: null,
    limits: [],
    features: [
      { label: "Additional customization and branding", available: false },
      { label: "More campaign management tools", available: false },
      { label: "Campaign analytics", available: false },
    ],
    open: false,
  },
  {
    id: "organization",
    name: "Organization",
    summary: "For teams running several campaigns together.",
    price: null,
    limits: [],
    features: [
      { label: "Team collaboration", available: false },
      { label: "Advanced management for multiple managers", available: false },
    ],
    open: false,
  },
];

export const DEFAULT_PLAN_ID: PlanId = "free";

export function getPlan(id: PlanId): PlanDefinition {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function formatPlanPrice(plan: PlanDefinition): string {
  if (!plan.price) return "Pricing to be announced";
  if (plan.price.amount === 0) return "Free";
  const amount = new Intl.NumberFormat(plan.price.currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: plan.price.currency,
    maximumFractionDigits: 0,
  }).format(plan.price.amount);
  return `${amount} / ${plan.price.interval}`;
}
