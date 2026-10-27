"use client";

import { useSearchParams } from "next/navigation";
import { parseEndorsement } from "@/lib/endorsement";

/** Shown above the hero when a supporter arrived via a personalized share link (?endorsedBy=&note=). */
export function EndorsementBanner() {
  const params = useSearchParams();
  const endorsement = parseEndorsement(params.get("endorsedBy"), params.get("note"));
  if (!endorsement) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] p-4">
      <span className="text-xl" aria-hidden>
        💬
      </span>
      <div>
        <p className="font-semibold text-[var(--color-success)]">
          {endorsement.endorsedBy ? `${endorsement.endorsedBy} shared this cause with you:` : "Shared with you:"}
        </p>
        {endorsement.note ? (
          <p className="mt-0.5 text-sm italic text-[var(--color-text-muted)]">&ldquo;{endorsement.note}&rdquo;</p>
        ) : null}
      </div>
    </div>
  );
}
