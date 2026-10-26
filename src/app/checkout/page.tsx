"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";
import { useCorise } from "@/context/CoriseContext";
import {
  formatPlanPrice,
  getPlan,
  loadSelectedPlan,
  saveSelectedPlan,
  type PlanId,
} from "@/lib/pricing";
import { homePathForRole, OWNER_ROLE } from "@/lib/roles";

function CheckoutInner() {
  const { state, hydrated, signIn, updateOrganization, showToast } = useCorise();
  const router = useRouter();
  const search = useSearchParams();
  const [planId, setPlanId] = useState<PlanId>("pro");
  const [ack, setAck] = useState(false);

  useEffect(() => {
    const q = search.get("plan");
    const fromStore = loadSelectedPlan();
    const chosen =
      q === "free" || q === "pro" || q === "organization" ? q : fromStore || "pro";
    setPlanId(chosen);
    saveSelectedPlan(chosen);
  }, [search]);

  useEffect(() => {
    if (hydrated && state.isSignedIn && state.managerRole) {
      router.replace(homePathForRole(state.managerRole));
    }
  }, [hydrated, state.isSignedIn, state.managerRole, router]);

  const plan = getPlan(planId);

  if (planId === "free") {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center md:px-6">
        <h1 className="font-display text-[28px] font-semibold">No checkout needed</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          The Free plan does not require payment. Create your account to continue.
        </p>
        <Button className="mt-5" onClick={() => router.push("/signup?plan=free")}>
          Continue to signup
        </Button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <p className="text-sm">Choose a plan first.</p>
        <Link href="/pricing" className="mt-3 inline-block font-semibold text-[var(--color-primary)] underline">
          View plans
        </Link>
      </div>
    );
  }

  const enterWorkspace = () => {
    if (!ack) return;
    updateOrganization({ name: state.organization.name });
    signIn();
    showToast(
      "Demo workspace opened. No payment was processed — payment integration is not connected.",
      "info"
    );
    router.push(homePathForRole(OWNER_ROLE));
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10 md:px-6">
      <h1 className="font-display text-[28px] font-semibold">Order summary</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Review your plan before continuing. Card details are never collected in this prototype.
      </p>

      <div className="corise-card mt-5 space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              Plan
            </p>
            <p className="font-display text-lg font-semibold">{plan.name}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{plan.tagline}</p>
          </div>
          <p className="font-display text-xl font-semibold">{formatPlanPrice(plan)}</p>
        </div>
        <ul className="space-y-1.5 border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-text-muted)]">
          {plan.features.slice(0, 4).map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
        <p className="text-xs text-[var(--color-text-muted)]">{plan.notes}</p>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent-soft)] px-3.5 py-3 text-sm">
        <p className="font-semibold text-[var(--color-text)]">Payment integration placeholder</p>
        <p className="mt-1 text-[var(--color-text-muted)]">
          A real payment provider is not connected. Corise will not charge a card or claim that
          payment succeeded. You can continue into the demo workspace for evaluation only.
        </p>
      </div>

      <label className="mt-4 flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4"
          checked={ack}
          onChange={(e) => setAck(e.target.checked)}
        />
        <span>
          I understand no payment is processed in this prototype, and I want to open a demo
          workspace.
        </span>
      </label>

      <div className="mt-5 flex flex-col gap-2">
        <Button className="w-full" size="lg" disabled={!ack} onClick={enterWorkspace}>
          Continue to demo workspace
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => router.push("/pricing")}>
          Back to plans
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <MarketingShell>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--color-text-muted)]">
            Loading…
          </div>
        }
      >
        <CheckoutInner />
      </Suspense>
    </MarketingShell>
  );
}
