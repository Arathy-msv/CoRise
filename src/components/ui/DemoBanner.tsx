/** Optional quiet notice — no Demo pill. Prefer action-time explanations over persistent banners. */
export function DemoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3.5 py-2.5 text-sm text-[var(--color-text-muted)]">
      {children}
    </div>
  );
}
