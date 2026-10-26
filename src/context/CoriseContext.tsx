"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";
import type {
  Campaign,
  CampaignChangeSet,
  CoriseDemoState,
  Organization,
  OrgWebsite,
  PendingImpactSpace,
  WebsiteWizardDraft,
  WizardDraft,
} from "@/types/corise";
import { DEFAULT_WEBSITE_SECTIONS } from "@/types/corise";
import { OWNER_LABEL, OWNER_ROLE } from "@/lib/roles";
import {
  createInitialState,
  createLicensedInitialState,
  emptyDraft,
  emptyWebsiteDraft,
  websiteDraftFromExisting,
} from "@/lib/sample-data";
import { CORISE_STORAGE_KEY, clearState, loadState, saveState } from "@/lib/storage";
import { slugify, uid } from "@/lib/format";
import {
  validateCampaignForPublish,
  validateWebsiteForPublish,
  type PublishResult,
} from "@/lib/impact-space/publish";
import { buildOrgCampaign } from "@/lib/org-campaign";
import { formatUsd, MAX_PLEDGE, validateOrgCampaignInput, type OrgCampaignErrors, type OrgCampaignInput } from "@/lib/progress";

type PublishOptions = { silent?: boolean };

type CoriseContextValue = {
  state: CoriseDemoState;
  hydrated: boolean;
  /** Signs the visitor in as the workspace owner (demo only — no password, not secure). */
  signIn: (opts?: { userName?: string; email?: string }) => void;
  signOut: () => void;
  resetDemo: () => void;
  /** Starts a fresh Licensed Edition workspace: no website yet, no campaigns. */
  startLicensedWorkspace: () => void;
  showToast: (message: string, tone?: "success" | "info" | "warn") => void;
  clearToast: () => void;
  startDraft: () => void;
  updateDraft: (patch: Partial<WizardDraft>) => void;
  setDraftStep: (step: number) => void;
  clearDraft: () => void;
  saveDraftCampaign: () => { id: string; slug: string };
  publishDraft: () => { id: string; slug: string };
  getCampaign: (idOrSlug: string) => Campaign | undefined;
  /** Published, non-archived campaigns only — for supporter / public routes. */
  getPublicCampaign: (idOrSlug: string) => Campaign | undefined;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  updateOrganization: (patch: Partial<CoriseDemoState["organization"]>) => void;
  recordQuizCompletion: (campaignId: string) => void;
  castPollVote: (campaignId: string, optionIndex: number) => void;
  startWebsiteWizard: () => void;
  editWebsiteWizard: () => void;
  updateWebsiteDraft: (patch: Partial<WebsiteWizardDraft>) => void;
  setWebsiteDraftStep: (step: number) => void;
  clearWebsiteDraft: () => void;
  saveWebsiteDraft: () => void;
  /** Validates, then publishes the website draft (or current website) in this browser. */
  publishWebsite: (opts?: PublishOptions) => PublishResult;
  deleteWebsite: () => void;
  setWebsitePreviewMode: (mode: "desktop" | "mobile") => void;
  setPendingSpace: (space: PendingImpactSpace) => void;
  discardPendingSpace: () => void;
  /** Edits the unsaved organization website (before it is claimed into the workspace). */
  updatePendingWebsite: (patch: Partial<OrgWebsite>) => void;
  /**
   * Saves the visitor's unsaved page into the workspace and returns its campaign id.
   * Replaces sample content the first time; later pages are added alongside existing ones.
   */
  claimPendingSpace: () => string | null;
  /**
   * Saves the visitor's unsaved organization + website (no campaign) into the workspace.
   * Only used for the very first, not-yet-claimed organization built from the home page idea box.
   */
  claimPendingWebsite: () => void;
  /** Edits a page's content in place — the unsaved preview or a saved campaign. Changes apply immediately. */
  editCampaign: (id: string, patch: CampaignChangeSet) => void;
  publishCampaign: (id: string, opts?: PublishOptions) => PublishResult;
  recordParticipation: (campaignId: string) => void;
  /** Validates and immediately publishes a campaign under the organization. */
  createOrgCampaign: (input: OrgCampaignInput) => { ok: true; campaign: Campaign } | { ok: false; errors: OrgCampaignErrors };
  /** Records a supporter's pledge (no payment is taken). */
  recordPledge: (campaignId: string, amount: number) => void;
};

