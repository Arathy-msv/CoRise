"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OwnerSignupForm } from "@/components/auth/OwnerSignupForm";
import { useCorise } from "@/context/CoriseContext";
import { safeNextPath } from "@/lib/paths";
import { openAppPath } from "@/lib/static-nav";

function SignupInner() {
  const { state, hydrated, signIn } = useCorise();
  const router = useRouter();
  const search = useSearchParams();
  const next = safeNextPath(search.get("next")) ?? (state.pendingSpace ? "/preview" : "/overview");
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    if (hydrated && state.isSignedIn) openAppPath(next, router, "replace");
  }, [hydrated, state.isSignedIn, router, next]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight">Create your free account</h1>
        <p className="mt-1.5 text-[15px] text-[var(--color-text-muted)]">Just your name and email. No card needed.</p>
      </div>

      <OwnerSignupForm
        submitLabel="Create account"
        onSubmit={({ name, email }) => {
          submitted.current = true;
          signIn({ userName: name, email });
          openAppPath(next, router);
        }}
        footer={
          <p className="text-xs text-[var(--color-text-muted)]">
            Demo sign-in: no password is needed and your work is saved in this browser only. This is not secure authentication.
          </p>
        }
      />

      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Already have an account?{" "}
        <Link href={`/login${search.toString() ? `?${search.toString()}` : ""}`} className="font-semibold text-[var(--color-primary)] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<p className="text-center text-sm text-[var(--color-text-muted)]">Loading…</p>}>
        <SignupInner />
      </Suspense>
    </AuthLayout>
  );
}
