import { KnowledgeUpload } from "@/components/admin/KnowledgeUpload";

export default function AdminKnowledgePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <h1 className="font-sans text-2xl font-bold text-clinic-text">
        Knowledge Base
      </h1>
      <KnowledgeUpload documents={[]} />
    </div>
  );
}
