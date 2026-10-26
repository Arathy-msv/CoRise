"use client";

import { useState } from "react";
import { HeroVisual } from "@/components/campaign/HeroVisual";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { HERO_IMAGE_KEYS, heroImageLabel } from "@/lib/hero-images";
import { SECTION_TEMPLATES, type SectionTemplate } from "@/lib/website-sections";

export function AddSectionModal({ onPick, onClose }: { onPick: (template: SectionTemplate) => void; onClose: () => void }) {
  return (
    <Modal title="Add a section" description="Pick a block. You can edit its text right on the page." onClose={onClose}>
      <div className="grid gap-2">
        {(Object.keys(SECTION_TEMPLATES) as SectionTemplate[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onPick(key)}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white p-3 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg)] text-xl" aria-hidden>
              {SECTION_TEMPLATES[key].icon}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{SECTION_TEMPLATES[key].label}</span>
              <span className="block text-[13px] text-[var(--color-text-muted)]">{SECTION_TEMPLATES[key].description}</span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

const MAX_UPLOAD_EDGE = 1600;

/** Downscales to keep the data URL small enough for this browser's storage. */
async function fileToDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("unreadable"));
      el.src = url;
    });
    const scale = Math.min(1, MAX_UPLOAD_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ImagePickerModal({
  current,
  onPick,
  onClose,
}: {
  current: string;
  onPick: (imageKey: string) => void;
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Modal title="Change image" description="Choose a photo from the library or upload your own." onClose={onClose}>
      <div className="grid grid-cols-3 gap-2" role="list" aria-label="Photo library">
        {HERO_IMAGE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="listitem"
            aria-label={heroImageLabel(key)}
            aria-pressed={current === key}
            onClick={() => onPick(key)}
            className={`overflow-hidden rounded-lg text-left ring-offset-2 transition focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
              current === key ? "ring-2 ring-[var(--color-primary)]" : "hover:ring-2 hover:ring-[var(--color-border-strong)]"
            }`}
          >
            <HeroVisual imageKey={key} aspect="aspect-[4/3]" className="rounded-none" sizes="140px" />
            <span className="block truncate px-1 py-1 text-[11px] font-medium">{heroImageLabel(key)}</span>
          </button>
        ))}
      </div>
      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-border-strong)] px-4 py-3 text-sm font-semibold transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] focus-within:outline-2 focus-within:outline-[var(--color-primary)]">
        <Icon name="upload" />
        {busy ? "Preparing photo…" : "Upload from device"}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
            setError("");
            setBusy(true);
            try {
              onPick(await fileToDataUrl(file));
            } catch {
              setError("That image couldn't be read. Try a JPG or PNG.");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
