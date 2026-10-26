import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import type { LinkProps } from "next/link";
import { Spinner } from "@/components/ui/Spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "accent"
  | "danger"
  | "brand"
  | "dark";
type Size = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary: "corise-btn corise-btn-primary",
  secondary: "corise-btn corise-btn-secondary",
  outline: "corise-btn corise-btn-outline",
  ghost: "corise-btn corise-btn-ghost",
  accent: "corise-btn corise-btn-accent",
  danger: "corise-btn corise-btn-danger",
  brand: "corise-btn corise-btn-brand",
  dark: "corise-btn corise-btn-dark",
};

const sizeClass: Record<Size, string> = {
  sm: "corise-btn-sm",
  md: "corise-btn-md",
  lg: "corise-btn-lg",
};

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  type = "button",
  loading = false,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      className={cx(variantClass[variant], sizeClass[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

/** Use instead of wrapping Button in Link (invalid HTML / hover color bugs). */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: Omit<LinkProps, "className"> & {
  href: string;
  variant?: ButtonVariant;
  size?: Size;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href={href}
      className={cx(variantClass[variant], sizeClass[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
