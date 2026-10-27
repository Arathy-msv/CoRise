"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { ProvisionSuccess } from "@/lib/org-access";
import { publicAsset } from "@/lib/public-asset";

function absoluteUrl(path: string, origin: string): string {
  const prefixed = publicAsset(path);
  return origin ? `${origin}${prefixed}` : prefixed;
}

/** Shows the live website link and the one-time admin password. No page scroll. */
export function OrgReadyDialog({ result, onClose }: { result: ProvisionSuccess; onClose: () => void }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [linkState, setLinkState] = useState<"idle" | "copied" | "failed">("idle");
  const [loginState, setLoginState] = useState<"idle" | "copied" | "failed">("idle");

  const publicUrl = absoluteUrl(result.publicPath, origin);
  const loginDetails = [
    result.licenseKey ? `License: ${result.licenseKey}` : "",
    `Email: ${result.email}`,
    `Password: ${result.password}`,
  ]
    .filter(Boolean)
    .join("\n");

  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    const node = dialogRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node?.querySelector<HTMLElement>("button, a[href]")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const copy = async (text: string, setState: (next: "idle" | "copied" | "failed") => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 backdrop-blur-xs sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-org-ready={result.mode}
        className="relative max-h-[100dvh] w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-[#183B2E]"
        >
          <Icon name="x" size={16} />
        </button>

        <h2 id={titleId} className="mb-1 pr-8 text-2xl font-bold text-gray-900">
          Your Website is Ready! 🎉
        </h2>
        <p id={descriptionId} className="mb-5 text-xs text-gray-500">
          Here is your live site and admin dashboard. Copy or keep your credentials safe!
        </p>

        <section>
          <h3 className="mb-2 text-[10px] font-bold tracking-wider text-gray-400">PUBLIC WEBSITE</h3>
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E9DFD3] bg-[#FAF4EB] py-1.5 pr-2 pl-3.5">
            <p id="org-public-url" className="min-w-0 truncate font-mono text-xs text-gray-800" title={publicUrl}>
              {publicUrl || result.publicPath}
            </p>
            <button
              type="button"
              onClick={() => void copy(publicUrl, setLinkState)}
              disabled={!publicUrl}
              aria-live="polite"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#22A45A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1B8A4A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B2E] disabled:opacity-60"
            >
              {linkState === "copied" ? (
                "✓ Copied"
              ) : linkState === "failed" ? (
                "Copy failed"
              ) : (
                <>
                  <Icon name="copy" size={14} />
                  Copy Link
                </>
              )}
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <Link
              href={result.publicPath}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white py-2.5 text-center text-xs font-semibold text-gray-800 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[#183B2E]"
            >
              Open Live Website ↗
            </Link>
            <Link
              href={result.adminPath}
              className="flex flex-1 items-center justify-center rounded-xl bg-[#183B2E] py-2.5 text-center text-xs font-semibold text-white hover:bg-[#122D23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B2E]"
            >
              Go to My Dashboard
            </Link>
          </div>
        </section>

        <section>
          <h3 className="mt-5 mb-2 text-[10px] font-bold tracking-wider text-gray-400">ADMIN LOGIN CREDENTIALS</h3>
          <div className="flex flex-col gap-2.5 rounded-xl border border-gray-100 bg-[#FAF6F0] p-4 text-xs text-gray-800">
            {result.licenseKey ? (
              <p className="flex items-baseline gap-2">
                <span className="shrink-0">License:</span>
                <span id="org-license-key" className="min-w-0 font-mono break-all">
                  {result.licenseKey}
                </span>
              </p>
            ) : null}
            <p className="flex items-baseline gap-2">
              <span className="shrink-0">Email:</span>
              <span id="org-admin-email" className="min-w-0 font-mono break-all">
                {result.email}
              </span>
            </p>
            <p className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span>Password: </span>
                <span id="org-admin-password" className="font-mono tracking-wide">
                  {showPassword ? result.password : "•••••••••••"}
                </span>
              </span>
              <button
                type="button"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((open) => !open)}
                className="shrink-0 font-semibold text-[#183B2E] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-[#183B2E]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </p>
          </div>
          <button
            type="button"
            onClick={() => void copy(loginDetails, setLoginState)}
            aria-live="polite"
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[#183B2E]"
          >
            {loginState === "copied" ? (
              "✓ Copied"
            ) : loginState === "failed" ? (
              "Copy failed"
            ) : (
              <>
                <Icon name="copy" size={14} />
                Copy Login Credentials
              </>
            )}
          </button>
        </section>

        <section>
          <h3 className="mt-5 mb-1.5 text-[10px] font-bold tracking-wider text-gray-400">NEXT STEPS / IMPORTANT INFO</h3>
          <p className="inline-flex w-full items-start gap-2 rounded-lg bg-[#EDEFF2] px-3 py-2 text-[11px] text-gray-600">
            <Icon name="info" size={14} />
            This password won&apos;t be shown again. Sign-in only works in this browser for now.
          </p>
        </section>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#183B2E] py-3 text-xs font-semibold text-white shadow-xs hover:bg-[#122D23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B2E]"
        >
          Back to Organizations
        </button>
      </div>
    </div>
  );
}
