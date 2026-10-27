"use client";

import { useEffect, useState } from "react";
import { CopyTextButton } from "@/components/ui/CopyTextButton";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PasswordField } from "@/components/auth/PasswordField";
import type { ProvisionSuccess } from "@/lib/org-access";

function absoluteUrl(path: string, origin: string): string {
  return origin ? `${origin}${path}` : path;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 break-all text-sm font-medium">{value}</p>
    </div>
  );
}

/** Shows the real URLs and the one-time password from organization creation. */
export function OrgReadyDialog({ result, onClose }: { result: ProvisionSuccess; onClose: () => void }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const licensed = result.mode === "licensed";
  const publicUrl = absoluteUrl(result.publicPath, origin);
  const adminUrl = absoluteUrl(result.adminPath, origin);
  const loginDetails = [
    `Organization: ${result.name}`,
    licensed && result.licenseKey ? `License: ${result.licenseKey}` : "",
    `Public website: ${publicUrl}`,
    `Admin sign-in: ${adminUrl}`,
    `Email: ${result.email}`,
    `Password: ${result.password}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Modal
      wide
      title={licensed ? "Your Licensed Organization Is Ready!" : "Your Organization Website Is Ready!"}
      description="Copy what you need now. The password is shown only this once."
      onClose={onClose}
    >
      <div className="space-y-5" data-org-ready={result.mode}>
        <section className="space-y-3 rounded-xl bg-[var(--color-bg)] p-4">
          <h3 className="text-sm font-semibold">Organization details</h3>
          <Detail label="Organization" value={result.name} />
          {licensed ? (
            <>
              <Detail label="License number" value={result.licenseKey ?? "—"} />
              <p id="org-license-key" className="sr-only">
                {result.licenseKey}
              </p>
              <Detail label="License status" value="Active" />
            </>
          ) : (
            <Detail label="Access" value="Demo" />
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Public website</h3>
          <p id="org-public-url" className="break-all text-sm">
            {publicUrl}
          </p>
          <div className="flex flex-wrap gap-2">
            <a className="corise-btn corise-btn-secondary corise-btn-sm" href={result.publicPath} target="_blank" rel="noreferrer">
              Open Public Website
            </a>
            <CopyTextButton text={publicUrl} label="Copy Website URL" />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Organization admin dashboard</h3>
          <p id="org-admin-url" className="break-all text-sm">
            {adminUrl}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">After sign-in, this opens that organization's admin dashboard.</p>
          <div className="flex flex-wrap gap-2">
            <a className="corise-btn corise-btn-secondary corise-btn-sm" href={result.adminPath} target="_blank" rel="noreferrer">
              Open Admin Login
            </a>
            <CopyTextButton text={adminUrl} label="Copy Dashboard URL" />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">{licensed ? "Admin access" : "Demo login credentials"}</h3>
          <Detail label="Email" value={result.email} />
          <p id="org-admin-email" className="sr-only">
            {result.email}
          </p>
          <PasswordField id="org-admin-password" label="Password" value={result.password} readOnly autoComplete="off" />
          <div className="flex flex-wrap gap-2">
            <CopyTextButton text={result.email} label="Copy Username" />
            <CopyTextButton text={result.password} label="Copy Password" />
            <CopyTextButton text={loginDetails} label="Copy Login Details" />
          </div>
        </section>

        <section className="space-y-2 rounded-xl border border-[var(--color-border)] p-4">
          <h3 className="text-sm font-semibold">Next steps</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            The organization admin can sign in to manage the website and create campaigns. No campaign has been created yet.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            This password is not stored in a way that can be shown again. You can reset it later from the organization list. Sign-in
            works in this browser only — it is not a production login system.
          </p>
        </section>

        <Button className="w-full" onClick={onClose}>
          Back to organizations
        </Button>
      </div>
    </Modal>
  );
}
