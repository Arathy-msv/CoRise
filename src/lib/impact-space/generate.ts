import type {
  Campaign,
  CampaignType,
  GenerationSource,
  Organization,
  OrgWebsite,
  PendingImpactSpace,
} from "@/types/corise";
import { DEFAULT_WEBSITE_SECTIONS } from "@/types/corise";
import { defaultChallenge, defaultPoll, defaultQuiz, defaultSponsor } from "@/lib/sample-data";
import { inferType } from "@/lib/suggestions";
import { defaultWebsiteContent } from "@/lib/website-suggestions";
import { slugify, uid } from "@/lib/format";
import {
  buildTopicChallenge,
  buildTopicQuiz,
  detectTopic,
  type TopicDefinition,
} from "@/lib/impact-space/topics";

/**
 * Produces an Impact Space from a plain-language idea.
 * An AI-backed implementation can replace `localRulesGenerator` in `getActiveGenerator`
 * once a server-side model integration exists; the UI reads `source` to label output honestly.
 */
export interface ImpactSpaceGenerator {
  source: GenerationSource;
  generate(idea: string): Promise<PendingImpactSpace>;
}

export const IDEA_PLACEHOLDER =
  "Example: Green Roots is a local community non-profit dedicated to urban forestry. We bring neighbors together to create cleaner, greener neighborhoods...";

const MIN_IDEA_LENGTH = 12;

export function validateIdea(idea: string): string | null {
  const trimmed = idea.trim();
  if (!trimmed) return "Tell us what you would like to make happen.";
  if (trimmed.length < MIN_IDEA_LENGTH) {
    return "Add a few more words so we can understand your idea.";
  }
  return null;
}

const SMALL_WORDS = new Set(["a", "an", "the", "and", "of", "for", "to", "in", "on", "with", "at", "by", "or"]);

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) =>
      word
        .split("-")
        .map((part) =>
          i > 0 && SMALL_WORDS.has(part.toLowerCase())
            ? part.toLowerCase()
            : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("-")
    )
    .join(" ");
}

function limitWords(text: string, max: number): string {
  return text.trim().split(/\s+/).slice(0, max).join(" ");
}

function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter((w) => w && !SMALL_WORDS.has(w.toLowerCase()))
    .map((w) => w[0]?.toUpperCase() ?? "");
  return letters.slice(0, 2).join("") || "C";
}

/** "We want to", "Our PTA wants to", "Students would like to", "Help us" … */
const LEAD_IN =
  /^[^.!?]{0,40}?(?:\b(?:want|wants|would like|wish|wishes|hope|hopes|plan|plans|need|needs|aim|aims|are trying|is trying)|'d like)\s+to\s+|^(?:help us|let's|lets|please help us)\s+/i;

const LEADING_VERB =
  /^(organi[sz]e|run|host|hold|start|launch|plan|create|help|raise|collect|build|bring|support|spread|clean|plant|teach|share|make|get|give|protect|save|improve|encourage|invite|gather|feed|provide|donate|set up|celebrate|keep)\b/i;

