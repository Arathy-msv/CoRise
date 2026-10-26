"use client";

import { useState } from "react";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Copies an absolute URL for a same-origin path. Reports failure instead of pretending. */
export function CopyLinkButton({
  path,
  label = "Copy link",
  variant = "secondary",
  size = "sm",
}: {
  path: string;
  label?: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2200);
  };

  return (
    <Button variant={variant} size={size} onClick={copy} aria-live="polite">
      <Icon name={state === "copied" ? "check" : "copy"} />
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed — select the link" : label}
    </Button>
  );
}

export function absoluteUrl(path: string): string {
  return typeof window === "undefined" ? path : `${window.location.origin}${path}`;
}
