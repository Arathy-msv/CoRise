"use client";

import { useState } from "react";

const SUPPORTERS = [
  { id: "jan", name: "Jan M.", email: "jan.m@example.com" },
  { id: "rahul", name: "Rahul S.", email: "rahul.s@example.com" },
  { id: "maya", name: "Maya K.", email: "maya.k@example.com" },
  { id: "asha", name: "Asha K.", email: "asha.k@example.com" },
  { id: "leo", name: "Leo P.", email: "leo.p@example.com" },
  { id: "noah", name: "Noah T.", email: "noah.t@example.com" },
  { id: "priya", name: "Priya D.", email: "priya.d@example.com" },
  { id: "elena", name: "Elena V.", email: "elena.v@example.com" },
  { id: "omar", name: "Omar H.", email: "omar.h@example.com" },
  { id: "sofia", name: "Sofia L.", email: "sofia.l@example.com" },
  { id: "kenji", name: "Kenji A.", email: "kenji.a@example.com" },
  { id: "nina", name: "Nina R.", email: "nina.r@example.com" },
];

/** Demo invite list. Nothing is emailed. */
export function InviteSupporters({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState<string[] | null>(null);
  const allSelected = selected.length === SUPPORTERS.length;

  const toggle = (id: string) => {
    setSent(null);
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleAll = () => {
    setSent(null);
    setSelected(allSelected ? [] : SUPPORTERS.map((person) => person.id));
  };

  const send = () => {
    if (selected.length === 0) return;
    setSent(selected);
  };

  return (
    <div>
      <button type="button" onClick={onBack} className="text-xs font-semibold text-[#183B2E] underline">
        Back to share options
      </button>
      <p className="mt-2 text-xs text-gray-500">Pick who should get an invitation. This is a demo, so no email is sent.</p>

      <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-800">
        <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-[#183B2E]" />
        Select all ({SUPPORTERS.length})
      </label>

      <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-2">
        {SUPPORTERS.map((person) => (
          <li key={person.id}>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-[#F6F8F5]">
              <input
                type="checkbox"
                checked={selected.includes(person.id)}
                onChange={() => toggle(person.id)}
                className="h-4 w-4 accent-[#183B2E]"
              />
              <span className="font-semibold text-gray-900">{person.name}</span>
              <span className="truncate text-gray-500">{person.email}</span>
            </label>
          </li>
        ))}
      </ul>

      {sent ? (
        <p role="status" className="mt-3 rounded-xl bg-[#F6F8F5] px-3 py-2 text-xs font-semibold text-[#183B2E]">
          Ready for {sent.length} {sent.length === 1 ? "person" : "people"}. No email was sent.
        </p>
      ) : (
        <button
          type="button"
          onClick={send}
          disabled={selected.length === 0}
          className="mt-3 w-full rounded-xl bg-[#183B2E] py-2.5 text-xs font-semibold text-white hover:bg-[#122D23] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selected.length === 0 ? "Select supporters to invite" : `Send invitations (${selected.length})`}
        </button>
      )}
    </div>
  );
}
