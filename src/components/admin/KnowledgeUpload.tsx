"use client";

import { useRef, useState } from "react";

interface Document {
  id: string;
  name: string;
  status: string;
  chunk_count: number;
}

interface Props {
  initialDocuments?: Document[];
}

export function KnowledgeUpload({ initialDocuments = [] }: Props) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function fetchDocuments() {
    const res = await fetch("/api/knowledge");
    if (res.ok) {
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    }
  }

  async function uploadFile(file: File) {
    if (!file) return;
    const allowed = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      setUploadStatus("error");
      setUploadMessage("Only PDF, TXT, or DOCX files allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage("File must be under 10MB.");
      return;
    }

    setUploading(true);
    setUploadStatus("idle");
    setUploadMessage(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/knowledge", { method: "POST", body: formData });
    setUploading(false);

    if (res.ok) {
      setUploadStatus("success");
      setUploadMessage(`${file.name} uploaded and embedded successfully.`);
      await fetchDocuments();
    } else {
      const err = await res.json().catch(() => ({}));
      setUploadStatus("error");
      setUploadMessage(err.error ?? "Upload failed. Make sure you are logged in.");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center text-sm transition-colors ${
          dragOver
            ? "border-clinic-mint bg-clinic-mintLight"
            : "border-clinic-border hover:border-clinic-mint hover:bg-clinic-mintLight/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <p className="text-clinic-mint font-medium animate-pulse">{uploadMessage}</p>
        ) : (
          <>
            <p className="font-medium text-clinic-text">Click or drag a file here</p>
            <p className="mt-1 text-clinic-muted">PDF, DOCX, or TXT — max 10MB</p>
          </>
        )}
      </div>

      {/* Status message */}
      {!uploading && uploadStatus !== "idle" && (
        <p className={`text-sm ${uploadStatus === "success" ? "text-green-600" : "text-red-600"}`}>
          {uploadMessage}
        </p>
      )}

      {/* Document list */}
      {documents.length > 0 && (
        <ul className="divide-y divide-clinic-border rounded-lg border border-clinic-border">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium text-clinic-text truncate max-w-xs">{doc.name}</span>
              <span className={`ml-4 flex-shrink-0 text-xs font-medium rounded-full px-2 py-0.5 ${
                doc.status === "ready"
                  ? "bg-green-100 text-green-700"
                  : doc.status === "processing"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {doc.status} · {doc.chunk_count} chunks
              </span>
            </li>
          ))}
        </ul>
      )}

      {documents.length === 0 && !uploading && (
        <p className="text-center text-sm text-clinic-muted">No documents uploaded yet.</p>
      )}
    </div>
  );
}
