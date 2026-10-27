"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { onDemoFill } from "@/lib/demo-data";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type OwnerDetails = { name: string; email: string };

/** Name + email is all it takes to become the page owner. */
export function OwnerSignupForm({
  submitLabel,
  loading = false,
  onSubmit,
  footer,
  nameLabel = "Full name",
  emailLabel = "Email",
}: {
  submitLabel: ReactNode;
  loading?: boolean;
  onSubmit: (details: OwnerDetails) => void;
  footer?: ReactNode;
  nameLabel?: string;
  emailLabel?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(
    () =>
      onDemoFill((bundle) => {
        setName(bundle.person.name);
        setEmail(bundle.person.email);
        setErrors({});
      }),
    []
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      name: name.trim() ? undefined : "Enter your name.",
      email: EMAIL_PATTERN.test(email.trim()) ? undefined : "Enter a valid email address.",
    };
    setErrors(next);
    if (next.name || next.email) return;
    onSubmit({ name: name.trim(), email: email.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label={nameLabel} error={errors.name}>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={60}
          autoFocus
          aria-invalid={Boolean(errors.name)}
        />
      </Field>
      <Field label={emailLabel} error={errors.email}>
        <TextInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          maxLength={120}
          aria-invalid={Boolean(errors.email)}
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        {submitLabel}
      </Button>
      {footer}
    </form>
  );
}
