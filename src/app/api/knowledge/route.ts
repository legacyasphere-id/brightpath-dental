import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { embed } from "@/lib/ai/embeddings";
import type { DocumentFileType, KnowledgeUploadResponse } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CHUNK_SIZE = Number(process.env.RAG_CHUNK_SIZE ?? 500); // approx. words per chunk
const CHUNK_OVERLAP = Number(process.env.RAG_CHUNK_OVERLAP ?? 50);

const EXTENSION_TO_TYPE: Record<string, DocumentFileType> = {
  pdf: "pdf",
  docx: "docx",
  txt: "txt",
};

async function extractText(buffer: Buffer, fileType: DocumentFileType) {
  if (fileType === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (fileType === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf-8");
}

// Approximates "tokens" as whitespace-delimited words — no tokenizer
// dependency needed for MVP chunking.
function chunkText(text: string, size: number, overlap: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  const step = Math.max(size - overlap, 1);

  for (let start = 0; start < words.length; start += step) {
    const chunk = words.slice(start, start + size).join(" ");
    if (chunk) chunks.push(chunk);
    if (start + size >= words.length) break;
  }

  return chunks;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const fileType = EXTENSION_TO_TYPE[extension];

  if (!fileType) {
    return NextResponse.json(
      { error: "Unsupported file type — use PDF, DOCX, or TXT" },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds 10MB limit" },
      { status: 400 },
    );
  }

  const service = createServiceClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await service.storage
    .from("documents")
    .upload(storagePath, buffer, {
      contentType: file.type || undefined,
    });

  if (uploadError) {
    console.error("[api/knowledge] storage upload failed:", uploadError);
    return NextResponse.json(
      { error: "Failed to store file" },
      { status: 500 },
    );
  }

  const { data: document, error: insertError } = await service
    .from("documents")
    .insert({
      name: file.name,
      file_path: storagePath,
      file_type: fileType,
      file_size: file.size,
      status: "processing",
    })
    .select()
    .single();

  if (insertError || !document) {
    console.error("[api/knowledge] document insert failed:", insertError);
    return NextResponse.json(
      { error: "Failed to record document" },
      { status: 500 },
    );
  }

  try {
    const text = await extractText(buffer, fileType);
    const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);

    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];

      const { data: chunkRow, error: chunkError } = await service
        .from("document_chunks")
        .insert({
          document_id: document.id,
          content,
          chunk_index: i,
          token_count: content.split(/\s+/).filter(Boolean).length,
        })
        .select()
        .single();

      if (chunkError || !chunkRow) {
        throw new Error(`Failed to insert chunk ${i}: ${chunkError?.message}`);
      }

      const embedding = await embed(content);

      const { error: embeddingError } = await service
        .from("embeddings")
        .insert({ chunk_id: chunkRow.id, embedding });

      if (embeddingError) {
        throw new Error(
          `Failed to insert embedding for chunk ${i}: ${embeddingError.message}`,
        );
      }
    }

    await service
      .from("documents")
      .update({ status: "ready", chunk_count: chunks.length })
      .eq("id", document.id);

    const response: KnowledgeUploadResponse = {
      documentId: document.id,
      chunkCount: chunks.length,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/knowledge] ingestion failed:", error);
    await service
      .from("documents")
      .update({ status: "error" })
      .eq("id", document.id);

    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/knowledge] list failed:", error);
    return NextResponse.json(
      { error: "Failed to list documents" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
