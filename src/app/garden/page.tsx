"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCorise } from "@/context/CoriseContext";
import { SCHOOL_GARDEN_SLUG } from "@/lib/storage";
import { publicCampaignPath } from "@/lib/paths";

/** Opens the published Grow The Tree campaign for this browser's organization. */
export default function GardenPage() {
  const router = useRouter();
  const { hydrated, state } = useCorise();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(publicCampaignPath(SCHOOL_GARDEN_SLUG, state.organization.orgSlug));
  }, [hydrated, router, state.organization.orgSlug]);

  return <p className="py-24 text-center text-sm text-[var(--color-text-muted)]">Opening the garden…</p>;
}
