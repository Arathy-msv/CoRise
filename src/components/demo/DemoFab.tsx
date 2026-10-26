"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useCorise } from "@/context/CoriseContext";
import { dispatchDemoFill } from "@/lib/demo-data";

/**
 * Floating button present on every page. Fills whatever demo-aware form is open
 * (idea box, name/email, page editor) with a fresh, randomized set of sample values.
 */
export function DemoFab() {
  const { showToast } = useCorise();
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <button
      type="button"
      onClick={() => {
        dispatchDemoFill();
        showToast("Demo values filled in — different every time you click.", "info");
      }}
      data-demo-fab
      aria-label="Fill with demo data"
      title="Fill with demo data"
      className="fixed bottom-24 right-5 z-[65] flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[var(--shadow-lg)] transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
    >
      <Icon name="sparkles" size={20} />
    </button>
  );
}
