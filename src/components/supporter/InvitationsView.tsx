"use client";

import { HeroVisual } from "@/components/campaign/HeroVisual";
import { SupporterHeader } from "@/components/supporter/SupporterShell";
import { useSupporterNetwork, type SupporterOrg } from "@/components/supporter/supporter-data";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { useCorise } from "@/context/CoriseContext";
import { shareCampaignPath, supporterViewPath } from "@/lib/paths";
import { respondToInvitation, type InvitationStatus } from "@/lib/supporter-network";
import type { DemoSupporter } from "@/lib/supporters";

const STATUS: Record<InvitationStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending", tone: "warning" },
  accepted: { label: "Accepted", tone: "success" },
  declined: { label: "Declined", tone: "neutral" },
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function InvitationsView({ org, supporter }: { org: SupporterOrg; supporter: DemoSupporter }) {
  const network = useSupporterNetwork();
  const { showToast } = useCorise();

  const invitations = network.invitations
    .filter((i) => i.orgSlug === org.orgSlug && i.supporterId === supporter.id)
    .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.invitedAt.localeCompare(a.invitedAt));

  const respond = (id: string, title: string, response: "accepted" | "declined") => {
    const result = respondToInvitation(id, supporter.id, response);
    if (!result.ok) {
      showToast("This invitation was already answered or couldn't be saved.", "warn");
      return;
    }
    showToast(
      response === "accepted"
        ? result.joined
          ? `You joined ${title}. No donation was made.`
          : `Invitation accepted — you were already a supporter of ${title}.`
        : `Invitation to ${title} declined.`,
      response === "accepted" ? "success" : "info",
    );
  };

  return (
    <div className="space-y-6">
      <SupporterHeader
        eyebrow="Supporter view"
        title="Invitations"
        body={`Campaigns ${org.orgName} has invited you to support. Accepting adds the campaign to My Campaigns — it never takes a payment.`}
      />

      {invitations.length === 0 ? (
        <EmptyState
          icon="mail"
          title="No invitations"
          body={`When ${org.orgName} invites you to a campaign, it shows up here. You can still join any campaign yourself.`}
          action={
            <ButtonLink href={supporterViewPath("campaigns", org.orgSlug)} variant="secondary">
              Explore campaigns
            </ButtonLink>
          }
        />
      ) : (
        <ul className="space-y-4">
          {invitations.map((invitation) => {
            const campaign = org.campaigns.find((c) => c.id === invitation.campaignId);
            const title = campaign?.title || invitation.campaignTitle || "Campaign";
            const status = STATUS[invitation.status];
            return (
              <li
                key={invitation.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm sm:flex-row"
              >
                <HeroVisual
                  imageKey={campaign?.heroImage ?? ""}
                  aspect="aspect-[16/9] sm:aspect-auto"
                  className="rounded-none sm:w-56 sm:shrink-0"
                />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-[17px] font-semibold leading-snug">{title}</h2>
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        {campaign?.organizationName || org.orgName}
                        {invitation.invitedBy ? ` · Invited by ${invitation.invitedBy}` : ""}
                        {formatDate(invitation.invitedAt) ? ` · ${formatDate(invitation.invitedAt)}` : ""}
                      </p>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  {invitation.message ? (
                    <p className="whitespace-pre-line break-words rounded-xl bg-[var(--color-bg)] px-3 py-2 text-sm italic">
                      &ldquo;{invitation.message}&rdquo;
                    </p>
                  ) : null}
                  {!campaign ? (
                    <p className="text-sm text-[var(--color-text-muted)]">This campaign is no longer public.</p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap gap-2">
                    {campaign ? (
                      <ButtonLink href={shareCampaignPath(campaign.slug, org.orgSlug)} variant="secondary" size="sm" target="_blank" rel="noreferrer">
                        <Icon name="external" />
                        View campaign
                      </ButtonLink>
                    ) : null}
                    {invitation.status === "pending" && campaign ? (
                      <>
                        <Button size="sm" onClick={() => respond(invitation.id, title, "accepted")}>
                          <Icon name="check" />
                          Accept
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => respond(invitation.id, title, "declined")}>
                          Decline
                        </Button>
                      </>
                    ) : null}
                    {invitation.status === "accepted" ? (
                      <ButtonLink href={supporterViewPath("my-campaigns", org.orgSlug)} size="sm" variant="ghost">
                        Open My Campaigns
                        <Icon name="arrowRight" />
                      </ButtonLink>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
