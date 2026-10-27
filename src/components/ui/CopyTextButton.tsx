"use client";

import { useState } from "react";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Copies plain text and shows a short confirmation. Nothing is written to the page URL. */
export function CopyTextButton({
  text,
  label,
  variant = "secondary",
  size = "sm",
  disabled = false,
}: {
  text: string;
  label: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    if (!text || disabled) return;
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2200);
  };

  return (
    <Button variant={variant} size={size} onClick={() => void copy()} disabled={disabled || !text} aria-live="polite">
      <Icon name={state === "copied" ? "check" : "copy"} />
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}
    </Button>
  );
}
