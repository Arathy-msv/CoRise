import type {
  Campaign,
  CoriseDemoState,
  MarketplaceItem,
  OrgWebsite,
  QuizActivity,
  ChallengeActivity,
  PollActivity,
  SponsorConfig,
  WebsiteWizardDraft,
  WizardDraft,
} from "@/types/corise";
import { DEFAULT_WEBSITE_SECTIONS } from "@/types/corise";
import { defaultWebsiteContent } from "@/lib/website-suggestions";

export const defaultQuiz = (): QuizActivity => ({
  enabled: true,
  title: "How green is your week?",
  description: "A short quiz to learn simple ways to help the planet.",
  questions: [
    {
      id: "q1",
      prompt: "Which action saves the most water at home?",
      options: [
        "Taking shorter showers",
        "Leaving the tap running while brushing",
        "Watering plants at noon",
        "Washing cars every day",
      ],
      correctIndex: 0,
    },
    {
      id: "q2",
      prompt: "What helps trees thrive after planting?",
      options: [
        "Regular watering in the first weeks",
        "Never watering them",
        "Planting only in deep shade always",
        "Removing all mulch",
      ],
      correctIndex: 0,
    },
    {
      id: "q3",
      prompt: "A reusable bag is useful because…",
      options: [
        "It reduces single-use plastic waste",
        "It uses more plastic every trip",
        "It only works once",
        "It cannot carry groceries",
      ],
      correctIndex: 0,
    },
  ],
  completionMessage: "Well done! Share what you learned and invite a friend to take part.",
});

export const defaultChallenge = (): ChallengeActivity => ({
  enabled: false,
  title: "7-day green habit challenge",
  description: "Pick one eco-friendly habit and keep it for a week.",
  instructions: "Choose a habit, track it daily, then mark complete.",
  completionCondition: "Log at least 5 of 7 days",
  rewardMessage: "You finished the challenge — thank you for showing up!",
});

export const defaultPoll = (): PollActivity => ({
  enabled: false,
  question: "Which community action should we prioritize next?",
  options: ["Tree planting", "Neighborhood clean-up", "Library book drive", "Care kits"],
  votes: [42, 28, 19, 15],
});

export const defaultSponsor = (): SponsorConfig => ({
  enabled: false,
  name: "Leaf & Loaf Bakery",
  logoLabel: "LL",
  pledgeAmount: 50,
  qualifyingAction: "Verified quiz completion",
  maxCap: 5000,
  voucherDescription: "10% off bakery items for participants",
  rewardDescription: "Local thank-you voucher after completing the quiz",
  eligibility: "One voucher per supporter who finishes the quiz",
  currency: "INR",
});

function baseCampaign(
  partial: Partial<Campaign> &
    Pick<
      Campaign,
      | "id"
      | "slug"
      | "type"
      | "status"
      | "name"
      | "title"
      | "headline"
      | "description"
      | "metrics"
      | "heroImage"
    >
): Campaign {
  return {
    idea: partial.name,
    cause: partial.description,
    beneficiaries: "Local community members",
    goal: partial.headline,
    audience: "Neighbors, families, and local supporters",
    startDate: "2026-03-01",
    endDate: "2026-06-30",
    organizationName: "GreenSteps Community Foundation",
    whyItMatters: partial.description,
    primaryCta: "Join this campaign",
    suggestedAudience: "Local residents and volunteers",
    milestones: ["Kickoff", "Midpoint check-in", "Celebration"],
    socialMessage: `Support ${partial.name} with GreenSteps Community Foundation.`,
    suggestedActivity: "Short quiz for supporters",
    template: "community",
    theme: "forest",
    showProgress: true,
    optionalSections: ["milestones", "sponsors"],
    quiz: defaultQuiz(),
    challenge: defaultChallenge(),
    poll: defaultPoll(),
    sponsor: { ...defaultSponsor(), enabled: true },
    featureOnWebsite: true,
    archived: false,
    createdAt: "2026-02-10T10:00:00.000Z",
    isSample: true,
    fundraisingTarget: 50000,
    ...partial,
  };
}

