"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useApp } from "@/context/AppContext";
import { useCorise } from "@/context/CoriseContext";
import { roleLabel } from "@/lib/deployment";

type Tone = "dark" | "light";
type Variant = "compact" | "block";
type Align = "left" | "right";
type MenuSide = "down" | "up";

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0] ? words[0][0] : "";
  const second = words[1] ? words[1][0] : "";
  return (first + second).toUpperCase() || "?";
}

interface ProfileMenuProps {
  tone?: Tone;
  /** "compact": pill for horizontal top bars. "block": full-width row for the sidebar. */
  variant?: Variant;
  align?: Align;
  /** Which way the dropdown opens relative to the trigger. */
  menuSide?: MenuSide;
}

/**
 * Account/role indicator shared by the website chrome (top bar) and the admin portal (sidebar).
 * Always shows the current role, whether or not anyone is signed in yet.
 */
export function ProfileMenu({ tone = "light", variant = "compact", align = "right", menuSide = "down" }: ProfileMenuProps) {
  const router = useRouter();
  const { state, hydrated: coriseHydrated, signOut } = useCorise();
  const { mode, role, hydrated: appHydrated } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dark = tone === "dark";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!coriseHydrated || !appHydrated) {
    return (
      <span
        aria-hidden
        className={`inline-block h-9 w-9 animate-pulse rounded-full ${dark ? "bg-white/10" : "bg-[var(--color-bg)]"}`}
      />
    );
  }

  const signedIn = state.isSignedIn;
  const label = mode === "licensed" && role === "ORG_ADMIN" ? "Org Admin (Owner)" : roleLabel(role);
  const name = signedIn ? state.userName : "Guest";
  const isBlock = variant === "block";
  const openUp = menuSide === "up";

  return (
    <div ref={ref} className={`relative ${isBlock ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu: ${name}, ${label}`}
        className={`group flex items-center gap-2 rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
          isBlock ? "w-full p-2" : "p-1 pr-2.5"
        } ${
          dark
            ? "hover:bg-white/10 focus-visible:outline-white"
            : "hover:bg-[var(--color-bg)] focus-visible:outline-[var(--color-primary)]"
        }`}
      >
        <span
          aria-hidden
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
            dark ? "bg-[var(--color-emerald)] text-[var(--color-navy)]" : "bg-[var(--color-primary)] text-white"
          }`}
        >
          {signedIn ? initialsFor(name) : <Icon name="user" size={15} />}
        </span>
        <span
          className={`flex min-w-0 flex-col items-start leading-tight ${isBlock ? "" : "hidden sm:flex"} ${
            dark ? "text-white" : "text-[var(--color-text)]"
          }`}
        >
          {isBlock ? <span className="truncate text-sm font-semibold">{name}</span> : null}
          <span
            className={`truncate text-xs font-semibold ${
              isBlock ? (dark ? "text-white/60" : "text-[var(--color-text-muted)]") : ""
            }`}
          >
            {label}
          </span>
        </span>
        <Icon
          name="chevronDown"
          size={13}
          className={`${isBlock ? "ml-auto" : "hidden sm:block"} shrink-0 transition ${
            dark ? "text-white/60" : "text-[var(--color-text-muted)]"
          } ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className={`absolute z-50 w-56 rounded-xl border border-[var(--color-border)] bg-white p-2 text-left shadow-[var(--shadow-lg)] ${
            openUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } ${isBlock ? "inset-x-0" : align === "right" ? "right-0" : "left-0"}`}
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{signedIn ? state.userName : "Guest"}</p>
            {signedIn ? <p className="truncate text-xs text-[var(--color-text-muted)]">{state.userEmail}</p> : null}
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary)]">
              <Icon name="user" size={11} />
              {label}
            </p>
          </div>
          <div className="my-1 h-px bg-[var(--color-border)]" />
          {signedIn ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut();
                router.push("/login");
              }}
              className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              <Icon name="logout" size={16} className="text-[var(--color-text-muted)]" />
              Sign out
            </button>
          ) : (
            <Link
              role="menuitem"
              href="/login"
              onClick={() => setOpen(false)}
              className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              <Icon name="arrowRight" size={16} className="text-[var(--color-text-muted)]" />
              Log in
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