function applyOrgFromWebsiteDraft(s: CoriseDemoState, d: WebsiteWizardDraft) {
  return {
    ...s.organization,
    name: d.orgName,
    shortName: d.orgShortName || s.organization.shortName,
    description: d.description,
    mission: d.mission,
    location: d.location,
    contactLabel: d.contactLabel,
    websitePurpose: d.websitePurpose,
    socialInstagram: d.socialInstagram,
    socialFacebook: d.socialFacebook,
    socialWebsite: d.socialWebsite,
    logoLabel: d.logoLabel,
    brandTheme: d.brandTheme,
  };
}

function draftToWebsite(d: WebsiteWizardDraft, status: OrgWebsite["status"]): OrgWebsite {
  return {
    status,
    template: d.template || "community",
    heroImage: d.heroImage,
    brandTheme: d.brandTheme,
    logoLabel: d.logoLabel,
    content: d.content,
    sections: d.sections.length ? d.sections : DEFAULT_WEBSITE_SECTIONS(),
    lastEditedAt: new Date().toISOString(),
    publishedAt: status === "published" ? new Date().toISOString() : undefined,
    previewMode: "desktop",
  };
}

/** The website as the owner currently edit it: the draft if one exists, otherwise the saved website. */
export function websiteCandidate(s: CoriseDemoState): { website: OrgWebsite | null; organization: Organization } {
  if (s.websiteDraft) {
    return { website: draftToWebsite(s.websiteDraft, "draft"), organization: applyOrgFromWebsiteDraft(s, s.websiteDraft) };
  }
  return { website: s.website, organization: s.organization };
}

const CoriseContext = createContext<CoriseContextValue | null>(null);

function draftToCampaign(draft: WizardDraft, status: Campaign["status"]): Campaign {
  const title = draft.title || draft.name || "Untitled campaign";
  const id = uid("camp");
  const slugBase = slugify(title);
  return {
    id,
    slug: `${slugBase}-${id.slice(-4)}`,
    type: draft.type || "custom",
    status,
    name: draft.name || title,
    idea: draft.idea,
    cause: draft.cause,
    beneficiaries: draft.beneficiaries,
    goal: draft.goal,
    audience: draft.audience,
    startDate: draft.startDate,
    endDate: draft.endDate,
    organizationName: draft.organizationName,
    featureOnWebsite: draft.featureOnWebsite,
    archived: false,
    fundraisingTarget: draft.fundraisingTarget
      ? Number(draft.fundraisingTarget) || undefined
      : undefined,
    title,
    headline: draft.headline || title,
    description: draft.description,
    whyItMatters: draft.whyItMatters,
    primaryCta: draft.primaryCta || "Join this campaign",
    suggestedAudience: draft.suggestedAudience,
    milestones: draft.milestones,
    socialMessage: draft.socialMessage,
    suggestedActivity: draft.suggestedActivity,
    template: draft.template,
    theme: draft.theme,
    heroImage: draft.heroImage,
    showProgress: draft.showProgress,
    optionalSections: draft.optionalSections,
    quiz: draft.quiz,
    challenge: draft.challenge,
    poll: draft.poll,
    sponsor: draft.sponsor,
    metrics: { interactions: 0, fundsRaised: 0, engagementRate: 0, completions: 0, supporters: 0 },
    createdAt: new Date().toISOString(),
    publishedAt: status === "published" ? new Date().toISOString() : undefined,
    isSample: false,
  };
}

