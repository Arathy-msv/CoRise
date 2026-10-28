"use client";

import { useState } from "react";
import { SupporterNoteBanner } from "@/components/supporter/SupporterNoteBanner";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SHARE_NOTE_PRESETS } from "@/lib/endorsement";
import { MAX_PERSONAL_NOTE, defaultPersonalNote, savePersonalNote, type CampaignMembership } from "@/lib/supporter-network";
import type { DemoSupporter } from "@/lib/supporters";
import type { Campaign } from "@/types/corise";

export function EditNoteDialog({
  campaign,
  supporter,
  membership,
  onClose,
  onSaved,
}: {
  campaign: Campaign;
  supporter: DemoSupporter;
  membership: CampaignMembership;
  onClose: () => void;
  onSaved: (cleared: boolean) => void;
}) {
  const [note, setNote] = useState(membership.personalNote);
  const [error, setError] = useState("");
  const trimmed = note.trim();
  const fallback = defaultPersonalNote(campaign.title);

  const save = () => {
    if (!savePersonalNote(membership.id, supporter.id, trimmed)) {
      setError("Couldn't save your note in this browser. Try again.");
      return;
    }
    onSaved(!trimmed);
  };

  return (
    <Modal
      title="Edit your personal note"
      description={`This note appears above ${campaign.title} when someone opens your link. It's only on your link — the campaign itself doesn't change.`}
      onClose={onClose}
      wide
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" aria-label="Quick notes">
          {SHARE_NOTE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={trimmed === preset.note}
              onClick={() => {
                setNote(preset.note);
                setError("");
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                trimmed === preset.note
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-primary-soft)]"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="personal-note" className="text-sm font-semibold">
            Your message
          </label>
          <textarea
            id="personal-note"
            value={note}
            maxLength={MAX_PERSONAL_NOTE}
            rows={4}
            placeholder={fallback}
            onChange={(e) => {
              setNote(e.target.value);
              setError("");
            }}
            aria-describedby="personal-note-count"
            className="corise-input mt-1.5 resize-y text-sm"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>{trimmed ? "Shown exactly as written." : "Empty notes use the default message."}</span>
            <span id="personal-note-count">
              {note.length}/{MAX_PERSONAL_NOTE}
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Live preview</p>
          <SupporterNoteBanner name={supporter.name} note={trimmed || fallback} />
        </div>

        {error ? <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => setNote("")} disabled={!note}>
            Clear note
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save}>Save note</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
