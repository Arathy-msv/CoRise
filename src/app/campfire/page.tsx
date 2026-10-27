"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCorise } from "@/context/CoriseContext";
import { publicCampaignPath } from "@/lib/paths";
import { openAppPath } from "@/lib/static-nav";
import { CAMPFIRE_SLUG } from "@/lib/storage";

export default function CampfirePage() {
  const router = useRouter();
  const { hydrated, state } = useCorise();

  useEffect(() => {
    if (!hydrated) return;
    openAppPath(publicCampaignPath(CAMPFIRE_SLUG, state.organization.orgSlug), router, "replace");
  }, [hydrated, router, state.organization.orgSlug]);

  return <p className="py-20 text-center text-sm text-[var(--color-text-muted)]">Lighting the campfire…</p>;
}
