"use client";

import { useSyncExternalStore } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { CopyLinkButton } from "@/components/ui/CopyLinkButton";
import { Icon } from "@/components/ui/Icon";

const noop = () => () => undefined;

/** Shows the real public URL of a published page with Copy and View live actions. */
export function PublicLink({ path, label = "Public link" }: { path: string; label?: string }) {
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  const url = `${origin}${path}`;
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
        <a
          href={path}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          {url}
        </a>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <CopyLinkButton path={path} />
        <ButtonLink href={path} target="_blank" rel="noreferrer" variant="outline" size="sm">
          <Icon name="external" />
          View live
        </ButtonLink>
      </div>
    </div>
  );
}
