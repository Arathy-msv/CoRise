"use client";

import { useEffect, useId, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

export function Modal({
  title,
  description,
  onClose,
  children,
  icon,
  wide = false,
}: {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  icon?: ReactNode;
  wide?: boolean;
}) {
  const titleId = useId();

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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative max-h-[min(92vh,900px)] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-[var(--shadow-lg)] sm:rounded-2xl ${wide ? "max-w-xl" : "max-w-md"}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
        >
          <Icon name="x" />
        </button>
        {icon}
        <h2 id={titleId} className="pr-8 text-[22px] font-semibold leading-tight">
          {title}
        </h2>
        {description ? <p className="mt-1.5 text-[15px] text-[var(--color-text-muted)]">{description}</p> : null}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
