import { HeroVisual } from "@/components/campaign/HeroVisual";
import type { WizardDraft } from "@/types/corise";

export function LivePreview({ draft }: { draft: WizardDraft }) {
  return (
    <div className="corise-card overflow-hidden">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        Live campaign preview
      </div>
      <HeroVisual
        imageKey={draft.heroImage}
        title={draft.headline || draft.title || "Your headline"}
        className="min-h-[140px] rounded-none"
      />
      <div className="space-y-3 p-4">
        <p className="text-xs font-semibold text-[var(--color-primary)]">
          {draft.organizationName || "Your organization"}
        </p>
        <h3 className="font-display text-xl font-semibold">
          {draft.title || draft.name || "Campaign title"}
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          {draft.description || "Your campaign description will appear here."}
        </p>
        <button
          type="button"
          className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          {draft.primaryCta || "Join this campaign"}
        </button>
      </div>
    </div>
  );
}
