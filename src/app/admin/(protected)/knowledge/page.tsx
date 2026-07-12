import { KnowledgeUpload } from "@/components/admin/KnowledgeUpload";
import { createServiceClient } from "@/lib/supabase/server";

async function getDocuments() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("documents")
      .select("id, name, status, chunk_count")
      .order("created_at", { ascending: false });
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function KnowledgePage() {
  const documents = await getDocuments();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div>
        <h1 className="font-sans text-2xl font-bold text-clinic-text">Knowledge Base</h1>
        <p className="mt-1 text-sm text-clinic-muted">
          Upload clinic documents — AI answers are grounded in this content.
        </p>
      </div>
      <KnowledgeUpload initialDocuments={documents} />
    </div>
  );
}
