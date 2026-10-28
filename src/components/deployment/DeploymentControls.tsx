"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { DEPLOYMENT_MODES, availableRoles, isValidLicenseKey, sampleLicenseKey, type AppRole } from "@/lib/deployment";

type Tone = "dark" | "light";

const DEPLOYMENT_MODE_DISCLAIMER = "Illustrative — not connected to billing or hosting.";

export function ModeSwitcher({ tone = "dark", compact = false }: { tone?: Tone; compact?: boolean }) {
  const { mode, setMode } = useApp();
  const dark = tone === "dark";
  return (
    <div className="inline-flex flex-col gap-1">
      <div
        role="group"
        aria-label="Deployment mode"
        title={DEPLOYMENT_MODE_DISCLAIMER}
        className={`inline-flex rounded-full p-0.5 ${dark ? "bg-white/10 ring-1 ring-white/15" : "bg-[var(--color-bg)] ring-1 ring-[var(--color-border)]"}`}
      >
        {DEPLOYMENT_MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={active}
              onClick={() => setMode(m.id)}
              className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition focus-visible:outline-2 focus-visible:outline-[var(--color-emerald)] ${
                compact ? "h-7 px-2.5 text-[11px]" : "h-8 px-3 text-xs sm:text-[13px]"
              } ${
                active
                  ? dark
                    ? "bg-white text-[var(--color-navy)]"
                    : "bg-white text-[var(--color-text)] shadow-sm"
                  : dark
                    ? "text-white/70 hover:text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <span aria-hidden>{m.icon}</span>
              {compact ? m.label.split(" ")[0] : m.label}
            </button>
          );
        })}
      </div>
      <span className={compact ? "sr-only" : `text-[11px] ${dark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}>
        {DEPLOYMENT_MODE_DISCLAIMER}
      </span>
    </div>
  );
}

export function RoleSwitcher({ tone = "dark", compact = false }: { tone?: Tone; compact?: boolean }) {
  const { mode, role, setRole } = useApp();
  const dark = tone === "dark";
  return (
    <label className={`inline-flex items-center gap-1.5 text-xs font-medium ${dark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}>
      <span className={compact ? "sr-only" : ""}>Viewing as</span>
      <select
        aria-label="Test role"
        value={role}
        onChange={(e) => setRole(e.target.value as AppRole)}
        className={`h-8 rounded-lg px-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-[var(--color-emerald)] ${
          dark ? "border border-white/15 bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] bg-white text-[var(--color-text)]"
        }`}
      >
        {availableRoles(mode).map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LicenseKeyModal({ onClose, onActivate }: { onClose: () => void; onActivate: (key: string) => void }) {
  const [key, setKey] = useState(() => sampleLicenseKey());
  const [error, setError] = useState("");

  return (
    <Modal
      title="Activate your local license"
      description="Paste the license key from your purchase email. A sample key is filled in for this demo."
      onClose={onClose}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!isValidLicenseKey(key)) return setError("That doesn't look like a Corise key. Format: CORISE-LIC-XXXX-XXXX-XXXX");
          onActivate(key);
        }}
        className="space-y-3"
      >
        <div>
          <label htmlFor="license-key" className="mb-1.5 block text-[13px] font-semibold">
            License key
          </label>
          <input
            id="license-key"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              if (error) setError("");
            }}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "license-error" : undefined}
            className="h-11 w-full rounded-lg border border-[var(--color-border-strong)] bg-white px-3 font-mono text-sm tracking-wide focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          {error ? (
            <p id="license-error" role="alert" className="mt-1.5 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setKey(sampleLicenseKey());
              setError("");
            }}
            className="mt-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"
          >
            Generate another sample key
          </button>
        </div>
        <ul className="space-y-1 rounded-lg bg-[var(--color-bg)] p-3 text-xs text-[var(--color-text-muted)]">
          <li>• Single organization, no platform admin tier</li>
          <li>• Data stays in this browser — no cloud telemetry</li>
          <li>• Mock activation: no license server is contacted</li>
        </ul>
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          <Icon name="check" />
          Activate License
        </button>
      </form>
    </Modal>
  );
}
