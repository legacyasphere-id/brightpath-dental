import { StatsCard } from "@/components/admin/StatsCard";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <h1 className="font-sans text-2xl font-bold text-clinic-text">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard label="Total Leads" value="—" />
        <StatsCard label="Today's Leads" value="—" />
        <StatsCard label="Ready Documents" value="—" />
      </div>
    </div>
  );
}
