"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const KEY = "corise-waitlist-interest";

/** Notes interest in this browser only — no waitlist service or email capture is connected. */
export function WaitlistButton({ planId, planName }: { planId: string; planName: string }) {
  const [joined, setJoined] = useState(false);

  if (joined) {
    return (
      <p role="status" className="flex gap-2 rounded-lg border border-[var(--color-navy-border)] px-3 py-2.5 text-xs text-[var(--color-navy-muted)]">
        <Icon name="check" size={14} className="mt-px shrink-0 text-[var(--color-emerald)]" />
        Interest in {planName} noted in this browser. A waitlist service isn&apos;t connected yet, so no one will contact you.
      </p>
    );
  }

  return (
    <Button
      variant="dark"
      className="w-full"
      onClick={() => {
        try {
          const list = new Set<string>(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
          list.add(planId);
          localStorage.setItem(KEY, JSON.stringify([...list]));
        } catch {
          // Storage unavailable — interest simply isn't remembered
        }
        setJoined(true);
      }}
    >
      Join waitlist
    </Button>
  );
}
