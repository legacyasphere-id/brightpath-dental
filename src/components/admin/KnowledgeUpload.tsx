import type { Document } from "@/types";

export function KnowledgeUpload({ documents }: { documents: Document[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-dashed border-clinic-border p-8 text-center text-sm text-clinic-muted">
        Drop a PDF, DOCX, or TXT file (max 10MB)
      </div>
      <ul className="divide-y divide-clinic-border">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between py-2 text-sm">
            <span>{doc.name}</span>
            <span className="text-clinic-muted">
              {doc.status} · {doc.chunk_count} chunks
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
