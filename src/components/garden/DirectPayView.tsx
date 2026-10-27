"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { formatUsd, parsePledge, progressPercent, takePledge } from "@/lib/progress";

const QUICK_AMOUNTS = [25, 50, 100, 250];

/** The "Direct Pay" screen: a plain payment form with no game, for campaigns that offer both views. */
export function DirectPayView({
  title,
  organizationName,
  description,
  current,
  target,
  onPledge,
  onBack,
  playToggle,
}: {
  title: string;
  organizationName: string;
  description: string;
  current: number;
  target: number;
  onPledge: (amount: number) => number | false;
  /** Present when launched from the campaign details page — returns there. */
  onBack?: () => void;
  playToggle?: { onSwitch: () => void; label?: string };
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState<number | null>(null);
  const percent = progressPercent(current, target);
  const rounded = Math.floor(percent);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parsePledge(amount);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    const taken = takePledge(parsed.amount, onPledge);
    if (!taken.ok) {
      setError(taken.error);
      return;
    }
    setThanks(taken.accepted);
    setAmount("");
    setError("");
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#f3f0e6] px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to campaign"
                className="shrink-0 text-[#2f5a3f] hover:text-[#1f3d2b]"
              >
                ←
              </button>
            ) : null}
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{organizationName}</p>
          </div>
          {playToggle ? (
            <button
              type="button"
              onClick={playToggle.onSwitch}
              className="shrink-0 rounded-full bg-[#eef3e8] px-3 py-1.5 text-xs font-semibold text-[#2f5a3f] transition hover:bg-[#e3ecd9]"
            >
              🎮 {playToggle.label ?? "Play the garden game"}
            </button>
          ) : null}
        </div>

        <div>
          <h1 className="text-2xl font-bold leading-tight text-[#1f3d2b]">{title}</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[#1f3d2b]">{formatUsd(current)}</span>
            <span className="text-[var(--color-text-muted)]">
              of {formatUsd(target)} · {rounded}%
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/5">
            <div className="h-full rounded-full bg-[#1f4d34]" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <form onSubmit={submit} noValidate className="space-y-3">
          <p className="text-sm font-semibold">Choose an amount</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setAmount(String(a));
                  setError("");
                }}
                className={`rounded-xl border px-2 py-2 text-sm font-semibold transition ${
                  amount === String(a) ? "border-[#1f4d34] bg-[#eef3e8] text-[#1f4d34]" : "border-black/10 hover:border-[#1f4d34]/40"
                }`}
              >
                {formatUsd(a)}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder="Other amount"
              aria-label="Payment amount"
              aria-invalid={Boolean(error)}
              className="corise-input"
              style={{ paddingLeft: 26 }}
            />
          </div>
          {error ? <p className="text-xs font-medium text-[var(--color-danger)]">{error}</p> : null}
          <Button type="submit" size="lg" className="w-full">
            Pay now
          </Button>
          <p className="text-xs text-[var(--color-text-muted)]">Demo checkout — no real payment is taken. Recorded in this browser.</p>
        </form>

        {thanks !== null ? (
          <p role="status" className="rounded-xl bg-[#e7f1e2] px-3 py-2 text-sm font-medium text-[#2f5a3f]">
            Thank you! Your {formatUsd(thanks)} payment was recorded.
          </p>
        ) : null}
      </div>
    </div>
  );
}
