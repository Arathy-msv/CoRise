export function Logo({
  size = "md",
  tone = "light",
}: {
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
}) {
  const word = size === "lg" ? "text-2xl" : size === "sm" ? "text-[17px]" : "text-xl";
  const mark = size === "lg" ? "h-10 w-10 text-base" : size === "sm" ? "h-7 w-7 text-[13px]" : "h-8 w-8 text-sm";
  const dark = tone === "dark";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${mark} flex items-center justify-center rounded-lg font-bold ${
          dark ? "bg-[var(--color-emerald)] text-[var(--color-navy)]" : "bg-[var(--color-primary)] text-white"
        }`}
        aria-hidden
      >
        C
      </div>
      <div>
        <div className={`font-semibold tracking-tight ${word} ${dark ? "text-white" : "text-[var(--color-text)]"}`}>
          Corise
        </div>
        {size === "lg" ? (
          <div className={`text-[11px] font-medium ${dark ? "text-[var(--color-navy-muted)]" : "text-[var(--color-text-muted)]"}`}>
            Your idea. Your campaign. Your impact.
          </div>
        ) : null}
      </div>
    </div>
  );
}
