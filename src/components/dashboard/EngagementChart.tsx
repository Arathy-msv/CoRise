export function EngagementChart({
  points,
}: {
  points: { label: string; value: number }[];
}) {
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <div className="space-y-3">
      <div className="flex h-40 items-end gap-2">
        {points.map((p) => (
          <div key={p.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-lg bg-[var(--color-primary)]/90 transition hover:bg-[var(--color-primary)]"
              style={{ height: `${Math.max(8, (p.value / max) * 100)}%` }}
              title={`${p.label}: ${p.value}`}
            />
            <span className="text-[11px] font-medium text-[var(--color-text-muted)]">
              {p.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        Illustrative sample interactions.
      </p>
    </div>
  );
}
