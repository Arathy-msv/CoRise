import type { ReactNode } from "react";

const tones = {
  neutral: "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)] border-transparent",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-transparent",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-transparent",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)] border-transparent",
  primary: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-transparent",
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-primary)] border-transparent",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export type PublishState = "draft" | "published" | "changes" | "not_created" | "archived";

const STATE_META: Record<PublishState, { label: string; tone: BadgeTone; dot: string }> = {
  draft: { label: "Draft", tone: "warning", dot: "bg-[var(--color-warning)]" },
  published: { label: "Published", tone: "success", dot: "bg-[var(--color-success)]" },
  changes: { label: "Unpublished changes", tone: "info", dot: "bg-[var(--color-info)]" },
  not_created: { label: "Not created", tone: "neutral", dot: "bg-[var(--color-border-strong)]" },
  archived: { label: "Archived", tone: "neutral", dot: "bg-[var(--color-text-muted)]" },
};

/** One status vocabulary for websites and campaigns everywhere in the product. */
export function StatusBadge({ state }: { state: PublishState }) {
  const meta = STATE_META[state];
  return (
    <Badge tone={meta.tone}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </Badge>
  );
}
