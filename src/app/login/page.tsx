"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { activateOrgAdminRole, authenticateOrgAdmin } from "@/lib/org-access";
import { orgDashboardPath } from "@/lib/paths";

function noticeMessage(notice: string | null): string {
  if (notice === "expired") return "This organization's license has expired. Ask your Corise administrator to renew it.";
  if (notice === "inactive") return "This organization's license is not active. Ask your Corise administrator for help.";
  return "";
}

function LoginInner() {
  const { state, hydrated, signIn, enterOrganizationSession } = useCorise();
  const { organizations, setRole } = useApp();
  const router = useRouter();
  const search = useSearchParams();
  const orgSlug = search.get("org");
  const listed = orgSlug ? organizations.find((org) => org.slug === orgSlug) : undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const notice = noticeMessage(search.get("notice"));

  useEffect(() => {
    if (!hydrated || !state.isSignedIn || !state.sessionOrgId) return;
    if (!orgSlug || state.organization.orgSlug === orgSlug) router.replace(orgDashboardPath(state.organization.orgSlug));
  }, [hydrated, state.isSignedIn, state.sessionOrgId, state.organization.orgSlug, orgSlug, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await authenticateOrgAdmin(email, password, orgSlug);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    enterOrganizationSession({
      organizationId: result.org.id,
      email: result.org.adminEmail || email.trim().toLowerCase(),
      name: result.org.adminName || result.org.name,
      workspace: result.workspace,
    });
    setRole("ORG_ADMIN");
    activateOrgAdminRole();
    router.push(orgDashboardPath(result.workspace.organization.orgSlug));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight">Organization sign in</h1>
        <p className="mt-1.5 text-[15px] text-[var(--color-text-muted)]">
          {listed ? (
            <>
              Sign in to manage <strong className="text-[var(--color-text)]">{listed.name}</strong>.
            </>
          ) : orgSlug ? (
            "We couldn't find that organization. Check the link you were given."
          ) : (
            "Use the email and password from your organization setup."
          )}
        </p>
      </div>

      {notice ? (
        <p role="status" className="rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]">
          {notice}
        </p>
      ) : null}

      <form id="login-form" onSubmit={(e) => void submit(e)} noValidate className="space-y-4">
        <Field label="Email" error={undefined}>
          <TextInput
            id="login-email"
            type="email"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <PasswordField id="login-password" value={password} onChange={setPassword} />
        {error ? (
          <p id="login-error" role="alert" className="text-sm font-medium text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}
        <Button className="w-full" size="lg" type="submit" loading={busy}>
          {busy ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="text-xs text-[var(--color-text-muted)]">
        Forgot your password? Ask your Corise administrator to reset it. Passwords are not stored in plain text here. This sign-in works
        in this browser only and is not a production login system.
      </p>

      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="text-xs text-[var(--color-text-muted)]">
          The sample workspace is separate. It does not use an organization password.
        </p>
        <button
          type="button"
          className="mt-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
          onClick={() => {
            signIn();
            router.push("/overview");
          }}
        >
          Open the sample workspace
        </button>
        <p className="mt-3 text-center text-sm text-[var(--color-text-muted)]">
          <Link href="/" className="font-semibold text-[var(--color-primary)] hover:underline">
            Back to Corise
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<p className="text-center text-sm text-[var(--color-text-muted)]">Loading…</p>}>
        <LoginInner />
      </Suspense>
    </AuthLayout>
  );
}
