import type { Lead } from "@/types";

export function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-clinic-border text-clinic-muted">
          <th className="py-2">Name</th>
          <th className="py-2">Phone</th>
          <th className="py-2">Service</th>
          <th className="py-2">Date</th>
          <th className="py-2">Source</th>
          <th className="py-2">Status</th>
          <th className="py-2">Created</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr key={lead.id} className="border-b border-clinic-border">
            <td className="py-2">{lead.name}</td>
            <td className="py-2">{lead.phone}</td>
            <td className="py-2">{lead.service_interest ?? "—"}</td>
            <td className="py-2">{lead.preferred_date ?? "—"}</td>
            <td className="py-2">{lead.source}</td>
            <td className="py-2">{lead.status}</td>
            <td className="py-2">{lead.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
