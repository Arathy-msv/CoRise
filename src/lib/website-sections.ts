import type { SectionBackground, WebsiteSection } from "@/types/corise";
import { uid } from "@/lib/format";

export type SectionTemplate = "story" | "banner" | "campaigns";

export const SECTION_TEMPLATES: Record<SectionTemplate, { label: string; description: string; icon: string }> = {
  story: { label: "Text & Story", description: "A heading and a paragraph to tell your story.", icon: "📝" },
  banner: { label: "Photo Banner", description: "A wide photo with a short caption.", icon: "🖼️" },
  campaigns: { label: "Campaign Cards", description: "A grid of your active campaigns.", icon: "📣" },
};

export const SECTION_BACKGROUNDS: { id: SectionBackground; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "tinted", label: "Tinted" },
  { id: "dark", label: "Dark" },
];

export function sectionBackground(section: Pick<WebsiteSection, "id" | "background">): SectionBackground {
  return section.background ?? (section.id === "mission" ? "tinted" : "light");
}

export function sectionKey(section: WebsiteSection): string {
  return section.key ?? section.id;
}

export function createSectionFromTemplate(template: SectionTemplate, image = "community"): WebsiteSection {
  const key = uid("sec");
  if (template === "story") {
    return {
      id: "story",
      key,
      label: "Text & Story",
      enabled: true,
      heading: "Our story",
      body: "Share how your organization started, who you serve, and what keeps your volunteers coming back.",
    };
  }
  if (template === "banner") {
    return { id: "banner", key, label: "Photo Banner", enabled: true, image, caption: "Volunteers at our latest community day." };
  }
  return { id: "campaigns", key, label: "Campaign Cards", enabled: true, heading: "Get involved", body: "Campaigns you can join today." };
}

export function swapSections(sections: WebsiteSection[], a: number, b: number): WebsiteSection[] {
  if (a === b || a < 0 || b < 0 || a >= sections.length || b >= sections.length) return sections;
  const next = [...sections];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

export function removeSectionAt(sections: WebsiteSection[], index: number): WebsiteSection[] {
  if (index < 0 || index >= sections.length) return sections;
  return sections.filter((_, i) => i !== index);
}

export function insertSectionAt(sections: WebsiteSection[], index: number, section: WebsiteSection): WebsiteSection[] {
  const at = Math.max(0, Math.min(index, sections.length));
  return [...sections.slice(0, at), section, ...sections.slice(at)];
}
