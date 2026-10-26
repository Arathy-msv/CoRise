"use client";

import { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { OrgWebsiteRenderer } from "@/components/website/OrgWebsiteRenderer";
import { ToastHost } from "@/components/ui/Toast";
import { useApp } from "@/context/AppContext";
import { useCorise, websiteCandidate } from "@/context/CoriseContext";
import { directoryWebsite } from "@/lib/deployment";
function Unavailable({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
        <Icon name="globe" size={20} />
      </span>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-[var(--color-text-muted)]">{body}</p>
      <ButtonLink href="/" variant="ghost" size="sm">
        Go to Corise
      </ButtonLink>
    </div>
  );
}

function OrgSiteInner({ slug }: { slug: string }) {
  const { state, hydrated } = useCorise();
  const { organizations, hydrated: appHydrated } = useApp();
  const search = useSearchParams();
  const isWebsiteMgr = state.isSignedIn;
  const preview = search.get("preview") === "1" && isWebsiteMgr;

  if (!hydrated || !appHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-sm text-[var(--color-text-muted)]">
        Loading website…
      </div>
    );
  }

  const slugMatches =
    slug === state.organization.orgSlug || slug === state.organization.shortName.toLowerCase().replace(/\s+/g, "-");
  const directoryOrg = organizations.find((o) => o.slug === slug);
  const ownSiteLive = slugMatches && (preview || state.website?.status === "published");

  if (directoryOrg && !ownSiteLive) {
    const site = directoryWebsite(directoryOrg, state.organization);
    return (
      <>
        <OrgWebsiteRenderer website={site.website} organization={site.organization} campaigns={[]} />
        <ToastHost />
      </>
    );
  }

  if (!slugMatches) {
    return <Unavailable title="Organization not found" body={`No public website is available at “${slug}”.`} />;
  }

  // Supporters only ever see the published website; managers may preview the draft explicitly.
  const { website, organization } = preview ? websiteCandidate(state) : { website: state.website, organization: state.organization };

  if (!website) {
    return <Unavailable title="Website coming soon" body="This organization hasn't published a website yet." />;
  }
  if (website.status !== "published" && !preview) {
    return <Unavailable title="Website not published yet" body="This organization's website isn't available to the public yet." />;
  }

  return (
    <>
      {preview ? (
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-navy-border)] bg-[var(--color-navy)] px-4 py-2 text-white">
          <p className="flex items-center gap-2 text-xs font-medium text-[var(--color-navy-muted)]">
            <Icon name="eye" size={14} />
            Draft preview — visitors can&apos;t see this version
          </p>
          <ButtonLink href="/website" variant="dark" size="sm">
            <Icon name="arrowLeft" />
            Back to My Website
          </ButtonLink>
        </div>
      ) : null}
      <OrgWebsiteRenderer
        website={website}
        organization={organization}
        campaigns={state.campaigns.filter((c) => c.organizationName === organization.name)}
      />
      <ToastHost />
    </>
  );
}

function OrgSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-sm text-[var(--color-text-muted)]">
          Loading website…
        </div>
      }
    >
      <OrgSiteInner slug={slug} />
    </Suspense>
  );
}

export default OrgSitePage;