export function CoriseProvider({ children }: { children: ReactNode }) {
  const [state, setRawState] = useState<CoriseDemoState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);

  /**
   * Applies updates synchronously against the latest state, so actions called back-to-back
   * in one handler (e.g. claim the preview, then publish it) always see each other's results.
   */
  const setState = useCallback((action: SetStateAction<CoriseDemoState>) => {
    const next = typeof action === "function" ? action(stateRef.current) : action;
    stateRef.current = next;
    setRawState(next);
  }, []);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === CORISE_STORAGE_KEY) setState(loadState());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setState]);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  const showToast = useCallback(
    (message: string, tone: "success" | "info" | "warn" = "info") => {
      setState((s) => ({ ...s, toast: { message, tone } }));
    },
    [setState]
  );

  const clearToast = useCallback(() => {
    setState((s) => ({ ...s, toast: null }));
  }, [setState]);

  const signIn = useCallback((opts?: { userName?: string; email?: string }) => {
    setState((s) => ({
      ...s,
      isSignedIn: true,
      managerRole: OWNER_ROLE,
      userRole: OWNER_LABEL,
      userName: opts?.userName?.trim() || s.userName,
      userEmail: opts?.email?.trim() || s.userEmail,
    }));
  }, [setState]);

  const signOut = useCallback(() => {
    setState((s) => ({
      ...s,
      isSignedIn: false,
      managerRole: null,
      draft: null,
      websiteDraft: null,
    }));
  }, [setState]);

  const resetDemo = useCallback(() => {
    clearState();
    setState((s) => {
      const fresh = createInitialState();
      fresh.isSignedIn = s.isSignedIn;
      fresh.managerRole = s.managerRole;
      fresh.userRole = s.userRole;
      return {
        ...fresh,
        toast: { message: "Sample content restored.", tone: "info" },
      };
    });
  }, [setState]);

  const startLicensedWorkspace = useCallback(() => {
    clearState();
    setState((s) => {
      const fresh = createLicensedInitialState();
      fresh.isSignedIn = s.isSignedIn;
      fresh.managerRole = s.managerRole;
      fresh.userRole = s.userRole;
      return {
        ...fresh,
        toast: { message: "Your licensed workspace is ready. Create your website, then add a campaign.", tone: "info" },
      };
    });
  }, [setState]);

  const startDraft = useCallback(() => {
    setState((s) => ({ ...s, draft: emptyDraft() }));
  }, [setState]);

  const updateDraft = useCallback((patch: Partial<WizardDraft>) => {
    setState((s) => {
      const base = s.draft ?? emptyDraft();
      return { ...s, draft: { ...base, ...patch } };
    });
  }, [setState]);

  const setDraftStep = useCallback((step: number) => {
    setState((s) => {
      if (!s.draft) return s;
      return { ...s, draft: { ...s.draft, step } };
    });
  }, [setState]);

  const clearDraft = useCallback(() => {
    setState((s) => ({ ...s, draft: null }));
  }, [setState]);

  const saveDraftCampaign = useCallback(() => {
    let result = { id: "", slug: "" };
    setState((s) => {
      if (!s.draft) return s;
      const campaign = draftToCampaign(s.draft, "draft");
      result = { id: campaign.id, slug: campaign.slug };
      return {
        ...s,
        campaigns: [campaign, ...s.campaigns],
        draft: null,
        activity: [
          {
            id: uid("act"),
            type: "create",
            message: `Draft saved: ${campaign.title}`,
            timeLabel: "Just now",
            at: new Date().toISOString(),
            campaignName: campaign.title,
          },
          ...s.activity,
        ],
        toast: { message: "Campaign saved as draft.", tone: "success" },
      };
    });
    return result;
  }, [setState]);

  const publishDraft = useCallback(() => {
    let result = { id: "", slug: "" };
    setState((s) => {
      if (!s.draft) return s;
      const campaign = draftToCampaign(s.draft, "published");
      result = { id: campaign.id, slug: campaign.slug };
      return {
        ...s,
        campaigns: [campaign, ...s.campaigns],
        draft: null,
        lastPublishedId: campaign.id,
        activity: [
          {
            id: uid("act"),
            type: "publish",
            message: `Published: ${campaign.title}`,
            timeLabel: "Just now",
            at: new Date().toISOString(),
            campaignName: campaign.title,
          },
          ...s.activity,
        ],
        toast: {
          message: "Campaign published in this browser — public hosting isn't connected yet.",
          tone: "success",
        },
      };
    });
    return result;
  }, [setState]);

  const getCampaign = useCallback(
    (idOrSlug: string) =>
      state.campaigns.find((c) => c.id === idOrSlug || c.slug === idOrSlug),
    [state.campaigns]
  );

  /** A campaign is public only once it's published AND the organization's website is published. */
  const getPublicCampaign = useCallback(
    (idOrSlug: string) =>
      state.website?.status === "published"
        ? state.campaigns.find(
            (c) =>
              (c.id === idOrSlug || c.slug === idOrSlug) &&
              c.status === "published" &&
              !c.archived
          )
        : undefined,
    [state.campaigns, state.website]
  );

  const updateCampaign = useCallback((id: string, patch: Partial<Campaign>) => {
    setState((s) => ({
      ...s,
      campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, [setState]);

  const updateOrganization = useCallback(
    (patch: Partial<CoriseDemoState["organization"]>) => {
      setState((s) => ({
        ...s,
        organization: { ...s.organization, ...patch },
        toast: { message: "Organization details updated (saved in this browser).", tone: "success" },
      }));
    },
    [setState]
  );

  const recordQuizCompletion = useCallback((campaignId: string) => {
    setState((s) => ({
      ...s,
      campaigns: s.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              metrics: {
                ...c.metrics,
                completions: c.metrics.completions + 1,
                interactions: c.metrics.interactions + 1,
                supporters: c.metrics.supporters + 1,
              },
            }
          : c
      ),
      activity: [
        {
          id: uid("act"),
          type: "quiz",
          message: "A supporter completed the campaign quiz",
          timeLabel: "Just now",
          at: new Date().toISOString(),
        },
        ...s.activity,
      ],
    }));
  }, [setState]);

  const castPollVote = useCallback((campaignId: string, optionIndex: number) => {
    setState((s) => ({
      ...s,
      campaigns: s.campaigns.map((c) => {
        if (c.id !== campaignId) return c;
        const votes = [...c.poll.votes];
        while (votes.length < c.poll.options.length) votes.push(0);
        votes[optionIndex] = (votes[optionIndex] || 0) + 1;
        return {
          ...c,
          poll: { ...c.poll, votes },
          metrics: {
            ...c.metrics,
            interactions: c.metrics.interactions + 1,
          },
        };
      }),
    }));
  }, [setState]);

  const startWebsiteWizard = useCallback(() => {
    setState((s) => ({
      ...s,
      websiteDraft: emptyWebsiteDraft(s.organization),
    }));
  }, [setState]);

  const editWebsiteWizard = useCallback(() => {
    setState((s) => {
      if (!s.website) {
        return { ...s, websiteDraft: emptyWebsiteDraft(s.organization) };
      }
      if (s.websiteDraft) return s;
      return {
        ...s,
        websiteDraft: websiteDraftFromExisting(s.organization, s.website),
      };
    });
  }, [setState]);

  const updateWebsiteDraft = useCallback((patch: Partial<WebsiteWizardDraft>) => {
    setState((s) => {
      const base = s.websiteDraft ?? emptyWebsiteDraft(s.organization);
      return { ...s, websiteDraft: { ...base, ...patch } };
    });
  }, [setState]);

  const setWebsiteDraftStep = useCallback((step: number) => {
    setState((s) => {
      if (!s.websiteDraft) return s;
      return { ...s, websiteDraft: { ...s.websiteDraft, step } };
    });
  }, [setState]);

  const clearWebsiteDraft = useCallback(() => {
    setState((s) => ({ ...s, websiteDraft: null }));
  }, [setState]);

  const saveWebsiteDraft = useCallback(() => {
    setState((s) => {
      if (!s.websiteDraft) return s;
      if (s.website?.status === "published") {
        return {
          ...s,
          toast: { message: "Changes saved. Visitors still see the live website until you publish updates.", tone: "success" },
        };
      }
      const website = draftToWebsite(s.websiteDraft, "draft");
      return {
        ...s,
        organization: applyOrgFromWebsiteDraft(s, s.websiteDraft),
        website,
        websiteDraft: null,
        toast: {
          message: "Organization website saved as draft.",
          tone: "success",
        },
      };
    });
  }, [setState]);

  const publishWebsite = useCallback((opts?: PublishOptions): PublishResult => {
    const candidate = websiteCandidate(stateRef.current);
    const check = validateWebsiteForPublish(candidate.website, candidate.organization);
    if (!check.ok) {
      if (!opts?.silent) showToast(check.error, "warn");
      return check;
    }
    setState((s) => {
      const source = s.websiteDraft
        ? draftToWebsite(s.websiteDraft, "published")
        : s.website
          ? {
              ...s.website,
              status: "published" as const,
              publishedAt: new Date().toISOString(),
              lastEditedAt: new Date().toISOString(),
            }
          : null;
      if (!source) return s;
      const organization = s.websiteDraft
        ? applyOrgFromWebsiteDraft(s, s.websiteDraft)
        : s.organization;
      const renamed = organization.name !== s.organization.name;
      return {
        ...s,
        organization,
        campaigns: renamed
          ? s.campaigns.map((c) =>
              c.organizationName === s.organization.name
                ? { ...c, organizationName: organization.name }
                : c
            )
          : s.campaigns,
        website: source,
        websiteDraft: null,
        activity: [
          {
            id: uid("act"),
            type: "publish",
            message: "Organization website published",
            timeLabel: "Just now",
            at: new Date().toISOString(),
          },
          ...s.activity,
        ],
        toast: opts?.silent
          ? s.toast
          : {
              message: "Website published. Its link works in this browser — public hosting isn't connected yet.",
              tone: "success",
            },
      };
    });
    return { ok: true };
  }, [setState, showToast]);

  const deleteWebsite = useCallback(() => {
    setState((s) => ({
      ...s,
      website: null,
      websiteDraft: null,
      toast: { message: "Organization website removed.", tone: "info" },
    }));
  }, [setState]);

  const setWebsitePreviewMode = useCallback((mode: "desktop" | "mobile") => {
    setState((s) => {
      if (!s.website) return s;
      return { ...s, website: { ...s.website, previewMode: mode } };
    });
  }, [setState]);

  const setPendingSpace = useCallback((space: PendingImpactSpace) => {
    setState((s) => ({ ...s, pendingSpace: space }));
  }, [setState]);

  const discardPendingSpace = useCallback(() => {
    setState((s) => ({ ...s, pendingSpace: null }));
  }, [setState]);

  const updatePendingWebsite = useCallback((patch: Partial<OrgWebsite>) => {
    setState((s) => {
      if (!s.pendingSpace) return s;
      return { ...s, pendingSpace: { ...s.pendingSpace, website: { ...s.pendingSpace.website, ...patch } } };
    });
  }, [setState]);

  const claimPendingWebsite = useCallback(() => {
    setState((s) => {
      const p = s.pendingSpace;
      if (!p) return s;
      const now = new Date().toISOString();
      // Initial website creation does not publish a campaign. Drop the sample campaigns
      // that ship with a fresh browser; later website edits keep campaigns the org already has.
      const firstPage = !s.claimedSpace;
      const kept = firstPage ? [] : s.campaigns.filter((c) => !c.isSample);
      return {
        ...s,
        organization: p.organization,
        website: p.website,
        websiteDraft: null,
        campaigns: kept,
        pendingSpace: null,
        claimedSpace: { idea: p.idea, source: p.source, claimedAt: now },
      };
    });
  }, [setState]);

  const claimPendingSpace = useCallback((): string | null => {
    const p = stateRef.current.pendingSpace;
    if (!p) return null;
    setState((s) => {
      const firstPage = !s.claimedSpace;
      const organization = firstPage ? p.organization : s.organization;
      const campaign: Campaign = { ...p.campaign, organizationName: organization.name };
      const entry = {
        id: uid("act"),
        type: "create" as const,
        message: `Page created: ${campaign.title}`,
        timeLabel: "Just now",
        at: new Date().toISOString(),
        campaignName: campaign.title,
      };
      return {
        ...s,
        organization,
        website: firstPage ? p.website : s.website,
        websiteDraft: firstPage ? null : s.websiteDraft,
        draft: null,
        campaigns: firstPage ? [campaign] : [campaign, ...s.campaigns],
        activity: firstPage ? [entry] : [entry, ...s.activity],
        lastPublishedId: firstPage ? null : s.lastPublishedId,
        pendingSpace: null,
        claimedSpace: {
          idea: p.idea,
          source: p.source,
          campaignId: campaign.id,
          claimedAt: new Date().toISOString(),
        },
      };
    });
    return p.campaign.id;
  }, [setState]);

  const editCampaign = useCallback((id: string, patch: CampaignChangeSet) => {
    const now = new Date().toISOString();
    setState((s) => {
      if (s.pendingSpace?.campaign.id === id) {
        return { ...s, pendingSpace: { ...s.pendingSpace, campaign: { ...s.pendingSpace.campaign, ...patch } } };
      }
      return {
        ...s,
        campaigns: s.campaigns.map((c) => {
          if (c.id !== id) return c;
          const { pendingChanges, ...live } = c;
          return { ...live, ...pendingChanges, ...patch, updatedAt: now };
        }),
      };
    });
  }, [setState]);

  const publishCampaign = useCallback((id: string, opts?: PublishOptions): PublishResult => {
    const check = validateCampaignForPublish(stateRef.current.campaigns.find((c) => c.id === id));
    if (!check.ok) {
      if (!opts?.silent) showToast(check.error, "warn");
      return check;
    }
    setState((s) => {
      const target = s.campaigns.find((c) => c.id === id);
      if (!target) return s;
      const { pendingChanges, ...live } = target;
      const now = new Date().toISOString();
      const published: Campaign = {
        ...live,
        ...pendingChanges,
        status: "published",
        publishedAt: live.publishedAt ?? now,
        updatedAt: now,
      };
      return {
        ...s,
        campaigns: s.campaigns.map((c) => (c.id === id ? published : c)),
        lastPublishedId: id,
        activity: [
          {
            id: uid("act"),
            type: "publish",
            message: `${pendingChanges ? "Updated" : "Published"}: ${published.title}`,
            timeLabel: "Just now",
            at: new Date().toISOString(),
            campaignName: published.title,
          },
          ...s.activity,
        ],
        toast: opts?.silent
          ? s.toast
          : {
              message: "Campaign published. Supporters can open its link without an account in this browser.",
              tone: "success",
            },
      };
    });
    return { ok: true };
  }, [setState, showToast]);

  const recordParticipation = useCallback((campaignId: string) => {
    setState((s) => ({
      ...s,
      activity: [
        {
          id: uid("act"),
          type: "interaction" as const,
          message: `A supporter joined ${s.campaigns.find((c) => c.id === campaignId)?.title ?? "a campaign"}`,
          timeLabel: "Just now",
          at: new Date().toISOString(),
        },
        ...s.activity,
      ].slice(0, 30),
      campaigns: s.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              metrics: {
                ...c.metrics,
                interactions: c.metrics.interactions + 1,
                supporters: c.metrics.supporters + 1,
              },
            }
          : c
      ),
    }));
  }, [setState]);

  const createOrgCampaign = useCallback(
    (input: OrgCampaignInput): { ok: true; campaign: Campaign } | { ok: false; errors: OrgCampaignErrors } => {
      const errors = validateOrgCampaignInput(input);
      if (Object.keys(errors).length) return { ok: false, errors };
      const campaign = buildOrgCampaign(input, stateRef.current.organization);
      setState((s) => ({
        ...s,
        campaigns: [campaign, ...s.campaigns],
        lastPublishedId: campaign.id,
        activity: [
          {
            id: uid("act"),
            type: "publish" as const,
            message: `Published: ${campaign.title}`,
            timeLabel: "Just now",
            at: campaign.publishedAt,
            campaignName: campaign.title,
          },
          ...s.activity,
        ].slice(0, 30),
      }));
      return { ok: true, campaign };
    },
    [setState]
  );

  const recordPledge = useCallback((campaignId: string, amount: number) => {
    if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_PLEDGE) return;
    setState((s) => {
      const target = s.campaigns.find((c) => c.id === campaignId && c.status === "published" && !c.archived);
      if (!target) return s;
      return {
        ...s,
        activity: [
          {
            id: uid("act"),
            type: "interaction" as const,
            message: `A supporter pledged ${formatUsd(amount)} to ${target.title}`,
            timeLabel: "Just now",
            at: new Date().toISOString(),
          },
          ...s.activity,
        ].slice(0, 30),
        campaigns: s.campaigns.map((c) =>
          c.id === campaignId
            ? {
                ...c,
                metrics: {
                  ...c.metrics,
                  pledged: (c.metrics.pledged ?? 0) + amount,
                  interactions: c.metrics.interactions + 1,
                  supporters: c.metrics.supporters + 1,
                },
              }
            : c
        ),
      };
    });
  }, [setState]);

  const value = useMemo(
    () => ({
      state,
      hydrated,
      signIn,
      signOut,
      resetDemo,
      startLicensedWorkspace,
      showToast,
      clearToast,
      startDraft,
      updateDraft,
      setDraftStep,
      clearDraft,
      saveDraftCampaign,
      publishDraft,
      getCampaign,
      getPublicCampaign,
      updateCampaign,
      updateOrganization,
      recordQuizCompletion,
      castPollVote,
      startWebsiteWizard,
      editWebsiteWizard,
      updateWebsiteDraft,
      setWebsiteDraftStep,
      clearWebsiteDraft,
      saveWebsiteDraft,
      publishWebsite,
      deleteWebsite,
      setWebsitePreviewMode,
      setPendingSpace,
      discardPendingSpace,
      updatePendingWebsite,
      claimPendingSpace,
      claimPendingWebsite,
      editCampaign,
      publishCampaign,
      recordParticipation,
      createOrgCampaign,
      recordPledge,
    }),
    [
      state,
      hydrated,
      signIn,
      signOut,
      resetDemo,
      startLicensedWorkspace,
      showToast,
      clearToast,
      startDraft,
      updateDraft,
      setDraftStep,
      clearDraft,
      saveDraftCampaign,
      publishDraft,
      getCampaign,
      getPublicCampaign,
      updateCampaign,
      updateOrganization,
      recordQuizCompletion,
      castPollVote,
      startWebsiteWizard,
      editWebsiteWizard,
      updateWebsiteDraft,
      setWebsiteDraftStep,
      clearWebsiteDraft,
      saveWebsiteDraft,
      publishWebsite,
      deleteWebsite,
      setWebsitePreviewMode,
      setPendingSpace,
      discardPendingSpace,
      updatePendingWebsite,
      claimPendingSpace,
      claimPendingWebsite,
      editCampaign,
      publishCampaign,
      recordParticipation,
      createOrgCampaign,
      recordPledge,
    ]
  );

  return <CoriseContext.Provider value={value}>{children}</CoriseContext.Provider>;
}

export function useCorise() {
  const ctx = useContext(CoriseContext);
  if (!ctx) throw new Error("useCorise must be used within CoriseProvider");
  return ctx;
}
