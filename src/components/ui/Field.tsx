import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5" style={{ marginBottom: 0 }}>
      <span className="block text-[13px] font-semibold text-[var(--color-text)]">{label}</span>
      {children}
      {hint && !error ? (
        <span className="block text-xs text-[var(--color-text-muted)]">{hint}</span>
      ) : null}
      {error ? (
        <span className="block text-xs font-medium text-[var(--color-danger)]">{error}</span>
      ) : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`corise-input ${className}`} {...rest} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea className={`corise-input min-h-[96px] resize-y ${className}`} {...rest} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return <select className={`corise-input ${className}`} {...rest} />;
}
