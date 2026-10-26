"use client";

import { useSyncExternalStore } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { CopyLinkButton } from "@/components/ui/CopyLinkButton";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";

const noop = () => () => undefined;

function shareLinks(url: string, title: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "Email", href: `mailto:?subject=${t}&body=${u}` },
  ];
}

export function PublishedModal({
  title,
  path,
  onClose,
  kind = "campaign",
  websiteLive = true,
}: {
  title: string;
  path: string;
  onClose: () => void;
  /** Website publish confirms the organization site. Campaign publish keeps join-and-share actions. */
  kind?: "website" | "campaign";
  /** When the org's public website isn't published yet, a campaign link isn't reachable publicly either. */
  websiteLive?: boolean;
}) {
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  const url = `${origin}${path}`;
  const website = kind === "website";

  return (
    <Modal
      title={website ? `Your ${title} website is live` : "Your page is live"}
      description={website ? "Your organization website is public." : "Share the link so people can join."}
      onClose={onClose}
      icon={
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
          <Icon name="check" size={22} />
        </span>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2 rounded-xl bg-[var(--color-bg)] p-2 pl-3">
          <input
            readOnly
            value={url}
            aria-label="Public link"
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
          />
          {website ? null : <CopyLinkButton path={path} variant="primary" />}
        </div>

        {website ? null : (
          <div className="flex flex-wrap gap-2" aria-label="Share">
            {shareLinks(url, title).map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[var(--color-bg)] px-3 py-1.5 text-[13px] font-medium transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
              >
                {s.label}
              </a>
            ))}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <ButtonLink href={path} target="_blank" rel="noreferrer" variant="secondary">
            <Icon name="external" />
            {website ? "View public site URL" : "View Live Page"}
          </ButtonLink>
          <ButtonLink href="/overview">{website ? "Go to admin dashboard" : "Go to Dashboard"}</ButtonLink>
        </div>

        {!website && !websiteLive ? (
          <p className="rounded-xl bg-[var(--color-primary-soft)] p-3 text-xs font-medium text-[var(--color-primary)]">
            This link won&apos;t work for supporters yet — publish your organization website from{" "}
            <a href="/website" className="underline">
              My Website
            </a>{" "}
            to go public.
          </p>
        ) : null}

        <p className="text-xs text-[var(--color-text-muted)]">
          Demo: the link works in this browser. Public hosting isn&apos;t connected yet.
        </p>
      </div>
    </Modal>
  );
}
