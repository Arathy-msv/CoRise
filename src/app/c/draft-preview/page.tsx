"use client";

import { useRouter } from "next/navigation";
import { HeroVisual } from "@/components/campaign/HeroVisual";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { Button } from "@/components/ui/Button";
import { useCorise } from "@/context/CoriseContext";

/** Organizer-only draft glance — not a public supporter URL. */
export default function DraftPreviewPage() {
  const { state, hydrated } = useCorise();
  const router = useRouter();
  const draft = state.draft;

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        Loading…
      </div>
    );
  }

  if (!state.isSignedIn) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="font-display text-2xl font-semibold">Manager preview only</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Draft campaign previews are not public supporter pages.
        </p>
        <Button onClick={() => router.push("/login")}>Manager sign in</Button>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-display text-2xl font-semibold">No draft to preview</h1>
        <Button onClick={() => router.push("/campaigns/create")}>Back to create</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <p className="font-display font-semibold text-[var(--color-primary)]">
            {draft.organizationName}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => router.push("/campaigns/create")}>
              Return to editor
            </Button>
            <ProfileMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Draft preview · not published · not shareable to supporters
        </p>
        <HeroVisual
          imageKey={draft.heroImage}
          title={draft.headline || draft.title}
          className="min-h-[200px]"
        />
        <div className="space-y-3">
          <h1 className="font-display text-[28px] font-semibold">
            {draft.title || draft.name || "Untitled campaign"}
          </h1>
          <p className="text-[15px] text-[var(--color-text-muted)]">{draft.description}</p>
          <Button>{draft.primaryCta}</Button>
        </div>
      </main>
    </div>
  );
}
