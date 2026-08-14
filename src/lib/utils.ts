type ClassValue = string | number | null | boolean | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

// Shared rhythm for every full marketing section: 4rem on mobile, 6rem at
// md, 8rem at lg, so spacing is systematic rather than a per-section guess.
// Deliberately not applied to ProofStrip (a thin trust bar by design, not a
// content section) or Hero (the one section meant to carry more visual
// weight than the rest).
export const SECTION_PADDING = "px-6 py-16 md:py-24 lg:py-32";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
