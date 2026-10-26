"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCorise } from "@/context/CoriseContext";
import { publicCampaignPath } from "@/lib/paths";
import { COZY_PAWS_SLUG } from "@/lib/storage";

export default function ShelterPage() {
  const router = useRouter();
  const { hydrated, state } = useCorise();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(publicCampaignPath(COZY_PAWS_SLUG, state.organization.orgSlug));
  }, [hydrated, router, state.organization.orgSlug]);

  return <p className="py-20 text-center text-sm text-[var(--color-text-muted)]">Opening the sanctuary…</p>;
}
