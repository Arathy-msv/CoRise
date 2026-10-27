"use client";

import { useEffect, useState } from "react";
import { PasswordField } from "@/components/auth/PasswordField";
import { CopyTextButton } from "@/components/ui/CopyTextButton";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { orgAdminLoginPath, publicOrgPath } from "@/lib/paths";
import type { DirectoryOrganization, OrgLicenseStatus } from "@/lib/deployment";

function absoluteUrl(path: string, origin: string): string {
  return origin ? `${origin}${path}` : path;
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 break-all text-sm font-medium">{value}</p>
    </div>
  );
}

export function OrgAccessDialog({
  org,
  revealedPassword,
  busy,
  error,
  onClose,
  onResetPassword,
  onLicenseStatus,
}: {
  org: DirectoryOrganization;
  revealedPassword: string | null;
  busy: boolean;
  error: string;
  onClose: () => void;
  onResetPassword: () => void;
  onLicenseStatus: (status: OrgLicenseStatus) => void;
}) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const publicUrl = absoluteUrl(publicOrgPath(org.slug), origin);
  const adminUrl = absoluteUrl(orgAdminLoginPath(org.slug), origin);
  const licensed = org.accessMode === "licensed";

  return (
    <Modal wide title="Access details" description={org.name} onClose={onClose}>
      <div className="space-y-4" data-access-dialog={org.slug}>
        {!org.provisioned ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            This is a sample organization already on the list. It does not have a sign-in. Create an organization website to generate
            access for a real admin.
          </p>
        ) : (
          <>
            <Line label="Mode" value={licensed ? "Licensed" : "Demo"} />
            <Line label="Organization status" value="Active" />
            <Line label="Website" value={org.websiteStatus === "live" ? "Live" : "Draft"} />
            {licensed ? (
              <>
                <Line label="License number" value={org.licenseKey || "Not set"} />
                <Line label="License status" value={licenseLabel(org.licenseStatus)} />
              </>
            ) : null}
            <Line label="Admin email" value={org.adminEmail || "Not set"} />
            <Line label="Public website" value={publicUrl} />
            <Line label="Admin sign-in" value={adminUrl} />

            {revealedPassword ? (
              <div className="space-y-2 rounded-xl bg-[var(--color-bg)] p-3">
                <p className="text-sm">New password. Copy it now — it will not be shown again.</p>
                <PasswordField id="reset-password" label="New password" value={revealedPassword} readOnly autoComplete="off" />
                <div className="flex flex-wrap gap-2">
                  <CopyTextButton text={revealedPassword} label="Copy Password" />
                  <CopyTextButton
                    text={`Organization: ${org.name}\nSign-in: ${adminUrl}\nEmail: ${org.adminEmail ?? ""}\nPassword: ${revealedPassword}`}
                    label="Copy Login Details"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                The password cannot be shown again. Reset it when the admin needs a new one. The current password keeps working until you
                reset it.
              </p>
            )}

            {error ? (
              <p role="alert" className="text-sm font-medium text-[var(--color-danger)]">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <CopyTextButton text={org.adminEmail ?? ""} label="Copy Username" disabled={!org.adminEmail} />
              <Button variant="secondary" size="sm" disabled={busy} onClick={onResetPassword}>
                Reset password
              </Button>
            </div>

            {licensed ? (
              <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">License</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" disabled={busy || org.licenseStatus === "active"} onClick={() => onLicenseStatus("active")}>
                    Mark active
                  </Button>
                  <Button variant="secondary" size="sm" disabled={busy || org.licenseStatus === "inactive"} onClick={() => onLicenseStatus("inactive")}>
                    Mark inactive
                  </Button>
                  <Button variant="secondary" size="sm" disabled={busy || org.licenseStatus === "expired"} onClick={() => onLicenseStatus("expired")}>
                    Mark expired
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}

        <div className="flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-3">
          <a className="corise-btn corise-btn-secondary corise-btn-sm" href={publicOrgPath(org.slug)} target="_blank" rel="noreferrer">
            View Public Website
          </a>
          {org.provisioned ? (
            <a className="corise-btn corise-btn-secondary corise-btn-sm" href={orgAdminLoginPath(org.slug)} target="_blank" rel="noreferrer">
              Open Admin Login
            </a>
          ) : null}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function licenseLabel(status: DirectoryOrganization["licenseStatus"]): string {
  if (status === "active") return "Active";
  if (status === "inactive") return "Inactive";
  if (status === "expired") return "Expired";
  return "Not set";
}
