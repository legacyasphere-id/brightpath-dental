export function StatsCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-clinic-border bg-clinic-surface p-4">
      <p className="text-xs uppercase tracking-wide text-clinic-muted">
        {label}
      </p>
      <p className="mt-1 font-sans text-2xl font-bold text-clinic-text">
        {value}
      </p>
    </div>
  );
}
