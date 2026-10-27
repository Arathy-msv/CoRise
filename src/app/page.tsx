"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useApp } from "@/context/AppContext";

const OFFERINGS = [
  {
    id: "saas" as const,
    icon: "☁️",
    name: "SaaS Edition",
    tag: "Cloud",
    target: "Multi-tenant cloud workspace, live in minutes.",
    features: ["Instant deployment, zero setup", "Automatic cloud backups", "Global platform oversight & admin tier"],
    cta: "Start Cloud Workspace",
  },
  {
    id: "licensed" as const,
    icon: "🏢",
    name: "Licensed Edition",
    tag: "Self-Hosted",
    target: "Private deployment with complete local ownership.",
    features: ["Single-tenant only", "No cloud telemetry", "No platform admin tier — you own it all"],
    cta: "Deploy Local License",
  },
];

export default function MasterLandingPage() {
  const router = useRouter();
  const { mode } = useApp();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-navy)] px-4 py-16">
      <div className="grid w-full max-w-4xl gap-5 md:grid-cols-2">
        {OFFERINGS.map((o) => {
          const current = mode === o.id;
          return (
            <div
              key={o.id}
              data-offering={o.id}
              className={`relative flex flex-col rounded-2xl border bg-[var(--color-navy)]/80 p-6 backdrop-blur transition ${
                current ? "border-[var(--color-emerald)] shadow-[0_0_0_1px_var(--color-emerald)]" : "border-[var(--color-navy-border)]"
              }`}
            >
              {current ? (
                <span className="absolute right-4 top-4 rounded-full bg-[var(--color-emerald)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-emerald)]">
                  Current mode
                </span>
              ) : null}
              <span className="text-3xl" aria-hidden>
                {o.icon}
              </span>
              <h2 className="mt-3 text-xl font-semibold text-white">
                {o.name} <span className="text-sm font-medium text-[var(--color-navy-muted)]">({o.tag})</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--color-navy-muted)]">{o.target}</p>
              <ul className="mt-5 flex-1 space-y-2">
                {o.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/85">
                    <Icon name="check" size={16} className="mt-0.5 text-[var(--color-emerald)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => router.push(o.id === "saas" ? "/enter/saas" : "/enter/licensed")}
                className={`mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  o.id === "saas"
                    ? "bg-[var(--color-emerald)] text-[var(--color-navy)] hover:brightness-110"
                    : "border border-white/25 text-white hover:bg-white/10"
                }`}
              >
                {o.cta}
                <Icon name="arrowRight" size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
