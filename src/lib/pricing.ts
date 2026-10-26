/**
 * Central Corise product pricing configuration.
 * Prices and feature lists are placeholders until business pricing is confirmed.
 * Update this file only — do not scatter plan values across pages.
 */

export type PlanId = "free" | "pro" | "organization";
export type BillingInterval = "monthly" | "yearly";

export type PlanConfig = {
  id: PlanId;
  name: string;
  tagline: string;
  /** Placeholder monthly amount in INR, or null for contact sales. */
  monthlyPriceInr: number | null;
  /** Placeholder yearly amount in INR, or null for contact sales. */
  yearlyPriceInr: number | null;
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
  features: string[];
  notes: string;
};

export const PRICING_DISCLAIMER =
  "Plan names, prices, and feature lists below are configurable placeholders until Corise business pricing is confirmed.";

export const BILLING_INTERVALS_ENABLED = false;

export const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Explore Corise and create a basic website or campaign.",
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    ctaLabel: "Start Free",
    ctaHref: "/signup?plan=free",
    features: [
      "Create a basic organization website",
      "Create and publish campaigns",
      "Share public campaign pages",
      "Session-based demo workspace",
    ],
    notes: "Best for trying Corise with no payment step.",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For organizations that need a complete website and regular campaigns.",
    monthlyPriceInr: null,
    yearlyPriceInr: null,
    ctaLabel: "Choose Pro",
    ctaHref: "/signup?plan=pro",
    highlighted: true,
    features: [
      "Everything in Free (proposed)",
      "Richer website and campaign tools (proposed)",
      "Optional quizzes, challenges, and rewards (proposed)",
      "Priority onboarding guidance (proposed)",
    ],
    notes: "Price not confirmed — checkout shows a payment integration placeholder.",
  },
  {
    id: "organization",
    name: "Organization",
    tagline: "For organizations that need more capacity and collaboration.",
    monthlyPriceInr: null,
    yearlyPriceInr: null,
    ctaLabel: "Contact Us",
    ctaHref: "/signup?plan=organization",
    features: [
      "Everything proposed in Pro",
      "More capacity for teams (proposed)",
      "Collaboration features (proposed)",
      "Dedicated support conversation (proposed)",
    ],
    notes: "Contact / sales path — no live payment in this prototype.",
  },
];

export function getPlan(id: string | null | undefined): PlanConfig | undefined {
  if (!id) return undefined;
  return PLANS.find((p) => p.id === id);
}

export function formatPlanPrice(plan: PlanConfig, interval: BillingInterval = "monthly"): string {
  const amount = interval === "yearly" ? plan.yearlyPriceInr : plan.monthlyPriceInr;
  if (amount === 0) return "Free";
  if (amount === null) return "Contact us";
  return `₹${amount.toLocaleString("en-IN")}/${interval === "yearly" ? "yr" : "mo"}`;
}

export const PLAN_STORAGE_KEY = "corise-selected-plan";

export function saveSelectedPlan(planId: PlanId): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PLAN_STORAGE_KEY, planId);
  } catch {
    // ignore
  }
}

export function loadSelectedPlan(): PlanId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PLAN_STORAGE_KEY);
    if (raw === "free" || raw === "pro" || raw === "organization") return raw;
  } catch {
    // ignore
  }
  return null;
}
