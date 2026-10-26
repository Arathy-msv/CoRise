export type CampaignType =
  | "fundraising"
  | "awareness"
  | "community_challenge"
  | "volunteering"
  | "event"
  | "product_sales"
  | "custom";

export type CampaignStatus = "draft" | "published" | "completed" | "scheduled";

export type ThemePreset = "forest" | "amber" | "ocean" | "rose";

export type CampaignTemplate = "impact" | "community" | "cause" | "event";

export type WebsiteTemplate = "nonprofit" | "community" | "modern";

export type WebsiteStatus = "none" | "draft" | "published";

export type WebsiteSectionId =
  | "hero"
  | "about"
  | "mission"
  | "campaigns"
  | "activities"
  | "support"
  | "contact"
  | "story"
  | "banner";

export type SectionBackground = "light" | "tinted" | "dark";

export interface WebsiteSection {
  id: WebsiteSectionId;
  label: string;
  enabled: boolean;
  /** Unique per instance; sections added in the editor can repeat an id. */
  key?: string;
  background?: SectionBackground;
  heading?: string;
  body?: string;
  image?: string;
  caption?: string;
}

export interface OrgWebsiteContent {
  siteName: string;
  headline: string;
  heroDescription: string;
  about: string;
  mission: string;
  vision: string;
  featuredInitiatives: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  supportHeading: string;
  supportBody: string;
  supportCtaLabel: string;
  activitiesHeading: string;
  activitiesBody: string;
  contactHeading: string;
  contactBody: string;
  impactStatOneLabel: string;
  impactStatOneValue: string;
  impactStatTwoLabel: string;
  impactStatTwoValue: string;
  impactStatThreeLabel: string;
  impactStatThreeValue: string;
  footerNote?: string;
  footerBackground?: SectionBackground;
}

export interface OrgWebsite {
  status: Exclude<WebsiteStatus, "none">;
  template: WebsiteTemplate;
  heroImage: string;
  brandTheme: ThemePreset;
  logoLabel: string;
  content: OrgWebsiteContent;
  sections: WebsiteSection[];
  lastEditedAt: string;
  publishedAt?: string;
  previewMode: "desktop" | "mobile";
}