export const sampleCampaigns: Campaign[] = [
  baseCampaign({
    id: "camp-trees",
    slug: "plant-1000-trees",
    type: "community_challenge",
    status: "published",
    name: "Plant 1,000 Trees",
    title: "Plant 1,000 Trees",
    headline: "Help our community plant 1,000 trees this season",
    description:
      "Neighbors, schools, and local businesses are coming together to plant native trees across parks and streets. Join a planting day, take the green quiz, or invite a sponsor.",
    whyItMatters:
      "More trees mean cooler streets, cleaner air, and healthier shared spaces for families.",
    primaryCta: "Join a planting day",
    heroImage: "trees",
    fundraisingTarget: 75000,
    metrics: {
      interactions: 1842,
      fundsRaised: 42800,
      engagementRate: 68,
      completions: 612,
      supporters: 940,
    },
    publishedAt: "2026-02-12T09:00:00.000Z",
    quiz: {
      ...defaultQuiz(),
      title: "Tree steward quiz",
      description: "Learn how to help young trees thrive.",
    },
    featureOnWebsite: true,
    sponsor: {
      ...defaultSponsor(),
      enabled: true,
      name: "Harbor Hardware",
      logoLabel: "HH",
      pledgeAmount: 50,
      qualifyingAction: "Verified quiz completion",
      maxCap: 5000,
    },
  }),
  baseCampaign({
    id: "camp-libraries",
    featureOnWebsite: true,
    slug: "support-local-school-libraries",
    type: "fundraising",
    status: "published",
    name: "Support Local School Libraries",
    title: "Support Local School Libraries",
    headline: "Put more books into students’ hands",
    description:
      "Help refresh school library shelves with new titles, reading corners, and classroom book packs for students who need them most.",
    primaryCta: "Support libraries",
    heroImage: "library",
    theme: "amber",
    template: "cause",
    fundraisingTarget: 40000,
    metrics: {
      interactions: 956,
      fundsRaised: 22150,
      engagementRate: 54,
      completions: 210,
      supporters: 480,
    },
    quiz: { ...defaultQuiz(), enabled: false },
    challenge: {
      ...defaultChallenge(),
      enabled: true,
      title: "Read & share challenge",
      description: "Read one book this month and recommend it to a friend.",
    },
  }),
  baseCampaign({
    id: "camp-clean",
    slug: "clean-our-neighborhood",
    type: "volunteering",
    status: "published",
    featureOnWebsite: true,
    name: "Clean Our Neighborhood",
    title: "Clean Our Neighborhood",
    headline: "One Saturday. Cleaner streets for everyone.",
    description:
      "Volunteer for a neighborhood clean-up: pick a block, bring gloves, and help restore shared spaces.",
    primaryCta: "Sign up to volunteer",
    heroImage: "cleanup",
    theme: "ocean",
    fundraisingTarget: 15000,
    metrics: {
      interactions: 720,
      fundsRaised: 6400,
      engagementRate: 71,
      completions: 188,
      supporters: 310,
    },
  }),
  baseCampaign({
    id: "camp-care",
    slug: "community-care-kit-drive",
    type: "fundraising",
    status: "published",
    featureOnWebsite: false,
    name: "Community Care Kit Drive",
    title: "Community Care Kit Drive",
    headline: "Assemble care kits for neighbors in need",
    description:
      "Collect and fund hygiene and essentials kits for families facing tough months. Local partners help with packing and delivery.",
    primaryCta: "Contribute a kit",
    heroImage: "care",
    theme: "rose",
    fundraisingTarget: 30000,
    metrics: {
      interactions: 1104,
      fundsRaised: 18620,
      engagementRate: 61,
      completions: 340,
      supporters: 520,
    },
  }),
  baseCampaign({
    id: "camp-bags",
    slug: "reusable-bags-for-a-greener-future",
    type: "product_sales",
    status: "published",
    featureOnWebsite: true,
    name: "Reusable Bags for a Greener Future",
    title: "Reusable Bags for a Greener Future",
    headline: "Carry change—one reusable bag at a time",
    description:
      "Sell durable reusable bags. Proceeds support GreenSteps community projects and reduce single-use plastic.",
    primaryCta: "Get a reusable bag",
    heroImage: "bags",
    template: "impact",
    fundraisingTarget: 25000,
    metrics: {
      interactions: 1340,
      fundsRaised: 15980,
      engagementRate: 59,
      completions: 402,
      supporters: 670,
    },
    poll: {
      enabled: true,
      question: "Which bag design should we produce next?",
      options: ["Forest leaf", "City skyline", "Kids doodle", "Classic green"],
      votes: [55, 32, 41, 28],
    },
  }),
];

