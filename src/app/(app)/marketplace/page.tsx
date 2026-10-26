"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCorise } from "@/context/CoriseContext";

export default function MarketplacePage() {
  const { state, showToast } = useCorise();

  return (
    <div className="animate-fade-up corise-page">
      <div>
        <p className="text-xs font-semibold text-[var(--color-primary)]">Cause Marketplace</p>
        <h1 className="corise-page-title font-display text-[28px] font-semibold">
          Products that support the cause
        </h1>
        <p className="-mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
          Explore how organizations can sell products where proceeds support campaigns.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {state.marketplace.map((item) => (
          <article key={item.id} className="corise-card flex flex-col p-4">
            <div className="mb-2.5 flex h-28 items-end rounded-xl bg-[var(--color-primary-soft)] p-3">
              <span className="font-display text-base font-semibold text-[var(--color-primary)]">
                {item.name}
              </span>
            </div>
            <div className="mb-2">
              <Badge>{item.causeTag}</Badge>
            </div>
            <p className="flex-1 text-sm text-[var(--color-text-muted)]">{item.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="font-display text-lg font-semibold">{item.priceLabel}</p>
              <Button
                variant="secondary"
                onClick={() =>
                  showToast(
                    "Checkout is not connected. This shows the product concept only.",
                    "info"
                  )
                }
              >
                View concept
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
