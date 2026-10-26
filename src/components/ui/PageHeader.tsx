import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  meta,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[13px] font-semibold text-[var(--color-primary)]">{eyebrow}</p>
        ) : null}
        <h1 className="text-[26px] font-semibold leading-tight text-[var(--color-text)] md:text-[28px]">
          {title}
        </h1>
        {meta ? <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div> : null}
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[15px] text-[var(--color-text-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[19px] font-semibold text-[var(--color-text)]">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
