"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { useCorise } from "@/context/CoriseContext";

export function ToastHost() {
  const { state, clearToast } = useCorise();
  const toast = state.toast;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 4200);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  const tone =
    toast.tone === "success"
      ? { box: "border-[var(--color-success)]/25", icon: "check" as const, color: "text-[var(--color-success)]" }
      : toast.tone === "warn"
        ? { box: "border-[var(--color-warning)]/30", icon: "alert" as const, color: "text-[var(--color-warning)]" }
        : { box: "border-[var(--color-border)]", icon: "info" as const, color: "text-[var(--color-info)]" };

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-[70] max-w-sm animate-fade-up rounded-[var(--radius)] border bg-white px-4 py-3 shadow-[var(--shadow-lg)] ${tone.box}`}
    >
      <div className="flex items-start gap-3">
        <Icon name={tone.icon} className={`mt-0.5 ${tone.color}`} />
        <p className="text-sm font-medium text-[var(--color-text)]">{toast.message}</p>
        <button
          type="button"
          onClick={clearToast}
          className="rounded p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          aria-label="Dismiss notification"
        >
          <Icon name="x" size={14} />
        </button>
      </div>
    </div>
  );
}