export const sampleMarketplace: MarketplaceItem[] = [
  {
    id: "m1",
    name: "Reusable tote — Forest leaf",
    description: "Sturdy cotton tote. Proceeds would support GreenSteps projects.",
    priceLabel: "₹299",
    causeTag: "Plastic reduction",
    status: "demo",
  },
  {
    id: "m2",
    name: "Seedling starter kit",
    description: "Potting mix guide + stickers for young planters.",
    priceLabel: "₹449",
    causeTag: "Tree planting",
    status: "demo",
  },
  {
    id: "m3",
    name: "Community clean-up gloves pack",
    description: "Volunteer pack idea for neighborhood events.",
    priceLabel: "₹199",
    causeTag: "Volunteering",
    status: "demo",
  },
];

export function emptyDraft(): WizardDraft {
  return {
    step: 1,
    type: "",
    name: "",
    idea: "",
    cause: "",
    beneficiaries: "",
    goal: "",
    audience: "",
    startDate: "",
    endDate: "",
    organizationName: "GreenSteps Community Foundation",
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
    template: "community",
    theme: "forest",
    heroImage: "trees",
    showProgress: true,
    optionalSections: ["milestones", "sponsors"],
    quiz: defaultQuiz(),
    challenge: defaultChallenge(),
    poll: defaultPoll(),
    sponsor: defaultSponsor(),
    generated: false,
  };
}

export function seededGreenStepsWebsite(): OrgWebsite {
  const content = defaultWebsiteContent("GreenSteps Community Foundation");
  content.headline = "Neighbors planting, caring, and building a greener city";
  content.heroDescription =
    "GreenSteps helps people create campaigns for trees, schools, clean-ups, and care drives—without needing technical skills.";
  content.about =
    "GreenSteps Community Foundation is a local organization in Pune that helps neighbors take practical climate and community action. We make campaigns clear, welcoming, and ready to share.";
  content.mission =
    "Make community action simple enough for anyone to start—and inviting enough for anyone to join.";
  content.vision =
    "A city where caring for people and planet is part of everyday neighborhood life.";
  content.featuredInitiatives = [
    "Tree planting and green streets",
    "School library support",
    "Neighborhood clean-ups and care kits",
  ];
  content.primaryCtaLabel = "Explore campaigns";
  content.impactStatOneValue = "5";
  content.impactStatOneLabel = "Live campaigns";
  content.impactStatTwoValue = "1.8k";
  content.impactStatTwoLabel = "Interactions";
  content.impactStatThreeValue = "12";
  content.impactStatThreeLabel = "Local partners";

  return {
    status: "published",
    template: "community",
    heroImage: "trees",
    brandTheme: "forest",
    logoLabel: "GS",
    content,
    sections: DEFAULT_WEBSITE_SECTIONS(),
    lastEditedAt: "2026-03-01T10:00:00.000Z",
    publishedAt: "2026-03-01T10:00:00.000Z",
    previewMode: "desktop",
  };
}

export function emptyWebsiteDraft(org: CoriseDemoState["organization"]): WebsiteWizardDraft {
  return {
    step: 1,
    template: "",
    orgName: org.name,
    orgShortName: org.shortName,
    description: org.description,
    mission: org.mission,
    location: org.location,
    contactLabel: org.contactLabel,
    websitePurpose: org.websitePurpose,
    socialInstagram: org.socialInstagram,
    socialFacebook: org.socialFacebook,
    socialWebsite: org.socialWebsite,
    logoLabel: org.logoLabel,
    brandTheme: org.brandTheme,
    heroImage: "trees",
    content: defaultWebsiteContent(org.name),
    sections: DEFAULT_WEBSITE_SECTIONS(),
    generated: false,
  };
}

