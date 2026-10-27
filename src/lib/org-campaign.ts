import type { Campaign, Organization } from "@/types/corise";
import { defaultChallenge, defaultPoll, defaultQuiz, defaultSponsor } from "@/lib/sample-data";
import { detectTopic } from "@/lib/impact-space/topics";
import { slugify, uid } from "@/lib/format";
import { isPlayableWidget, parseGoalTarget, type OrgCampaignInput } from "@/lib/progress";
import { careActions, DEFAULT_CARE_PRICES } from "@/lib/garden";
import { DEFAULT_PIT_PRICES, pitActions } from "@/lib/racer";
import { DEFAULT_SHELTER_PRICES, petActions } from "@/lib/shelter";
import { DEFAULT_CAMPFIRE_PRICES, campActions } from "@/lib/campfire";
import { DEFAULT_CASTLE_PRICES, buildActions } from "@/lib/castle";

/** Builds a published campaign owned by the organization. Callers validate the input first. */
export function buildOrgCampaign(input: OrgCampaignInput, organization: Organization, now = new Date().toISOString()): Campaign {
  const headline = input.headline.trim();
  const description = input.description.trim();
  const target = parseGoalTarget(input.target);
  const topic = detectTopic(`${headline} ${description}`);
  const id = uid("camp");
  const amountGoal = input.goalType === "amount";

  return {
    id,
    slug: `${slugify(headline)}-${id.slice(-4)}`,
    type: amountGoal ? "fundraising" : "community_challenge",
    status: "published",
    name: headline,
    idea: description,
    cause: description,
    beneficiaries: topic.beneficiaries,
    goal: description,
    audience: "",
    startDate: "",
    endDate: "",
    organizationName: organization.name,
    featureOnWebsite: true,
    archived: false,
    fundraisingTarget: amountGoal ? target : undefined,
    title: headline,
    headline,
    description,
    whyItMatters: topic.whyItMatters,
    primaryCta: amountGoal ? "Pledge support" : "Count me in",
    suggestedAudience: "",
    milestones: [],
    socialMessage: `I'm supporting ${headline} with ${organization.name}. Want to join?`,
    suggestedActivity: "",
    template: "community",
    theme: organization.brandTheme,
    heroImage: topic.heroImage,
    showProgress: true,
    goalType: input.goalType,
    goalTarget: target,
    progressWidget: input.widget,
    presentationMode: isPlayableWidget(input.widget) ? input.presentationMode : "game",
    ...(input.widget === "tree"
      ? { carePrices: careActions(input.carePrices).reduce((p, a) => ({ ...p, [a.id]: a.price }), { ...DEFAULT_CARE_PRICES }) }
      : {}),
    ...(input.widget === "race" ? { pitPrices: pitActions(input.pitPrices).reduce((p, a) => ({ ...p, [a.id]: a.price }), { ...DEFAULT_PIT_PRICES }) } : {}),
    ...(input.widget === "castle"
      ? { castlePrices: buildActions(input.castlePrices).reduce((p, a) => ({ ...p, [a.id]: a.price }), { ...DEFAULT_CASTLE_PRICES }) }
      : {}),
    ...(input.widget === "campfire"
      ? { campfirePrices: campActions(input.campfirePrices).reduce((p, a) => ({ ...p, [a.id]: a.price }), { ...DEFAULT_CAMPFIRE_PRICES }) }
      : {}),
    ...(input.widget === "shelter"
      ? { shelterPrices: petActions(input.shelterPrices).reduce((p, a) => ({ ...p, [a.id]: a.price }), { ...DEFAULT_SHELTER_PRICES }) }
      : {}),
    optionalSections: [],
    quiz: { ...defaultQuiz(), enabled: false },
    challenge: { ...defaultChallenge(), enabled: false },
    poll: { ...defaultPoll(), enabled: false, votes: defaultPoll().options.map(() => 0) },
    sponsor: { ...defaultSponsor(), enabled: false, name: "", logoLabel: "", voucherDescription: "", rewardDescription: "" },
    metrics: { interactions: 0, fundsRaised: 0, engagementRate: 0, completions: 0, supporters: 0, pledged: 0 },
    createdAt: now,
    publishedAt: now,
    updatedAt: now,
    isSample: false,
  };
}
