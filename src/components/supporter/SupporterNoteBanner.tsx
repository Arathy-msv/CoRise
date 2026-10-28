import { supporterInitials } from "@/lib/supporters";

/** A supporter's personal note, shown above the campaign when someone opens their link. */
export function SupporterNoteBanner({ name, note }: { name: string; note: string }) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] p-4">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-xs font-bold text-white"
      >
        {supporterInitials(name)}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-[var(--color-success)]">{name} invited you to support this campaign</p>
        <p className="mt-0.5 whitespace-pre-line break-words text-sm italic text-[var(--color-text-muted)]">&ldquo;{note}&rdquo;</p>
      </div>
    </div>
  );
}
