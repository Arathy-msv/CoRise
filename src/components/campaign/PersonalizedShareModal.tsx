"use client";

import { useState, useSyncExternalStore } from "react";
import { CopyLinkButton } from "@/components/ui/CopyLinkButton";
import { Modal } from "@/components/ui/Modal";
import {
  MAX_ENDORSEMENT_NOTE,
  MAX_ENDORSER_NAME,
  QUICK_ENDORSEMENT_PROMPTS,
  buildPersonalizedShareQuery,
  buildPersonalizedShareUrl,
  buildShareMessage,
} from "@/lib/endorsement";

const noop = () => () => undefined;

export function PersonalizedShareModal({
  path,
  campaignTitle,
  defaultName = "",
  onClose,
  onNameChange,
}: {
  /** Canonical public path for this campaign, e.g. /org/acme/help-us-plant-trees */
  path: string;
  campaignTitle: string;
  defaultName?: string;
  onClose: () => void;
  /** Lets the caller remember the supporter's name in this browser for next time. */
  onNameChange?: (name: string) => void;
}) {
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  const [name, setName] = useState(defaultName);
  const [note, setNote] = useState("");

  const query = buildPersonalizedShareQuery(name, note);
  const link = buildPersonalizedShareUrl(origin, path, name, note);
  const message = buildShareMessage(name, note, link);
  const displayName = name.trim() || "A supporter";
  const u = encodeURIComponent(link);

  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  const xText = note.trim() ? `${displayName} wants you to check out this campaign: "${note.trim()}"` : `${displayName} wants you to check out this campaign`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${u}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(`${displayName} shared ${campaignTitle} with you`)}&body=${encodeURIComponent(message)}`;

  return (
    <Modal title="Share with a personal note" description="A quick note from you means a lot more than a bare link." onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label htmlFor="endorser-name" className="block text-sm font-semibold">
            Your name
          </label>
          <input
            id="endorser-name"
            value={name}
            maxLength={MAX_ENDORSER_NAME}
            onChange={(e) => {
              setName(e.target.value);
              onNameChange?.(e.target.value);
            }}
            placeholder="Jordan"
            className="corise-input mt-1.5"
          />
        </div>

        <div>
          <label htmlFor="endorser-note" className="block text-sm font-semibold">
            Personal note
          </label>
          <textarea
            id="endorser-note"
            value={note}
            maxLength={MAX_ENDORSEMENT_NOTE}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why are you supporting this cause? (e.g., I just donated! Join me to help our community...)"
            rows={3}
            className="corise-input mt-1.5 resize-none"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_ENDORSEMENT_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setNote(prompt)}
                className="rounded-full border border-black/10 px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[var(--color-bg)] p-3 text-sm text-[var(--color-text-muted)]" data-testid="endorsement-preview">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Preview</p>
          <p className="leading-relaxed">
            <span className="font-semibold text-[var(--color-text)]">{displayName}</span> wants you to check out this campaign
            {note.trim() ? (
              <>
                : &ldquo;{note.trim()}&rdquo;
              </>
            ) : null}{" "}
            — View Campaign: <span className="font-medium text-[var(--color-primary)]">{link}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-[var(--color-bg)] p-2 pl-3">
          <input
            readOnly
            value={link}
            aria-label="Personalized link"
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
          />
          <CopyLinkButton path={`${path}${query}`} label="Copy Personalized Link" variant="primary" />
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Share with a note">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[var(--color-bg)] px-3 py-1.5 text-[13px] font-medium transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
          >
            WhatsApp
          </a>
          <a
            href={xHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[var(--color-bg)] px-3 py-1.5 text-[13px] font-medium transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
          >
            X
          </a>
          <a
            href={linkedinHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[var(--color-bg)] px-3 py-1.5 text-[13px] font-medium transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
          >
            LinkedIn
          </a>
          <a
            href={emailHref}
            className="rounded-full bg-[var(--color-bg)] px-3 py-1.5 text-[13px] font-medium transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
          >
            Email
          </a>
        </div>
      </div>
    </Modal>
  );
}
