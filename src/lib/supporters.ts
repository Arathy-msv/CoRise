/** Demo supporter roster. These people have no accounts — the supporter view lets you act as one of them. */
export type DemoSupporter = { id: string; name: string; email: string };

export const DEMO_SUPPORTERS: DemoSupporter[] = [
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

export const DEFAULT_SUPPORTER_ID = DEMO_SUPPORTERS[0].id;

export function findSupporter(id: string | null | undefined): DemoSupporter | undefined {
  if (!id) return undefined;
  return DEMO_SUPPORTERS.find((person) => person.id === id);
}

export function supporterInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
