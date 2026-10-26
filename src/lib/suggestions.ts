import type {
  CampaignType,
  Organization,
  OrgWebsite,
  ThemePreset,
  WizardDraft,
} from "@/types/corise";
import {
  defaultChallenge,
  defaultPoll,
  defaultQuiz,
  defaultSponsor,
} from "@/lib/sample-data";

function pick<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 997;
  return items[h % items.length];
}

function trimWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text.trim();
  return `${words.slice(0, max).join(" ")}…`;
}

export function inferType(prompt: string): CampaignType {
  const p = prompt.toLowerCase();
  if (/volunteer|volunteering|sign up to help/.test(p)) return "volunteering";
  if (/event|meetup|gathering|workshop|day\b/.test(p)) return "event";
  if (/sell|product|tote|bag|merchandise/.test(p)) return "product_sales";
  if (/aware|educat|spread the word|inform/.test(p)) return "awareness";
  if (/challenge|plant|clean|habit|together/.test(p)) return "community_challenge";
  if (/fund|rais|donat|money|₹|sponsor/.test(p)) return "fundraising";
  return "custom";
}

export function inferHero(prompt: string, type: CampaignType): string {
  const p = prompt.toLowerCase();
  if (/tree|plant|garden|green/.test(p)) return "trees";
  if (/book|librar|school|read/.test(p)) return "library";
  if (/clean|litter|street|neighborhood/.test(p)) return "cleanup";
  if (/care|kit|hygiene|food|family/.test(p)) return "care";
  if (/bag|plastic|reusable|product/.test(p)) return "bags";
  if (type === "product_sales") return "bags";
  if (type === "volunteering") return "cleanup";
  if (type === "fundraising") return "care";
  return "trees";
}

function shortTitle(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 48) {
    return cleaned.replace(/\.$/, "");
  }
  const first = cleaned.split(/[.!?]/)[0]?.trim() || cleaned;
  return trimWords(first, 8).replace(/…$/, "");
}

export type SuggestionMode = "generate" | "regenerate" | "improve" | "shorter" | "engaging";

export function generateCampaignContent(
  draft: WizardDraft,
  mode: SuggestionMode = "generate"
): Partial<WizardDraft> {
  const seed = `${draft.type}|${draft.name}|${draft.cause}|${draft.goal}|${mode}`;
  const subject =
    draft.name.trim() ||
    draft.idea.trim() ||
    draft.cause.trim() ||
    draft.goal.trim() ||
    "Community Impact";

  const titles = [
    subject,
    `${subject}: Join In`,
    `Stand With ${subject}`,
    `${pick(["Grow", "Build", "Lift", "Spark"], seed)} ${subject}`,
  ];

  const headlines = [
    `Help make “${subject}” happen in our community`,
    `Your support turns ${subject.toLowerCase()} into real action`,
    `Neighbors stepping up for ${subject.toLowerCase()}`,
    `A clear goal. A shared effort. Real local impact.`,
  ];

  const whyOptions = [
    `People in our community deserve practical support—not complicated tools.`,
    `When neighbors act together, small steps add up.`,
    `Local causes succeed when people understand the need and know exactly how to help.`,
  ];

  let description =
    draft.description ||
    `${draft.organizationName || "Our organization"} is inviting supporters to help with ${subject}. ${
      draft.goal || "Join in, share the campaign, and take one simple action."
    }`;

  let whyItMatters = pick(whyOptions, seed);
  let headline = pick(headlines, seed + "h");
  let title = pick(titles, seed + "t");
  let primaryCta = pick(
    ["Join this campaign", "Take part today", "Support the cause", "Get involved"],
    seed + "c"
  );
  let socialMessage = `I’m supporting “${title}” with ${draft.organizationName || "our organization"}. Will you join me?`;

  if (mode === "shorter") {
    description = trimWords(description, 28);
    whyItMatters = trimWords(whyItMatters, 18);
    headline = trimWords(headline, 10);
  }

  if (mode === "improve" || mode === "engaging") {
    description = `${description} Every action—big or small—helps us move closer to the goal.`;
    primaryCta = mode === "engaging" ? "Be part of the change" : primaryCta;
    socialMessage = `Ready to help? “${title}” needs people like you. Take one simple step today.`;
  }

  if (mode === "regenerate") {
    title = pick(titles, seed + "regen");
    headline = pick(headlines, seed + "regen2");
    whyItMatters = pick(whyOptions, seed + "regen3");
  }

  return {
    title,
    headline,
    description,
    whyItMatters,
    primaryCta,
    suggestedAudience:
      draft.audience ||
      pick(
        [
          "Local residents and families",
          "Volunteers and community groups",
          "Schools, clubs, and neighborhood supporters",
        ],
        seed
      ),
    milestones: [
      "Share the campaign with 5 people",
      "Reach the first wave of supporter actions",
      "Celebrate progress with partners",
    ],
    socialMessage,
    suggestedActivity: "Optional quiz or challenge for supporters",
    generated: true,
  };
}

