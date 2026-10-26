import type {
  Organization,
  OrgWebsiteContent,
  ThemePreset,
  WebsiteTemplate,
  WebsiteWizardDraft,
} from "@/types/corise";
import { DEFAULT_WEBSITE_SECTIONS } from "@/types/corise";

function pick<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 997;
  return items[h % items.length];
}

export function defaultWebsiteContent(orgName: string): OrgWebsiteContent {
  return {
    siteName: orgName,
    headline: `Neighbors creating lasting change with ${orgName}`,
    heroDescription:
      "We help people take practical action for a healthier community—through clear campaigns anyone can join.",
    about: `${orgName} brings neighbors, schools, and local partners together to run campaigns that are easy to understand and join.`,
    mission:
      "Make community action simple, visible, and welcoming for people of every age and digital comfort level.",
    vision: "A neighborhood where caring for people and planet is part of everyday life.",
    featuredInitiatives: [
      "Tree planting and green spaces",
      "School and library support",
      "Neighborhood care drives",
    ],
    primaryCtaLabel: "Explore campaigns",
    primaryCtaHref: "#campaigns",
    secondaryCtaLabel: "Get involved",
    supportHeading: "Support, volunteer, or share",
    supportBody:
      "Whether you have an hour, a skill, or a network to share—there is a way to help that fits your life.",
    supportCtaLabel: "See how to help",
    activitiesHeading: "Upcoming activities",
    activitiesBody:
      "Join planting days, clean-ups, packing sessions, and learning events hosted with local partners.",
    contactHeading: "Contact us",
    contactBody: "Questions about a campaign or partnership? We would love to hear from you.",
    impactStatOneLabel: "Active campaigns",
    impactStatOneValue: "5+",
    impactStatTwoLabel: "Community actions",
    impactStatTwoValue: "1.8k",
    impactStatThreeLabel: "Local partners",
    impactStatThreeValue: "12",
  };
}

export function generateWebsiteContent(
  draft: Pick<
    WebsiteWizardDraft,
    | "orgName"
    | "description"
    | "mission"
    | "websitePurpose"
    | "template"
    | "location"
  >,
  mode: "generate" | "regenerate" | "shorter" | "engaging" = "generate"
): OrgWebsiteContent {
  const seed = `${draft.template}|${draft.orgName}|${draft.mission}|${mode}`;
  const name = draft.orgName || "Our organization";
  const base = defaultWebsiteContent(name);

  const headlines = [
    `${name}: Your idea. Your campaign. Your impact.`,
    `Practical action for a stronger ${draft.location || "community"}`,
    `Join neighbors shaping a better tomorrow`,
    `Campaigns you can understand—and join today`,
  ];

  const heros = [
    draft.description || base.heroDescription,
    `${name} makes it easy to start campaigns, invite supporters, and keep momentum without complicated tools.`,
    `From awareness to volunteering and fundraising—we help people take the next step together.`,
  ];

  const content: OrgWebsiteContent = {
    ...base,
    siteName: name,
    headline: pick(headlines, seed),
    heroDescription: pick(heros, seed + "h"),
    about:
      draft.description ||
      `${name} helps people create and join campaigns that support local causes.`,
    mission: draft.mission || base.mission,
    vision: pick(
      [
        base.vision,
        "Communities where everyone can contribute without needing technical skills.",
        "Clear campaigns, warm invitations, and lasting local partnerships.",
      ],
      seed + "v"
    ),
    featuredInitiatives: [
      draft.websitePurpose || "Community campaigns people can join",
      "Volunteer and learning activities",
      "Local partnerships and sponsorships",
    ],
  };

  if (draft.template === "nonprofit") {
    content.primaryCtaLabel = "Support our mission";
    content.supportHeading = "Give, volunteer, or partner";
    content.headline = pick(
      [`Stand with ${name}`, `Hope in action with ${name}`, content.headline],
      seed + "np"
    );
  }
  if (draft.template === "community") {
    content.primaryCtaLabel = "See community campaigns";
    content.activitiesHeading = "Events & volunteer days";
    content.headline = pick(
      [`Built by neighbors, for neighbors`, `Your community, in motion`, content.headline],
      seed + "cm"
    );
  }
  if (draft.template === "modern") {
    content.primaryCtaLabel = "Explore impact";
    content.headline = pick(
      [`Bold action. Shared impact.`, `The modern home for your cause`, content.headline],
      seed + "md"
    );
  }

  if (mode === "shorter") {
    content.heroDescription = content.heroDescription.split(" ").slice(0, 18).join(" ") + "…";
    content.about = content.about.split(" ").slice(0, 22).join(" ") + "…";
  }
  if (mode === "engaging") {
    content.heroDescription += " Start with one campaign—invite a friend to join you.";
    content.secondaryCtaLabel = "Take part today";
  }
  if (mode === "regenerate") {
    content.headline = pick(headlines, seed + "regen");
    content.heroDescription = pick(heros, seed + "regen2");
  }

  return content;
}

export function templatePreviewAccent(template: WebsiteTemplate): string {
  if (template === "nonprofit") return "from-[#5C2A3A] to-[#1B4332]";
  if (template === "community") return "from-[#1A3A4A] to-[#C4A35A]";
  return "from-[#1B4332] to-[#40916C]";
}

function inferWebsiteTemplate(description: string): WebsiteTemplate {
  const d = description.toLowerCase();
  if (/school|parent|pta|community|neighbor|volunteer/.test(d)) return "community";
  if (/charity|nonprofit|donation|fund|mission/.test(d)) return "nonprofit";
  if (/modern|climate|tech|impact|startup/.test(d)) return "modern";
  return "community";
}

function inferHeroFromDescription(description: string): string {
  const d = description.toLowerCase();
  if (/tree|plant|garden|green|climate/.test(d)) return "trees";
  if (/school|book|librar|educat/.test(d)) return "library";
  if (/clean|street|litter/.test(d)) return "cleanup";
  if (/care|health|family|kit/.test(d)) return "care";
  return "trees";
}

/** Minimum-input website generation from name + short description. */
export function buildWebsiteFromSimpleInput(
  orgName: string,
  whatWeDo: string,
  org: Organization
): WebsiteWizardDraft {
  const description = whatWeDo.trim() || org.description;
  const name = orgName.trim() || org.name;
  const template = inferWebsiteTemplate(description);
  const brandTheme: ThemePreset = org.brandTheme || "forest";
  const content = generateWebsiteContent(
    {
      orgName: name,
      description,
      mission: org.mission || description,
      websitePurpose: org.websitePurpose || description,
      template,
      location: org.location,
    },
    "generate"
  );
  content.about = description;
  content.heroDescription =
    content.heroDescription ||
    `${name} helps people take part in clear, welcoming campaigns.`;
  content.mission = org.mission || `Make it easy for people to support: ${description}`;

  return {
    step: 4,
    template,
    orgName: name,
    orgShortName: org.shortName || name.split(" ")[0] || name,
    description,
    mission: content.mission,
    location: org.location,
    contactLabel: org.contactLabel,
    websitePurpose: description,
    socialInstagram: org.socialInstagram,
    socialFacebook: org.socialFacebook,
    socialWebsite: org.socialWebsite,
    logoLabel: org.logoLabel || name.slice(0, 2).toUpperCase(),
    brandTheme,
    heroImage: inferHeroFromDescription(description),
    content,
    sections: DEFAULT_WEBSITE_SECTIONS(),
    generated: true,
  };
}