export function websiteDraftFromExisting(
  org: CoriseDemoState["organization"],
  website: OrgWebsite
): WebsiteWizardDraft {
  return {
    step: 4,
    template: website.template,
    orgName: org.name,
    orgShortName: org.shortName,
    description: org.description,
    mission: org.mission,
    location: org.location,
    contactLabel: org.contactLabel,
    websitePurpose: org.websitePurpose,
    socialInstagram: org.socialInstagram,
    socialFacebook: org.socialFacebook,
    socialWebsite: org.socialWebsite,
    logoLabel: website.logoLabel,
    brandTheme: website.brandTheme,
    heroImage: website.heroImage,
    content: { ...website.content },
    sections: website.sections.map((s) => ({ ...s })),
    generated: true,
  };
}

export function createInitialState(): CoriseDemoState {
  return {
    version: 1,
    isSignedIn: false,
    managerRole: null,
    userName: "Asha Menon",
    userRole: "Manager",
    organization: {
      name: "GreenSteps Community Foundation",
      shortName: "GreenSteps",
      description:
        "GreenSteps helps neighbors take practical climate and community action—from tree planting to care drives—through clear campaigns people can join.",
      mission:
        "Make community action simple enough for anyone to start—and inviting enough for anyone to join.",
      location: "Pune, India",
      contactLabel: "hello@greensteps.demo",
      logoLabel: "GS",
      websitePurpose: "Share our mission and invite people into campaigns",
      socialInstagram: "@greensteps.demo",
      socialFacebook: "GreenSteps Community",
      socialWebsite: "greensteps.demo",
      brandTheme: "forest",
      orgSlug: "greensteps",
    },
    website: seededGreenStepsWebsite(),
    websiteDraft: null,
    campaigns: sampleCampaigns,
    activity: [
      {
        id: "a1",
        type: "interaction",
        message: "128 new supporter interactions on Plant 1,000 Trees",
        timeLabel: "2 hours ago",
        campaignName: "Plant 1,000 Trees",
      },
      {
        id: "a2",
        type: "quiz",
        message: "46 quiz completions verified",
        timeLabel: "5 hours ago",
        campaignName: "Plant 1,000 Trees",
      },
      {
        id: "a3",
        type: "sponsor",
        message: "Harbor Hardware pledge progress updated (illustrative)",
        timeLabel: "Yesterday",
        campaignName: "Plant 1,000 Trees",
      },
      {
        id: "a4",
        type: "donation",
        message: "Library campaign received illustrative support",
        timeLabel: "Yesterday",
        campaignName: "Support Local School Libraries",
      },
      {
        id: "a5",
        type: "create",
        message: "Reusable Bags campaign marked active",
        timeLabel: "3 days ago",
        campaignName: "Reusable Bags for a Greener Future",
      },
    ],
    marketplace: sampleMarketplace,
    draft: null,
    lastPublishedId: null,
    pendingSpace: null,
    claimedSpace: null,
    toast: null,
  };
}

/**
 * Starting point for a fresh Licensed Edition install: a generic organization with no
 * website yet and no campaigns. The org admin creates a campaign, then creates and
 * publishes the website from the dashboard before either becomes public.
 */
export function createLicensedInitialState(): CoriseDemoState {
  return {
    version: 1,
    isSignedIn: false,
    managerRole: null,
    userName: "Asha Menon",
    userRole: "Manager",
    organization: {
      name: "Your Organization",
      shortName: "Your Org",
      description: "Tell your community who you are and what you're working on.",
      mission: "",
      location: "",
      contactLabel: "",
      logoLabel: "YO",
      websitePurpose: "",
      socialInstagram: "",
      socialFacebook: "",
      socialWebsite: "",
      brandTheme: "forest",
      orgSlug: "your-organization",
    },
    website: null,
    websiteDraft: null,
    campaigns: [],
    activity: [],
    marketplace: sampleMarketplace,
    draft: null,
    lastPublishedId: null,
    pendingSpace: null,
    claimedSpace: null,
    toast: null,
  };
}

/** Featured campaigns for the org website — single source of truth from campaign data. */
export function getFeaturedWebsiteCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns.filter(
    (c) =>
      c.featureOnWebsite &&
      !c.archived &&
      c.status === "published"
  );
}