/** One-prompt campaign generation with org/website branding inheritance. */
export function buildCampaignFromPrompt(
  prompt: string,
  org: Organization,
  website: OrgWebsite | null
): Partial<WizardDraft> {
  const goal = prompt.trim();
  const type = inferType(goal);
  const title = shortTitle(goal);
  const theme: ThemePreset = website?.brandTheme || org.brandTheme || "forest";
  const heroImage = inferHero(goal, type);
  const seed = goal.toLowerCase();

  const draftBase: WizardDraft = {
    step: 7,
    type,
    name: title,
    idea: goal,
    cause: goal,
    beneficiaries: "Local community members",
    goal,
    audience: "Neighbors, families, and local supporters",
    startDate: "",
    endDate: "",
    organizationName: org.name,
    featureOnWebsite: true,
    fundraisingTarget: "",
    title: "",
    headline: "",
    description: "",
    whyItMatters: "",
    primaryCta: "Join this campaign",
    suggestedAudience: "",
    milestones: [],
    socialMessage: "",
    suggestedActivity: "",
    template: website?.template === "modern" ? "impact" : "community",
    theme,
    heroImage,
    showProgress: true,
    optionalSections: ["milestones"],
    quiz: { ...defaultQuiz(), enabled: false },
    challenge: { ...defaultChallenge(), enabled: false },
    poll: { ...defaultPoll(), enabled: false },
    sponsor: { ...defaultSponsor(), enabled: false },
    generated: false,
  };

  const generated = generateCampaignContent(draftBase, "generate");

  // Prefer a title grounded in the user's words
  const refinedTitle =
    title.length > 6
      ? title
      : generated.title || title;

  const ctaByType: Record<CampaignType, string> = {
    fundraising: "Support this campaign",
    awareness: "Learn more",
    community_challenge: "Join the challenge",
    volunteering: "Volunteer with us",
    event: "Join the event",
    product_sales: "Get involved",
    custom: "Take part today",
  };

  return {
    ...draftBase,
    ...generated,
    type,
    name: refinedTitle,
    idea: goal,
    cause: goal,
    goal,
    title: refinedTitle,
    headline: generated.headline || `Help us: ${refinedTitle}`,
    description:
      generated.description ||
      `${org.name} invites you to help: ${goal}`,
    primaryCta: ctaByType[type],
    theme,
    heroImage,
    organizationName: org.name,
    featureOnWebsite: true,
    quiz: { ...defaultQuiz(), enabled: false },
    challenge: {
      ...defaultChallenge(),
      enabled: false,
      title: pick(
        ["7-day action challenge", "Community participation challenge", "Share & invite challenge"],
        seed
      ),
    },
    sponsor: {
      ...defaultSponsor(),
      enabled: false,
      name: "Local partner (example)",
    },
    generated: true,
    step: 7,
  };
}

export const IDEA_EXAMPLE =
  "Plant 1,000 trees in our community and encourage local businesses to support us.";

export const ORG_DO_EXAMPLE =
  "We help neighbors plant trees, run clean-ups, and support local school libraries.";
