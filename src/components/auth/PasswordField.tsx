"use client";

import { useState } from "react";
import { Field, TextInput } from "@/components/ui/Field";

export function PasswordField({
  id,
  label = "Password",
  value,
  onChange,
  autoComplete = "current-password",
  error,
  readOnly = false,
}: {
  id: string;
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
  error?: string;
  readOnly?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} error={error}>
      <div className="flex gap-2">
        <TextInput
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          readOnly={readOnly}
          autoComplete={autoComplete}
          onChange={(e) => onChange?.(e.target.value)}
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1"
        />
        <button type="button" className="corise-btn corise-btn-secondary corise-btn-md shrink-0" onClick={() => setVisible((v) => !v)} aria-pressed={visible}>
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </Field>
  );
}
