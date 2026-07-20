import { Star, ShieldCheck, BadgeCheck, Users, type LucideIcon } from "lucide-react";

const items: { icon: LucideIcon; label: string }[] = [
  { icon: Star, label: "5.0 patient rating" },
  { icon: ShieldCheck, label: "BPJS & private insurance accepted" },
  { icon: BadgeCheck, label: "Accredited specialist team" },
  { icon: Users, label: "5,000+ patients served" },
];

export function ProofStrip() {
  return (
    <section className="border-y border-clinic-border bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-sm font-medium text-clinic-body"
          >
            <Icon size={18} strokeWidth={1.75} className="text-clinic-navy" />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
