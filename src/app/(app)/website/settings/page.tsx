"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { canAccessOrgDashboard } from "@/lib/deployment";
import { publicOrgPath } from "@/lib/paths";
import { WebsiteStatusBadge } from "@/components/website/OrgWebsiteRenderer";

export default function WebsiteSettingsPage() {
  const { state, publishWebsite, editWebsiteWizard, deleteWebsite, showToast } = useCorise();
  const { mode, role } = useApp();
  const canCreate = canAccessOrgDashboard(mode, role);
  const router = useRouter();
  const website = state.website;

  if (!website) {
    return (
      <div className="corise-card mx-auto max-w-lg space-y-3 p-5 text-center">
        <p className="text-sm">No website to configure yet.</p>
        <ButtonLink href="/website">Go to My Website</ButtonLink>
      </div>
    );
  }

  return (
    <div className="animate-fade-up corise-page mx-auto max-w-2xl">
      <div>
        <button type="button" className="corise-back" onClick={() => router.push("/website")}>
          ← My Website
        </button>
        <h1 className="corise-page-title font-display text-[28px] font-semibold">
          Publishing & access
        </h1>
      </div>

      <div className="corise-card space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Status</h2>
          <WebsiteStatusBadge status={website.status} />
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Public URL:{" "}
          <Link
            href={publicOrgPath(state.organization.orgSlug)}
            className="font-semibold text-[var(--color-primary)]"
          >
            /org/{state.organization.orgSlug}
          </Link>
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          Custom domains are a future capability. Supporters open this URL without signing in.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {!canCreate ? (
            <p className="text-sm text-[var(--color-text-muted)]">Only an organization admin can change this website.</p>
          ) : null}
          {canCreate && website.status !== "published" ? (
            <Button
              onClick={() => {
                publishWebsite();
                showToast(
                  "Website published in this browser — public hosting isn't connected yet.",
                  "success"
                );
              }}
            >
              Publish Website
            </Button>
          ) : (
            <ButtonLink href={publicOrgPath(state.organization.orgSlug)} target="_blank">
              View website
            </ButtonLink>
          )}
          {canCreate ? (
            <Button
              variant="secondary"
              onClick={() => {
                editWebsiteWizard();
                router.push("/website/create");
              }}
            >
              Return to Editor
            </Button>
          ) : null}
          {canCreate ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Remove this website from this browser?")) deleteWebsite();
                router.push("/website");
              }}
            >
              Delete website
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
