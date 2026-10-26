"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { onDemoFill } from "@/lib/demo-data";
import { HERO_IMAGE_KEYS, HERO_IMAGES } from "@/lib/hero-images";
import type { Campaign, CampaignChangeSet, ThemePreset } from "@/types/corise";
import { THEME_COLORS } from "@/types/corise";

const THEME_LABELS: Record<ThemePreset, string> = {
  forest: "Forest",
  amber: "Amber",
  ocean: "Ocean",
  rose: "Rose",
};

/** A field the page can't be without: blank input stays local so the page keeps its last good text. */
function RequiredText({
  label,
  value,
  maxLength,
  multiline = false,
  onCommit,
}: {
  label: string;
  value: string;
  maxLength: number;
  multiline?: boolean;
  onCommit: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  const blank = !text.trim();
  const change = (next: string) => {
    setText(next);
    if (next.trim()) onCommit(next);
  };
  return (
    <Field label={label} error={blank ? `${label} can't be empty — your page keeps the previous text.` : undefined}>
      {multiline ? (
        <TextArea value={text} maxLength={maxLength} rows={4} aria-invalid={blank} onChange={(e) => change(e.target.value)} />
      ) : (
        <TextInput value={text} maxLength={maxLength} aria-invalid={blank} onChange={(e) => change(e.target.value)} />
      )}
    </Field>
  );
}

/** The one place to edit a page: text, colour and cover photo. Every change shows in the preview instantly. */
export function CampaignEditor({
  campaign,
  live,
  onChange,
  onClose,
}: {
  campaign: Campaign;
  live: boolean;
  onChange: (patch: CampaignChangeSet) => void;
  onClose: () => void;
}) {
  // Bumped on every demo fill so the uncontrolled text fields below remount with the new values.
  const [demoVersion, setDemoVersion] = useState(0);

  useEffect(
    () =>
      onDemoFill((bundle) => {
        onChange(bundle.campaign);
        setDemoVersion((v) => v + 1);
      }),
    [onChange]
  );

  return (
    <aside
      aria-labelledby="editor-title"
      className="fixed inset-x-0 bottom-0 z-40 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-[var(--shadow-lg)] lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[380px] lg:rounded-none lg:border-l lg:border-[var(--color-border)] lg:shadow-none"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 id="editor-title" className="text-[17px] font-semibold">
            Edit page
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            {live ? "Changes save automatically and show on your live page." : "Changes save automatically."}
          </p>
        </div>
        <Button size="sm" onClick={onClose}>
          Done
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6">
        <RequiredText
          key={`title-${demoVersion}`}
          label="Title"
          value={campaign.title}
          maxLength={90}
          onCommit={(title) => onChange({ title })}
        />
        <Field label="Headline">
          <TextInput value={campaign.headline} maxLength={120} onChange={(e) => onChange({ headline: e.target.value })} />
        </Field>
        <RequiredText
          key={`description-${demoVersion}`}
          label="Description"
          multiline
          value={campaign.description}
          maxLength={600}
          onCommit={(description) => onChange({ description })}
        />
        <RequiredText
          key={`cta-${demoVersion}`}
          label="Button text"
          value={campaign.primaryCta}
          maxLength={40}
          onCommit={(primaryCta) => onChange({ primaryCta })}
        />

        <fieldset>
          <legend className="text-[13px] font-semibold">Colour</legend>
          <div className="mt-2 flex gap-2">
            {(Object.keys(THEME_COLORS) as ThemePreset[]).map((theme) => {
              const selected = campaign.theme === theme;
              return (
                <button
                  key={theme}
                  type="button"
                  aria-label={THEME_LABELS[theme]}
                  aria-pressed={selected}
                  title={THEME_LABELS[theme]}
                  onClick={() => onChange({ theme })}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ring-offset-2 transition focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                    selected ? "ring-2 ring-[var(--color-text)]" : "hover:scale-105"
                  }`}
                  style={{ background: THEME_COLORS[theme].primary }}
                >
                  {selected ? <Icon name="check" size={16} className="text-white" /> : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[13px] font-semibold">Cover photo</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {HERO_IMAGE_KEYS.map((key) => {
              const selected = campaign.heroImage === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={HERO_IMAGES[key].label}
                  aria-pressed={selected}
                  onClick={() => onChange({ heroImage: key })}
                  className={`relative aspect-[4/3] overflow-hidden rounded-lg transition focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                    selected ? "ring-2 ring-[var(--color-primary)] ring-offset-2" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image src={HERO_IMAGES[key].src} alt="" fill sizes="110px" className="object-cover" />
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </aside>
  );
}
