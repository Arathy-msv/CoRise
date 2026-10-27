"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  DEFAULT_SHARE_NOTE,
  MAX_ENDORSEMENT_NOTE,
  SHARE_NOTE_PRESETS,
  buildPersonalizedShareUrl,
  buildShareMessage,
} from "@/lib/endorsement";
import { withBasePath } from "@/lib/public-asset";
import { InviteSupporters } from "@/components/campaign/InviteSupporters";

const noop = () => () => undefined;

export function PersonalizedShareModal({
  path,
  campaignTitle,
  onClose,
}: {
  /** Canonical public path for this campaign, e.g. /org/acme/help-us-plant-trees */
  path: string;
  campaignTitle: string;
  onClose: () => void;
}) {
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  const [note, setNote] = useState(DEFAULT_SHARE_NOTE);
  const [copied, setCopied] = useState(false);
  const [inviting, setInviting] = useState(false);
  const link = buildPersonalizedShareUrl(origin, withBasePath(path), "", note);
  const message = buildShareMessage("", note, link);
  const encodedLink = encodeURIComponent(link);
  const selectedId = SHARE_NOTE_PRESETS.find((preset) => preset.note === note)?.id;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const channels = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: "💬",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
      className: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    },
    {
      id: "email",
      label: "Email",
      icon: "✉️",
      href: `mailto:?subject=${encodeURIComponent(campaignTitle)}&body=${encodeURIComponent(message)}`,
      className: "bg-gray-50 text-gray-700 hover:bg-gray-100",
    },
    {
      id: "x",
      label: "X / Post",
      icon: "𝕏",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(note.trim())}&url=${encodedLink}`,
      className: "bg-gray-50 text-gray-700 hover:bg-gray-100",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: "💼",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`,
      className: "bg-gray-50 text-gray-700 hover:bg-gray-100",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <button type="button" aria-label="Close" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-campaign-title"
        className="relative max-h-[min(92vh,760px)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1 text-gray-700 hover:bg-gray-100"
        >
          <Icon name="x" size={18} />
        </button>

        <h2 id="share-campaign-title" className="pr-8 text-xl font-bold text-gray-900">
          Share this campaign
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">Help spread the word with friends, family, and community.</p>

        {inviting ? (
          <div className="mt-4">
            <InviteSupporters onBack={() => setInviting(false)} />
          </div>
        ) : (
          <>
        <p className="mb-2 mt-5 text-[10px] font-bold uppercase tracking-wider text-amber-900/80">1-tap quick share</p>
        <div className="grid grid-cols-4 gap-2">
          {channels.map((channel) => (
            <a
              key={channel.id}
              href={channel.href}
              target={channel.id === "email" ? undefined : "_blank"}
              rel={channel.id === "email" ? undefined : "noreferrer"}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold ${channel.className}`}
            >
              <span aria-hidden className={channel.id === "linkedin" ? "text-[11px] font-bold" : undefined}>
                {channel.icon}
              </span>
              {channel.label}
            </a>
          ))}
        </div>

        <div className="my-4 flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 border-t border-dashed border-gray-300" />
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Or attach a quick note (optional)
          </span>
          <span className="h-px flex-1 border-t border-dashed border-gray-300" />
        </div>

        <div className="flex flex-wrap gap-2">
          {SHARE_NOTE_PRESETS.map((preset) => {
            const selected = preset.id === selectedId;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setNote(preset.note)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  selected ? "bg-[#183B2E] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <label htmlFor="share-note" className="sr-only">
          Quick note
        </label>
        <textarea
          id="share-note"
          value={note}
          maxLength={MAX_ENDORSEMENT_NOTE}
          rows={2}
          onChange={(e) => setNote(e.target.value)}
          className="mt-3 w-full resize-none rounded-xl border-0 bg-[#FAF8F5] p-3 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#183B2E]"
        />

        <button
          type="button"
          onClick={() => void copyLink()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#183B2E] py-3 text-xs font-semibold text-white hover:bg-[#122D23]"
        >
          <span aria-hidden>{copied ? "✓" : "🔗"}</span>
          {copied ? "Link Copied!" : "Copy Shareable Link"}
        </button>
        <button
          type="button"
          onClick={() => setInviting(true)}
          className="mt-2 w-full rounded-xl border border-gray-300 bg-white py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
        >
          Share with supporters
        </button>
          </>
        )}
      </div>
    </div>
  );
}
