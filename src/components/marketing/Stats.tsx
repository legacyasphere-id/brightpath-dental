import { Users, Clock, Stethoscope, ThumbsUp, type LucideIcon } from "lucide-react";
import { SECTION_PADDING } from "@/lib/utils";

const stats: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Users, value: "5,000+", label: "Patients Served" },
  { icon: Clock, value: "10+", label: "Years Experience" },
  { icon: Stethoscope, value: "9", label: "Dental Services" },
  { icon: ThumbsUp, value: "98%", label: "Satisfaction Rate" },
];

// Its own section, not tucked under the hero, on purpose — a stats row
// deserves the same generous space as any other section rather than
// competing with the hero's headline and CTAs for room.
export function Stats() {
  return (
    <section className={`bg-clinic-surface ${SECTION_PADDING}`}>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <Icon size={26} strokeWidth={1.5} className="text-clinic-mint" />
              <p className="mt-4 font-sans text-4xl font-extrabold text-clinic-navy md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm text-clinic-muted">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