function cleanIdea(idea: string): string {
  return idea.replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "");
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function capFirst(text: string): string {
  const trimmed = text.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : trimmed;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sentencesOf(idea: string): string[] {
  return cleanIdea(idea)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

/** "Green Roots is a…" / "Haven Paws brings…" — the name the writer actually used. */
function statedOrgName(idea: string): string | null {
  const text = cleanIdea(idea);
  const patterns = [
    /^(.{2,70}?)\s+(?:is|are)\s+(?:a|an|the|our)\b/i,
    /^(.{2,70}?)\s+(?:brings|helps|supports|runs|hosts|organi[sz]es|serves|finds|plants|creates)\b/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (!match) continue;
    const raw = match[1].trim();
    if (/^(we|our|i|this|it|they|people)\b/i.test(raw)) continue;
    if (/\b(want|wants|would|need|needs|plan|plans)\b/i.test(raw)) continue;
    if (raw.split(/\s+/).length > 6) continue;
    return titleCase(raw);
  }
  return null;
}

function nameFromActivity(idea: string, topic: TopicDefinition, groupWord: string): string {
  const { phrase } = extractActivity(idea);
  const core = titleCase(corePhrase(phrase)).replace(/^(A|An|The)\s+/i, "").trim();
  const words = core.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && core.length <= 48 && !/^(We|Our|I)\b/.test(core)) return core;
  if (words.length === 1 && words[0].length > 3) return `${core} ${groupWord}`;
  return `${topic.orgWord} ${groupWord}`.replace(/\s+/g, " ").trim();
}

function actionSentence(idea: string, orgName: string): string {
  const sentences = sentencesOf(idea);
  const namedIntro = new RegExp(`^${escapeRegExp(orgName)}\\s+is\\s+(?:a|an|the)\\b`, "i");
  return (
    sentences.find((sentence) => /^(we|our)\b/i.test(sentence)) ??
    sentences.find((sentence) => !namedIntro.test(sentence)) ??
    sentences[0] ??
    cleanIdea(idea)
  );
}

function shortAction(idea: string, orgName: string): string {
  let text = actionSentence(idea, orgName);
  text = text.replace(new RegExp(`^${escapeRegExp(orgName)}\\s+`, "i"), "");
  text = text.replace(/^(we|our)\s+/i, "").replace(LEAD_IN, "").replace(/[.!?]+$/, "").trim();
  const clause = text.split(/\s+and\s+/i)[0]?.split(",")[0]?.trim() ?? text;
  return clause || text;
}

function initiativesFrom(idea: string, orgName: string): string[] {
  let text = actionSentence(idea, orgName);
  text = text.replace(new RegExp(`^${escapeRegExp(orgName)}\\s+`, "i"), "");
  text = text.replace(/^(we|our)\s+/i, "").replace(LEAD_IN, "").replace(/[.!?]+$/, "").trim();
  const parts = text
    .split(/\s*,\s*|\s+and\s+/i)
    .map((part) => part.trim())
    .filter((part) => part.split(/\s+/).filter(Boolean).length >= 2)
    .slice(0, 3)
    .map((part) => capFirst(part));
  const fillers = ["Invite someone who cares about this", "Share this website with your network", "Take part in a way that fits you"];
  for (const filler of fillers) {
    if (parts.length >= 3) break;
    parts.push(filler);
  }
  return parts.slice(0, 3);
}

const STOP = String.raw`(?=\s+(?:and|so|that|where|which|with|this|next|to invite|to bring|to help|to raise|by)\b|[,.;!?]|$)`;

type ActivityKind = "activity" | "fund" | "collect" | "awareness" | "fallback";

/** Pulls the core activity out of the idea, e.g. "community tree-planting drive". */
function extractActivity(idea: string): { phrase: string; kind: ActivityKind } {
  const text = cleanIdea(idea);
  const awareness = new RegExp(String.raw`\bawareness\s+(?:about|of|for|on|around)\s+(.+?)${STOP}`, "i").exec(text);
  if (awareness?.[1]) return { phrase: limitWords(awareness[1], 7), kind: "awareness" };

  const fund = new RegExp(String.raw`\braise\s+(?:money|funds)\s+(?:for|to)\s+(?:a |an |the |our )?(.+?)${STOP}`, "i").exec(text);
  if (fund?.[1]) return { phrase: limitWords(fund[1], 6), kind: "fund" };

  const collect = new RegExp(String.raw`\bcollect\s+(.+?)(?=\s+(?:for|and|to|from)\b|[,.;!?]|$)`, "i").exec(text);
  if (collect?.[1]) return { phrase: limitWords(collect[1], 5), kind: "collect" };

  const activity = new RegExp(
    String.raw`\b(?:organi[sz]e|run|host|hold|start|launch|plan|set up|create|arrange|lead|build|begin)\s+(?:a |an |the |our |some )?(.+?)${STOP}`,
    "i"
  ).exec(text);
  if (activity?.[1]) return { phrase: limitWords(activity[1], 6), kind: "activity" };

  const stripped = text.replace(LEAD_IN, "");
  const firstClause = stripped.split(/[,.;!?]|\s+and\s+/i)[0] || stripped;
  return { phrase: limitWords(firstClause, 6), kind: "fallback" };
}

/** Title-length core of a phrase: drops trailing location ("… in our apartment complex"). */
function corePhrase(phrase: string): string {
  return phrase.split(/\s+(?:in|at|near|around|across|for)\s+/i)[0] || phrase;
}

type GroupKind = "parents" | "school" | "students" | "nonprofit" | "individual" | "community";

function detectGroup(idea: string): GroupKind {
  const t = idea.toLowerCase();
  if (/\bparent|\bpta\b|\bpto\b|moms|dads/.test(t)) return "parents";
  if (/student|college|university|campus|club/.test(t)) return "students";
  if (/school|teacher|classroom/.test(t)) return "school";
  if (/nonprofit|non-profit|charity|foundation|\bngo\b/.test(t)) return "nonprofit";
  if (/^\s*i\b|\bmy\b/.test(t) && !/\bwe\b|\bour\b/.test(t)) return "individual";
  return "community";
}

const GROUP_META: Record<GroupKind, { orgWord: string; noun: string; audience: string }> = {
  parents: { orgWord: "Parents Circle", noun: "group of parents", audience: "Parents, families, and school staff" },
  school: { orgWord: "School Community", noun: "school community", audience: "Students, families, and teachers" },
  students: { orgWord: "Student Collective", noun: "student group", audience: "Students, friends, and supporters" },
  nonprofit: { orgWord: "Initiative", noun: "nonprofit initiative", audience: "Supporters, volunteers, and local partners" },
  individual: { orgWord: "Initiative", noun: "community initiative", audience: "Neighbors, friends, and local supporters" },
  community: { orgWord: "Community", noun: "community group", audience: "Neighbors, families, and local supporters" },
};

const GATHERING_ENDINGS = /(drive|day|event|walk|run|festival|fair|clean-?up|workshop|meetup|picnic|party|marathon|camp)$/i;

function primaryCtaFor(type: CampaignType, phrase: string): string {
  const ending = GATHERING_ENDINGS.exec(phrase.trim());
  if (ending) return `Join the ${ending[1].toLowerCase()}`;
  switch (type) {
    case "volunteering":
      return "Volunteer with us";
    case "fundraising":
      return "Support this campaign";
    case "awareness":
      return "Share the campaign";
    case "event":
      return "Join the event";
    case "community_challenge":
      return "Join the challenge";
    default:
      return "Count me in";
  }
}

function campaignTitle(phrase: string, kind: ActivityKind): string {
  const base = titleCase(phrase);
  if (kind === "fund") return `Support ${base}`;
  if (kind === "collect") return `${base} Collection Drive`;
  if (kind === "awareness") return `Spread the Word on ${titleCase(corePhrase(phrase))}`;
  return base;
}

function typeSentence(type: CampaignType): string {
  switch (type) {
    case "volunteering":
      return "Volunteers of every experience level are welcome, and even a few hours helps.";
    case "awareness":
      return "Learn what is happening, why it matters, and how to share it with others.";
    case "fundraising":
      return "Contributions of any size help bring this plan to life.";
    case "product_sales":
      return "Choosing an item is a simple way to support the cause.";
    case "custom":
      return "There is a simple way for everyone to take part.";
    default:
      return "Come along, lend a hand, and meet people who care about the same things you do.";
  }
}

function milestonesFor(type: CampaignType): string[] {
  if (type === "awareness") return [];
  if (type === "fundraising" || type === "product_sales") {
    return ["Share the campaign with friends", "Gather support", "Put the support to work", "Share an update with supporters"];
  }
  return ["Share the campaign and invite people", "Confirm who is taking part", "Take action together", "Celebrate together"];
}

function wantsChallenge(idea: string): boolean {
  return /challenge|habit|every day|daily|each day|for a week|30 days/i.test(idea);
}

function buildCampaign(params: {
  idea: string;
  orgName: string;
  topic: TopicDefinition;
  audience: string;
}): Campaign {
  const { idea, orgName, topic, audience } = params;
  const type = inferType(idea);
  const { phrase, kind } = extractActivity(idea);
  const title = campaignTitle(phrase, kind);
  const phraseText = lowerFirst(phrase);
  const id = uid("camp");
  const article = /^[aeiou]/i.test(phraseText) ? "an" : "a";

  const headline =
    kind === "fund"
      ? `Help us raise support for ${phraseText}`
      : kind === "awareness" || type === "awareness"
        ? `Help more people learn about ${kind === "awareness" ? phraseText : title}`
        : kind === "activity" || kind === "collect"
          ? `Join us for the ${title}`
          : `Join us: ${title}`;

  const opener =
    kind === "fund"
      ? `${orgName} is raising support for ${phraseText}.`
      : kind === "collect"
        ? `${orgName} is collecting ${phraseText} for people who need them.`
        : kind === "activity"
          ? `${orgName} is organizing ${article} ${phraseText}.`
          : kind === "awareness"
            ? `${orgName} is helping people learn about ${phraseText}.`
            : `${orgName} is bringing people together around one goal: ${phraseText}.`;

  const quizOn = type === "awareness";
  const challengeOn = wantsChallenge(idea);

  return {
    id,
    slug: `${slugify(title)}-${id.slice(-4)}`,
    type,
    status: "draft",
    name: title,
    idea,
    cause: idea,
    beneficiaries: topic.beneficiaries,
    goal: idea,
    audience,
    startDate: "",
    endDate: "",
    organizationName: orgName,
    featureOnWebsite: true,
    archived: false,
    title,
    headline,
    description: `${opener} ${typeSentence(type)} Everyone is welcome — invite a friend and take part together.`,
    whyItMatters: topic.whyItMatters,
    primaryCta: primaryCtaFor(type, phrase),
    suggestedAudience: audience,
    milestones: milestonesFor(type),
    socialMessage:
      type === "awareness"
        ? `Learn about ${title} with ${orgName} and pass it on.`
        : `I'm joining ${title} with ${orgName}. Want to come along?`,
    suggestedActivity: quizOn ? "Short quiz" : challengeOn ? "Week-long challenge" : "",
    template: "community",
    theme: topic.theme,
    heroImage: topic.heroImage,
    showProgress: false,
    optionalSections: ["milestones"],
    quiz: quizOn ? buildTopicQuiz(topic, title) : { ...defaultQuiz(), enabled: false },
    challenge: challengeOn ? buildTopicChallenge(topic) : { ...defaultChallenge(), enabled: false },
    poll: { ...defaultPoll(), enabled: false, votes: defaultPoll().options.map(() => 0) },
    sponsor: {
      ...defaultSponsor(),
      enabled: false,
      name: "",
      logoLabel: "",
      voucherDescription: "",
      rewardDescription: "",
    },
    metrics: { interactions: 0, fundsRaised: 0, engagementRate: 0, completions: 0, supporters: 0 },
    createdAt: new Date().toISOString(),
    isSample: false,
  };
}

function buildWebsite(params: {
  idea: string;
  orgName: string;
  groupNoun: string;
  topic: TopicDefinition;
}): OrgWebsite {
  const { idea, orgName, groupNoun, topic } = params;
  const content = defaultWebsiteContent(orgName);
  const written = cleanIdea(idea);
  const mentionsName = new RegExp(`\\b${escapeRegExp(orgName)}\\b`, "i").test(written);
  const purpose = lowerFirst(written.replace(LEAD_IN, ""));
  const about = mentionsName
    ? written
    : LEADING_VERB.test(purpose)
      ? `${orgName} is a ${groupNoun} that wants to ${purpose}.`
      : `${orgName} is a ${groupNoun} bringing people together around ${topic.focus}. ${written}`;
  const action = actionSentence(idea, orgName).replace(/[.!?]+$/, "");
  const heroDescription = new RegExp(`^${escapeRegExp(orgName)}\\b`, "i").test(action)
    ? action
    : /^we\s+/i.test(action)
      ? `${orgName}. ${action}`
      : `${orgName} — ${action}`;
  const mission = capFirst(shortAction(idea, orgName).replace(/[.!?]+$/, ""));
  const headlineSource = titleCase(limitWords(shortAction(idea, orgName), 8));
  const headline = headlineSource.split(/\s+/).filter(Boolean).length >= 2 ? headlineSource : topic.websiteHeadline;

  return {
    status: "draft",
    template: "community",
    heroImage: topic.heroImage,
    brandTheme: topic.theme,
    logoLabel: initials(orgName),
    content: {
      ...content,
      siteName: orgName,
      headline,
      heroDescription,
      about: about.endsWith(".") ? about : `${about}.`,
      mission: mission.endsWith(".") ? mission : `${mission}.`,
      vision: topic.id === "general" ? `A community where ${orgName} makes it easy for people to take part together.` : topic.vision,
      featuredInitiatives: initiativesFrom(idea, orgName),
      primaryCtaLabel: "About us",
      primaryCtaHref: "#about",
      secondaryCtaLabel: "Get involved",
      supportHeading: "Ways to get involved",
      supportBody: `You don't need special skills to help ${orgName}. Bring a friend, or share this website with someone who cares.`,
      supportCtaLabel: "See how to help",
      impactStatOneLabel: "",
      impactStatOneValue: "",
      impactStatTwoLabel: "",
      impactStatTwoValue: "",
      impactStatThreeLabel: "",
      impactStatThreeValue: "",
    },
    sections: DEFAULT_WEBSITE_SECTIONS().map((s) =>
      s.id === "activities" || s.id === "contact" || s.id === "campaigns" ? { ...s, enabled: false } : s
    ),
    lastEditedAt: new Date().toISOString(),
    previewMode: "desktop",
  };
}

export const localRulesGenerator: ImpactSpaceGenerator = {
  source: "local_rules",
  async generate(idea) {
    const trimmed = idea.trim();
    const stated = statedOrgName(trimmed);
    const group = GROUP_META[detectGroup(trimmed)];
    // Ignore the written name when choosing a topic, so "Oak Street" is not treated as a street clean-up.
    const topic = detectTopic(stated ? trimmed.replace(new RegExp(escapeRegExp(stated), "ig"), " ") : trimmed);
    const orgName = stated ?? nameFromActivity(trimmed, topic, group.orgWord);
    const campaign = buildCampaign({ idea: trimmed, orgName, topic, audience: group.audience });
    const website = buildWebsite({ idea: trimmed, orgName, groupNoun: group.noun, topic });

    const organization: Organization = {
      name: orgName,
      shortName: orgName.split(/\s+/).slice(0, 2).join(" "),
      description: website.content.heroDescription,
      mission: website.content.mission,
      location: "",
      contactLabel: "",
      logoLabel: website.logoLabel,
      websitePurpose: "Share our organization and invite people to take part",
      socialInstagram: "",
      socialFacebook: "",
      socialWebsite: "",
      brandTheme: topic.theme,
      orgSlug: slugify(orgName),
    };

    return {
      id: uid("space"),
      idea: trimmed,
      createdAt: new Date().toISOString(),
      source: "local_rules",
      organization,
      website,
      campaign,
    };
  },
};

export function getActiveGenerator(): ImpactSpaceGenerator {
  return localRulesGenerator;
}

export async function generateImpactSpace(
  idea: string,
  generator: ImpactSpaceGenerator = getActiveGenerator()
): Promise<PendingImpactSpace> {
  const error = validateIdea(idea);
  if (error) throw new Error(error);
  return generator.generate(idea);
}
