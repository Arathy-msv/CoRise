"use client";

import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { SECTION_BACKGROUNDS } from "@/lib/website-sections";
import type { OrgWebsiteContent, SectionBackground, WebsiteSection } from "@/types/corise";

export type ImageTarget = { kind: "hero" } | { kind: "section"; index: number };

export interface WebsiteEditApi {
  setContent: (patch: Partial<OrgWebsiteContent>) => void;
  updateSection: (index: number, patch: Partial<WebsiteSection>) => void;
  swapSections: (a: number, b: number) => void;
  removeSection: (index: number) => void;
  requestAddSection: (index: number) => void;
  requestImage: (target: ImageTarget) => void;
}

const WebsiteEditContext = createContext<WebsiteEditApi | null>(null);

export function WebsiteEditProvider({ value, children }: { value: WebsiteEditApi; children: ReactNode }) {
  return <WebsiteEditContext.Provider value={value}>{children}</WebsiteEditContext.Provider>;
}

/** Null on public pages, so the renderer outputs plain markup there. */
export function useWebsiteEdit() {
  return useContext(WebsiteEditContext);
}

export function EditableText({
  value,
  onChange,
  label,
  placeholder = "Click to add text",
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}) {
  const edit = useWebsiteEdit();
  if (!edit) return <>{value}</>;
  return <InlineTextBox value={value} onChange={onChange} label={label} placeholder={placeholder} />;
}

function InlineTextBox({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.textContent !== value) el.textContent = value;
  }, [value]);

  return (
    <span
      ref={ref}
      role="textbox"
      aria-label={label}
      title="Click to edit text"
      data-placeholder={placeholder}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      className="site-editable"
      onInput={(e) => {
        const el = e.currentTarget;
        if (!el.textContent) el.innerHTML = "";
        onChange(el.textContent ?? "");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        document.execCommand("insertText", false, e.clipboardData.getData("text/plain").replace(/\s*\n+\s*/g, " "));
      }}
      onBlur={(e) => {
        const text = (e.currentTarget.textContent ?? "").trim();
        if (text !== value) onChange(text);
        if (e.currentTarget.textContent !== text) e.currentTarget.textContent = text;
      }}
    />
  );
}

function ToolButton({
  label,
  icon,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-35 ${
        danger ? "text-red-300 hover:bg-red-500/20" : "hover:bg-white/10"
      }`}
    >
      <Icon name={icon} size={15} />
      {children}
    </button>
  );
}

/**
 * Applies a section's background everywhere; in the editor it also adds the outline and floating controls.
 * Omit the move/delete handlers for fixed blocks such as the footer.
 */
export function EditableSectionWrapper({
  label,
  background,
  onBackground,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp = true,
  canMoveDown = true,
  canDelete = true,
  as: Tag = "div",
  children,
}: {
  label: string;
  background?: SectionBackground;
  onBackground?: (bg: SectionBackground) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canDelete?: boolean;
  as?: "div" | "footer";
  children: ReactNode;
}) {
  const edit = useWebsiteEdit();
  const bgClass = background ? `site-bg-${background}` : "";
  if (!edit) return <Tag className={bgClass}>{children}</Tag>;

  return (
    <Tag
      className={`group/section relative outline-2 -outline-offset-2 outline-transparent transition-[outline-color] hover:outline-[var(--color-primary)] focus-within:outline-[var(--color-primary)] ${bgClass}`}
      data-editable-section={label}
    >
      {children}
      <div
        role="toolbar"
        aria-label={`${label} section controls`}
        className="absolute right-3 top-3 z-30 flex flex-wrap items-center gap-0.5 rounded-lg bg-[#101512]/95 p-1 text-white opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover/section:opacity-100 group-focus-within/section:opacity-100 focus-within:opacity-100 max-md:opacity-100"
      >
        <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-white/60">{label}</span>
        {onMoveUp ? <ToolButton label="Move up" icon="arrowUp" onClick={onMoveUp} disabled={!canMoveUp} /> : null}
        {onMoveDown ? <ToolButton label="Move down" icon="arrowDown" onClick={onMoveDown} disabled={!canMoveDown} /> : null}
        {onBackground && background ? (
          <div role="group" aria-label="Background" className="mx-0.5 inline-flex rounded-md bg-white/10 p-0.5">
            {SECTION_BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                type="button"
                aria-pressed={background === bg.id}
                onClick={() => onBackground(bg.id)}
                className={`h-7 rounded px-2 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-white ${
                  background === bg.id ? "bg-white text-[#101512]" : "text-white/75 hover:text-white"
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>
        ) : null}
        {onDelete ? <ToolButton label="Delete section" icon="trash" onClick={onDelete} disabled={!canDelete} danger /> : null}
      </div>
    </Tag>
  );
}

export function AddSectionDivider({ index }: { index: number }) {
  const edit = useWebsiteEdit();
  if (!edit) return null;
  return (
    <div className="group/divider relative z-20 h-0">
      <div className="absolute inset-x-4 top-0 flex -translate-y-1/2 items-center">
        <span className="h-px flex-1 border-t-2 border-dashed border-[var(--color-primary)]/30 transition group-hover/divider:border-[var(--color-primary)]" />
        <button
          type="button"
          onClick={() => edit.requestAddSection(index)}
          className="mx-2 inline-flex h-7 items-center gap-1 rounded-full border-2 border-dashed border-[var(--color-primary)]/50 bg-white px-3 text-xs font-semibold text-[var(--color-primary)] shadow-sm transition hover:border-solid hover:border-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
        >
          <Icon name="plus" size={13} />
          Add Section
        </button>
        <span className="h-px flex-1 border-t-2 border-dashed border-[var(--color-primary)]/30 transition group-hover/divider:border-[var(--color-primary)]" />
      </div>
    </div>
  );
}

export function ChangeImageButton({ target, className = "" }: { target: ImageTarget; className?: string }) {
  const edit = useWebsiteEdit();
  if (!edit) return null;
  return (
    <button
      type="button"
      onClick={() => edit.requestImage(target)}
      className={`absolute z-20 inline-flex h-9 items-center gap-1.5 rounded-lg bg-black/65 px-3 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-white ${className}`}
    >
      <span aria-hidden>📷</span>
      Change Image
    </button>
  );
}
