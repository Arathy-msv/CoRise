"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { copyText } from "@/lib/clipboard";
import { supporterCampaignPath } from "@/lib/paths";
import { absoluteUrl } from "@/lib/public-asset";
import { defaultPersonalNote, type CampaignMembership } from "@/lib/supporter-network";
import type { DemoSupporter } from "@/lib/supporters";
import type { Campaign } from "@/types/corise";

type CopyState = { target: "link" | "message"; ok: boolean } | null;

export function ShareLinkDialog({
  campaign,
  orgSlug,
  supporter,
  membership,
  onClose,
  onEditNote,
}: {
  campaign: Campaign;
  orgSlug: string;
  supporter: DemoSupporter;
  membership: CampaignMembership;
  onClose: () => void;
  onEditNote: () => void;
}) {
  const linkRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState<CopyState>(null);
  const [shareError, setShareError] = useState("");

  const url = absoluteUrl(supporterCampaignPath(campaign.slug, orgSlug, supporter.id));
  const note = membership.personalNote || defaultPersonalNote(campaign.title);
  const message = `${note}\n\n${campaign.title}: ${url}`;
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copy = async (target: "link" | "message") => {
    const ok = await copyText(target === "link" ? url : message, target === "link" ? linkRef.current : messageRef.current);
    setCopied({ target, ok });
    window.setTimeout(() => setCopied((current) => (current?.target === target ? null : current)), 2400);
  };

  const nativeShare = async () => {
    setShareError("");
    try {
      await navigator.share({ title: campaign.title, text: note, url });
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") setShareError("Sharing isn't available here — copy the link instead.");
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const channels = [
    { id: "whatsapp", label: "WhatsApp", href: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}` },
    { id: "email", label: "Email", href: `mailto:?subject=${encodeURIComponent(campaign.title)}&body=${encodeURIComponent(message)}` },
    { id: "x", label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(note)}&url=${encodedUrl}` },
    { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  const status = (target: "link" | "message", idle: string) =>
    copied?.target === target ? (copied.ok ? "Copied" : "Copy failed — select and copy it") : idle;

  return (
    <Modal
      title="Share your supporter link"
      description={`Your personal link for ${campaign.title}. Pledges made through it count toward your place on the leaderboard.`}
      onClose={onClose}
      wide
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Share on">
          {channels.map((channel) => (
            <a
              key={channel.id}
              href={channel.href}
              target={channel.id === "email" ? undefined : "_blank"}
              rel={channel.id === "email" ? undefined : "noreferrer"}
              className="rounded-xl bg-[var(--color-bg)] px-3 py-2.5 text-center text-sm font-semibold transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
            >
              {channel.label}
            </a>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--color-border)] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {membership.personalNote ? "Your attached note" : "Default note (you haven't written one)"}
            </p>
            <button type="button" onClick={onEditNote} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline">
              <Icon name="edit" size={13} />
              Edit note
            </button>
          </div>
          <p className="mt-1.5 whitespace-pre-line break-words text-sm italic text-[var(--color-text-muted)]">&ldquo;{note}&rdquo;</p>
        </div>

        <div>
          <label htmlFor="supporter-link" className="text-sm font-semibold">
            Your referral link
          </label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-[var(--color-bg)] p-2 pl-3">
            <input
              id="supporter-link"
              ref={linkRef}
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
            />
            <Button size="sm" onClick={() => void copy("link")}>
              <Icon name={copied?.target === "link" && copied.ok ? "check" : "copy"} />
              {status("link", "Copy link")}
            </Button>
          </div>
        </div>

        <div>
          <label htmlFor="supporter-message" className="text-sm font-semibold">
            Ready-to-send message
          </label>
          <textarea
            id="supporter-message"
            ref={messageRef}
            readOnly
            rows={4}
            value={message}
            className="corise-input mt-1.5 resize-none text-sm"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => void copy("message")}>
              <Icon name={copied?.target === "message" && copied.ok ? "check" : "copy"} />
              {status("message", "Copy message")}
            </Button>
            {canNativeShare ? (
              <Button variant="secondary" size="sm" onClick={() => void nativeShare()}>
                <Icon name="share" />
                Share…
              </Button>
            ) : null}
          </div>
          {shareError ? <p className="mt-2 text-xs font-medium text-[var(--color-danger)]">{shareError}</p> : null}
        </div>

        <p aria-live="polite" className="sr-only">
          {copied ? (copied.ok ? "Copied to clipboard" : "Copy failed") : ""}
        </p>

        <p className="text-xs text-[var(--color-text-muted)]">
          People who open this link see your note above the campaign. Nothing is sent from Corise — you choose where to share it.
          This demo keeps data in this browser, so the link opens with your note here, not on other devices.
        </p>
      </div>
    </Modal>
  );
}
