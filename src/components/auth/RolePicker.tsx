"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { openAppPath } from "@/lib/static-nav";
import { Logo } from "@/components/brand/Logo";
import { LicenseKeyModal } from "@/components/deployment/DeploymentControls";
import { Icon } from "@/components/ui/Icon";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { appHomePath, type AppRole, type DeploymentMode } from "@/lib/deployment";

const ROLES: Record<
  AppRole,
  { icon: string; name: string; person: string; email: string; summary: string }
> = {
  PLATFORM_ADMIN: {
    icon: "☁️",
    name: "Platform Admin",
    person: "Mina Shah",
    email: "mina@corise.demo",
    summary: "See every organization, create websites, and share sign-in details.",
  },
  ORG_ADMIN: {
    icon: "🏛️",
    name: "Organization Admin",
    person: "Asha Menon",
    email: "asha@corise.demo",
    summary: "Manage your organization's website and create campaigns.",
  },
  SUPPORTER: {
    icon: "🤝",
    name: "Supporter",
    person: "Ravi Iyer",
    email: "ravi@corise.demo",
    summary: "Open public websites and join a campaign.",
  },
  VISITOR: {
    icon: "👀",
    name: "Visitor",
    person: "Leela Nair",
    email: "leela@corise.demo",
    summary: "Look around public websites. You don't manage an organization.",
  },
};

const SAAS_ROLES: AppRole[] = ["PLATFORM_ADMIN", "ORG_ADMIN", "SUPPORTER", "VISITOR"];
const LICENSED_ROLES: AppRole[] = ["ORG_ADMIN", "SUPPORTER", "VISITOR"];

export function RolePicker({ edition }: { edition: DeploymentMode }) {
  const router = useRouter();
  const { mode, licenseKey, setMode, setRole, activateLicense } = useApp();
  const { state, signIn, startLicensedWorkspace } = useCorise();
  const [licenseOpen, setLicenseOpen] = useState(false);
  const roles = edition === "licensed" ? LICENSED_ROLES : SAAS_ROLES;
  const title = edition === "licensed" ? "Licensed Edition" : "Corise Cloud";
  const intro =
    edition === "licensed"
      ? "Choose who you are for this demo. Licensed Edition has no platform admin."
      : "Choose who you are for this demo. Each choice opens that person's view.";

  const enter = (role: AppRole) => {
    const person = ROLES[role];
    setMode(edition);
    setRole(role);
    signIn({ userName: person.person, email: person.email });
    openAppPath(appHomePath(edition, role, state.organization.orgSlug), router);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-navy)] px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
        <Link href="/" aria-label="Corise home">
          <Logo size="sm" tone="dark" />
        </Link>
        <Link href="/" className="text-sm font-semibold text-[var(--color-navy-muted)] hover:text-white">
          Back
        </Link>
      </div>

      <div className="mx-auto mt-10 w-full max-w-5xl">
        <p className="text-sm font-semibold text-[var(--color-emerald)]">{title}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Who are you signing in as?</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-navy-muted)]">{intro}</p>

        <div className={`mt-8 grid gap-5 ${roles.length === 4 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {roles.map((id) => {
            const role = ROLES[id];
            return (
              <button
                key={id}
                type="button"
                data-role={id}
                onClick={() => {
                  if (edition === "licensed" && id === "ORG_ADMIN" && !licenseKey) {
                    setLicenseOpen(true);
                    return;
                  }
                  enter(id);
                }}
                className="flex flex-col rounded-2xl border border-[var(--color-navy-border)] bg-[var(--color-navy)]/80 p-6 text-left transition hover:border-[var(--color-emerald)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span className="text-3xl" aria-hidden>
                  {role.icon}
                </span>
                <h2 className="mt-3 text-xl font-semibold text-white">{role.name}</h2>
                <p className="mt-1 text-sm text-white/80">{role.person}</p>
                <p className="mt-3 flex-1 text-sm text-[var(--color-navy-muted)]">{role.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-emerald)]">
                  Continue as {role.name}
                  <Icon name="arrowRight" size={15} />
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-[var(--color-navy-muted)]">
          This opens a demo view in this browser. Organization password sign-in is still used when an admin was given a password.
        </p>
      </div>

      {licenseOpen ? (
        <LicenseKeyModal
          onClose={() => setLicenseOpen(false)}
          onActivate={(key) => {
            if (mode !== "licensed") startLicensedWorkspace();
            activateLicense(key);
            setLicenseOpen(false);
            enter("ORG_ADMIN");
          }}
        />
      ) : null}
    </div>
  );
}
