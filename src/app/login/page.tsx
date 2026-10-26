"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { canAccessPlatformAdmin, canCreateWebsite } from "@/lib/deployment";
import { safeNextPath } from "@/lib/paths";

function LoginInner() {
  const { state, hydrated, signIn } = useCorise();
  const { mode, role } = useApp();
  const router = useRouter();
  const search = useSearchParams();
  const pending = state.pendingSpace;
  const next = safeNextPath(search.get("next")) ?? (pending ? "/preview" : canAccessPlatformAdmin(mode, role) ? "/admin/platform" : "/overview");
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    if (hydrated && state.isSignedIn) router.replace(next);
  }, [hydrated, state.isSignedIn, router, next]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight">Welcome back</h1>
        <p className="mt-1.5 text-[15px] text-[var(--color-text-muted)]">
          Continue as <strong className="text-[var(--color-text)]">{state.userName}</strong>.
        </p>
      </div>

      <div className="space-y-4">
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            submitted.current = true;
            signIn();
            router.push(next);
          }}
        >
          Continue
        </Button>
        <p className="text-xs text-[var(--color-text-muted)]">
          Demo sign-in: no password is needed and your work is saved in this browser only. This is not secure authentication.
        </p>
      </div>

      {canCreateWebsite(mode, role) ? (
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          New to Corise?{" "}
          <Link href="/create" className="font-semibold text-[var(--color-primary)] hover:underline">
            Create your first page
          </Link>
        </p>
      ) : null}
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
