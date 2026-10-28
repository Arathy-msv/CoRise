"use client";

import { useState } from "react";
import { useSupporterNetwork } from "@/components/supporter/supporter-data";
import { useCorise } from "@/context/CoriseContext";
import { MAX_INVITATION_MESSAGE, findMembership, sendInvitations, type InvitationResult } from "@/lib/supporter-network";
import { DEMO_SUPPORTERS } from "@/lib/supporters";

export type InviteCampaign = { id: string; title: string; orgSlug: string };

/**
 * Demo invite list. Nothing is emailed. With a `campaign`, invitations are saved and appear on each
 * supporter's Invitations page; without one, the list only confirms the selection.
 */
export function InviteSupporters({
  onBack,
  campaign,
  backLabel = "Back to share options",
}: {
  onBack: () => void;
  campaign?: InviteCampaign;
  backLabel?: string;
}) {
  const { state } = useCorise();
  const network = useSupporterNetwork();
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[] | null>(null);
  const [saved, setSaved] = useState<InvitationResult | null>(null);
  const [error, setError] = useState("");

  const statusFor = (supporterId: string): string | null => {
    if (!campaign) return null;
    if (findMembership(network, campaign.orgSlug, campaign.id, supporterId)) return "Joined";
    const latest = network.invitations
      .filter((i) => i.orgSlug === campaign.orgSlug && i.campaignId === campaign.id && i.supporterId === supporterId)
      .sort((a, b) => b.invitedAt.localeCompare(a.invitedAt))[0];
    if (!latest) return null;
    return latest.status === "pending" ? "Invited" : latest.status === "declined" ? "Declined" : "Joined";
  };
  const invitable = DEMO_SUPPORTERS.filter((person) => {
    const status = statusFor(person.id);
    return status !== "Joined" && status !== "Invited";
  });
  const allSelected = invitable.length > 0 && invitable.every((person) => selected.includes(person.id));

  const reset = () => {
    setSent(null);
    setSaved(null);
    setError("");
  };

  const toggle = (id: string) => {
    reset();
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleAll = () => {
    reset();
    setSelected(allSelected ? [] : invitable.map((person) => person.id));
  };

  const send = () => {
    if (selected.length === 0) return;
    if (!campaign) {
      setSent(selected);
      return;
    }
    const result = sendInvitations({
      orgSlug: campaign.orgSlug,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      supporterIds: selected,
      message,
      invitedBy: state.organization.name || state.userName,
    });
    if (!result) {
      setError("Couldn't save the invitations in this browser. Try again.");
      return;
    }
    setSaved(result);
    setSelected([]);
  };

  return (
    <div>
      <button type="button" onClick={onBack} className="text-xs font-semibold text-[#183B2E] underline">
        {backLabel}
      </button>
      <p className="mt-2 text-xs text-gray-500">
        {campaign
          ? "Pick who should get an invitation. They'll see it on their Invitations page in the supporter view. Nothing is emailed."
          : "Pick who should get an invitation. This is a demo, so no email is sent."}
      </p>

      <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-800">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          disabled={invitable.length === 0}
          className="h-4 w-4 accent-[#183B2E]"
        />
        Select all ({invitable.length})
      </label>

      <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-2">
        {DEMO_SUPPORTERS.map((person) => {
          const status = statusFor(person.id);
          const locked = status === "Joined" || status === "Invited";
          return (
            <li key={person.id}>
              <label
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${locked ? "cursor-default opacity-70" : "cursor-pointer hover:bg-[#F6F8F5]"}`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(person.id)}
                  onChange={() => toggle(person.id)}
                  disabled={locked}
                  className="h-4 w-4 accent-[#183B2E]"
                />
                <span className="font-semibold text-gray-900">{person.name}</span>
                <span className="truncate text-gray-500">{person.email}</span>
                {status ? (
                  <span className="ml-auto shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">{status}</span>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>

      {campaign ? (
        <label className="mt-3 block text-xs font-semibold text-gray-800">
          Message (optional)
          <textarea
            value={message}
            maxLength={MAX_INVITATION_MESSAGE}
            rows={2}
            onChange={(e) => {
              setMessage(e.target.value);
              reset();
            }}
            placeholder={`We'd love your help spreading the word about ${campaign.title}.`}
            className="mt-1 w-full resize-none rounded-xl border border-gray-200 p-2.5 text-xs font-normal text-gray-800 outline-none focus:ring-2 focus:ring-[#183B2E]"
          />
        </label>
      ) : null}

      {error ? <p className="mt-3 text-xs font-semibold text-red-700">{error}</p> : null}

      {sent ? (
        <p role="status" className="mt-3 rounded-xl bg-[#F6F8F5] px-3 py-2 text-xs font-semibold text-[#183B2E]">
          Ready for {sent.length} {sent.length === 1 ? "person" : "people"}. No email was sent.
        </p>
      ) : saved ? (
        <p role="status" className="mt-3 rounded-xl bg-[#F6F8F5] px-3 py-2 text-xs font-semibold text-[#183B2E]">
          {saved.created} {saved.created === 1 ? "invitation" : "invitations"} saved — waiting on each supporter&apos;s Invitations page.
          {saved.alreadyInvited + saved.alreadyJoined > 0
            ? ` ${saved.alreadyInvited + saved.alreadyJoined} skipped (already invited or joined).`
            : ""}{" "}
          No email was sent.
        </p>
      ) : (
        <button
          type="button"
          onClick={send}
          disabled={selected.length === 0}
          className="mt-3 w-full rounded-xl bg-[#183B2E] py-2.5 text-xs font-semibold text-white hover:bg-[#122D23] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selected.length === 0 ? "Select supporters to invite" : `Send invitations (${selected.length})`}
        </button>
      )}
    </div>
  );
}