export interface WebsiteWizardDraft {
  step: number;
  template: WebsiteTemplate | "";
  orgName: string;
  orgShortName: string;
  description: string;
  mission: string;
  location: string;
  contactLabel: string;
  websitePurpose: string;
  socialInstagram: string;
  socialFacebook: string;
  socialWebsite: string;
  logoLabel: string;
  brandTheme: ThemePreset;
  heroImage: string;
  content: OrgWebsiteContent;
  sections: WebsiteSection[];
  generated: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface QuizActivity {
  enabled: boolean;
  title: string;
  description: string;
  questions: QuizQuestion[];
  completionMessage: string;
}

export interface ChallengeActivity {
  enabled: boolean;
  title: string;
  description: string;
  instructions: string;
  completionCondition: string;
  rewardMessage: string;
}

export interface PollActivity {
  enabled: boolean;
  question: string;
  options: string[];
  votes: number[];
}

export interface SponsorConfig {
  enabled: boolean;
  name: string;
  logoLabel: string;
  pledgeAmount: number;
  qualifyingAction: string;
  maxCap: number;
  voucherDescription: string;
  rewardDescription: string;
  eligibility: string;
  currency: "INR" | "USD";
}

export interface CampaignMetrics {
  interactions: number;
  fundsRaised: number;
  engagementRate: number;
  completions: number;
  supporters: number;
  /** Sum of supporter pledges recorded in this browser. Pledges never take payment. */
  pledged?: number;
}

export type ProgressWidget = "tree" | "race" | "shelter" | "campfire" | "castle" | "rocket" | "cake" | "none";

export type GoalType = "amount" | "participants";

/** How supporters experience the campaign's public page: the playable game, a direct payment form, or a toggle between both (game shown first). */
export type PresentationMode = "game" | "direct_pay" | "both";

/** Organizer-set dollar prices for the Retro Racer pit-stop actions. */
export type PitPrices = { nitro: number; tire: number; tune: number };

/** Organizer-set dollar prices for the Cozy Paws pet-care actions. */
export type ShelterPrices = { meal: number; toys: number; vet: number };

/** Organizer-set dollar prices for the Starry Night Campfire camp actions. */
export type CampfirePrices = { firewood: number; tent: number; lights: number };

/** Organizer-set dollar prices for the Castle Workshop build actions. */
export type CastlePrices = { stone: number; window: number; flag: number };

export interface Campaign {
  id: string;
  slug: string;
  type: CampaignType;
  status: CampaignStatus;
  name: string;
  idea: string;
  cause: string;
  beneficiaries: string;
  goal: string;
  audience: string;
  startDate: string;
  endDate: string;
  organizationName: string;
  featureOnWebsite: boolean;
  archived: boolean;
  fundraisingTarget?: number;
  title: string;
  headline: string;
  description: string;
  whyItMatters: string;
  primaryCta: string;
  suggestedAudience: string;
  milestones: string[];
  socialMessage: string;
  suggestedActivity: string;
  template: CampaignTemplate;
  theme: ThemePreset;
  heroImage: string;
  showProgress: boolean;
  /** Set for campaigns created with a goal; campaigns without it never show the gamified widget. */
  goalType?: GoalType;
  goalTarget?: number;
  progressWidget?: ProgressWidget;
  presentationMode?: PresentationMode;
  pitPrices?: PitPrices;
  shelterPrices?: ShelterPrices;
  campfirePrices?: CampfirePrices;
  castlePrices?: CastlePrices;
  optionalSections: string[];
  quiz: QuizActivity;
  challenge: ChallengeActivity;
  poll: PollActivity;
  sponsor: SponsorConfig;
  metrics: CampaignMetrics;
  createdAt: string;
  publishedAt?: string;
  /** Last content edit (draft or unpublished changes). */
  updatedAt?: string;
  isSample?: boolean;
  /** Edits made after publishing; supporters keep seeing the live version until republished. */
  pendingChanges?: CampaignChangeSet;
}

export type CampaignChangeSet = Partial<
  Omit<Campaign, "id" | "slug" | "status" | "metrics" | "createdAt" | "publishedAt" | "updatedAt" | "pendingChanges">
>;

/** Which generator produced an Impact Space. `local_rules` never calls an external service. */
export type GenerationSource = "local_rules" | "ai_service";

/** Unsaved Impact Space created from a visitor's idea, before sign-up. */
export interface PendingImpactSpace {
  id: string;
  idea: string;
  createdAt: string;
  source: GenerationSource;
  organization: Organization;
  website: OrgWebsite;
  campaign: Campaign;
}

/** Impact Space saved into the signed-in workspace; content lives in organization/website/campaigns. */
export interface ClaimedImpactSpace {
  idea: string;
  source: GenerationSource;
  /** Absent when only the organization website (no campaign) was claimed. */
  campaignId?: string;
  claimedAt: string;
}

export interface ActivityItem {
  id: string;
  type: "publish" | "interaction" | "sponsor" | "quiz" | "donation" | "create";
  message: string;
  /** Fallback label for seeded sample activity. */
  timeLabel: string;
  /** ISO time for real activity; shown as relative time. */
  at?: string;
  campaignName?: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  causeTag: string;
  status: "demo";
}

export interface Organization {
  name: string;
  shortName: string;
  description: string;
  mission: string;
  location: string;
  contactLabel: string;
  logoLabel: string;
  websitePurpose: string;
  socialInstagram: string;
  socialFacebook: string;
  socialWebsite: string;
  brandTheme: ThemePreset;
  orgSlug: string;
}

export interface WizardDraft {
  step: number;
  type: CampaignType | "";
  name: string;
  idea: string;
  cause: string;
  beneficiaries: string;
  goal: string;
  audience: string;
  startDate: string;
  endDate: string;
  organizationName: string;
  featureOnWebsite: boolean;
  fundraisingTarget: string;
  title: string;
  headline: string;
  description: string;
  whyItMatters: string;
  primaryCta: string;
  suggestedAudience: string;
  milestones: string[];
  socialMessage: string;
  suggestedActivity: string;
  template: CampaignTemplate;
  theme: ThemePreset;
  heroImage: string;
  showProgress: boolean;
  optionalSections: string[];
  quiz: QuizActivity;
  challenge: ChallengeActivity;
  poll: PollActivity;
  sponsor: SponsorConfig;
  generated: boolean;
}

/** Signed-in owner session. Null when signed out or browsing as supporter. */
export type ManagerRole = "owner";

export interface CoriseDemoState {
  version: 1;
  isSignedIn: boolean;
  managerRole: ManagerRole | null;
  userName: string;
  userEmail?: string;
  userRole: string;
  organization: Organization;
  website: OrgWebsite | null;
  websiteDraft: WebsiteWizardDraft | null;
  campaigns: Campaign[];
  activity: ActivityItem[];
  marketplace: MarketplaceItem[];
  draft: WizardDraft | null;
  lastPublishedId: string | null;
  pendingSpace: PendingImpactSpace | null;
  claimedSpace: ClaimedImpactSpace | null;
  toast: { message: string; tone: "success" | "info" | "warn" } | null;
}

export const WEBSITE_TEMPLATE_META: Record<
  WebsiteTemplate,
  { label: string; description: string; vibe: string }
> = {
  nonprofit: {
    label: "Nonprofit & Charity",
    description: "Mission-focused layout with emotional imagery and clear support CTAs.",
    vibe: "Warm · Trustworthy · Donation-ready",
  },
  community: {
    label: "Community & School",
    description: "Highlights activities, events, volunteers, and local campaigns.",
    vibe: "Friendly · Local · Participatory",
  },
  modern: {
    label: "Modern Cause Organization",
    description: "Bold hero, impact stats, featured campaigns, and contemporary type.",
    vibe: "Bold · Contemporary · Impact-led",
  },
};

export const DEFAULT_WEBSITE_SECTIONS = (): WebsiteSection[] => [
  { id: "hero", label: "Hero", enabled: true },
  { id: "about", label: "About", enabled: true },
  { id: "mission", label: "Mission & impact", enabled: true },
  { id: "campaigns", label: "Featured campaigns", enabled: true },
  { id: "activities", label: "Upcoming activities", enabled: true },
  { id: "support", label: "Get involved", enabled: true },
  { id: "contact", label: "Contact", enabled: true },
];

export const THEME_COLORS: Record<ThemePreset, { primary: string; accent: string; soft: string }> = {
  forest: { primary: "#1B4332", accent: "#C4A35A", soft: "#E8F0EA" },
  amber: { primary: "#7C4A1A", accent: "#E0A96D", soft: "#F8EFE4" },
  ocean: { primary: "#1A3A4A", accent: "#7EB6C8", soft: "#E6F1F5" },
  rose: { primary: "#5C2A3A", accent: "#D4A0A8", soft: "#F6EBEF" },
};

export const CAMPAIGN_TYPE_META: Record<
  CampaignType,
  { label: string; description: string; icon: string }
> = {
  fundraising: {
    label: "Fundraising",
    description: "Raise money for a clear goal or project.",
    icon: "💚",
  },
  awareness: {
    label: "Awareness",
    description: "Share a cause and grow understanding.",
    icon: "📣",
  },
  community_challenge: {
    label: "Community challenge",
    description: "Invite people to take part in a shared challenge.",
    icon: "🌱",
  },
  volunteering: {
    label: "Volunteering",
    description: "Recruit people to give their time.",
    icon: "🤝",
  },
  event: {
    label: "Event",
    description: "Invite people to an event or gathering.",
    icon: "📅",
  },
  product_sales: {
    label: "Product sales for a cause",
    description: "Sell products where proceeds support the cause.",
    icon: "🛍️",
  },
  custom: {
    label: "Custom campaign",
    description: "Build your own mix of goals and activities.",
    icon: "✨",
  },
};
