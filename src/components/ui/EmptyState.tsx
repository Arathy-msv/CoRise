import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

export function EmptyState({
  icon = "sparkles",
  title,
  body,
  action,
}: {
  icon?: IconName;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
        <Icon name={icon} size={20} />
      </span>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
