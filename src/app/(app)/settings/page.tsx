"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { useCorise } from "@/context/CoriseContext";

const moreLinks = [
  {
    href: "/engagement",
    title: "Quizzes & activities",
    body: "See campaigns that include quizzes or challenges.",
  },
  {
    href: "/sponsors",
    title: "Sponsors & thank-you rewards",
    body: "Optional local business pledges.",
  },
  {
    href: "/marketplace",
    title: "Products for a cause",
    body: "Example product ideas that support campaigns.",
  },
  {
    href: "/analytics",
    title: "Numbers & reports",
    body: "Simple charts of campaign activity.",
  },
];

export default function SettingsPage() {
  const { state, updateOrganization, hydrated } = useCorise();
  const [form, setForm] = useState(state.organization);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (hydrated) setForm(state.organization);
  }, [hydrated, state.organization]);

  return (
    <div className="animate-fade-up corise-page mx-auto max-w-2xl">
      <div>
        <h1 className="corise-page-title font-display text-[28px] font-semibold">
          Settings & more
        </h1>
        <p className="-mt-2 text-[15px] text-[var(--color-text-muted)]">
          Basic organization details. Extra tools are listed below—you can ignore them for
          everyday use.
        </p>
      </div>

      <section className="corise-card space-y-3 p-4">
        <h2 className="font-display text-xl font-semibold">Your organization</h2>
        <Field label="Organization name">
          <TextInput
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Short name">
          <TextInput
            value={form.shortName}
            onChange={(e) => setForm({ ...form, shortName: e.target.value })}
          />
        </Field>
        <Field label="What you do">
          <TextArea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <Field label="Contact (shown on your website)">
          <TextInput
            value={form.contactLabel}
            onChange={(e) => setForm({ ...form, contactLabel: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <TextInput
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </Field>
        <Button
          onClick={() => {
            updateOrganization(form);
            setSaved(true);
          }}
        >
          Save changes
        </Button>
        {saved ? (
          <p className="text-sm font-medium text-[var(--color-primary)]">
            Saved. Your details will be used the next time you create a website or campaign.
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">More options</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          These are optional. You do not need them to create a website or campaign.
        </p>
        <ul className="space-y-2.5">
          {moreLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="corise-card block p-4 transition hover:border-[var(--color-primary)]/40"
              >
                <p className="text-base font-semibold">{item.title}</p>
                <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{item.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
