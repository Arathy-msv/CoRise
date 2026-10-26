const STEPS = [
  "Type",
  "Idea",
  "AI help",
  "Design",
  "Engagement",
  "Sponsors",
  "Publish",
];

export function WizardStepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Campaign creation progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li
            key={label}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              active
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : done
                  ? "border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-text-muted)]"
            }`}
          >
            <span aria-hidden>{n}</span>
            <span className="hidden sm:inline">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
