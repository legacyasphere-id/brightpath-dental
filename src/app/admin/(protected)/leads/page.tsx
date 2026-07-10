import { LeadsTable } from "@/components/admin/LeadsTable";

export default function AdminLeadsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <h1 className="font-sans text-2xl font-bold text-clinic-text">Leads</h1>
      <LeadsTable leads={[]} />
    </div>
  );
}
