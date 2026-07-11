export type DocumentStatus = "processing" | "ready" | "error";
export type DocumentFileType = "pdf" | "docx" | "txt";

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: DocumentFileType;
  file_size: number | null;
  status: DocumentStatus;
  chunk_count: number;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  token_count: number | null;
  created_at: string;
}

export interface Embedding {
  id: string;
  chunk_id: string;
  embedding: number[];
  created_at: string;
}

export interface Conversation {
  id: string;
  session_id: string;
  created_at: string;
  lead_id: string | null;
}

export type MessageRole = "user" | "assistant";

export interface MessageSource {
  chunk_id: string;
  document_name: string;
  excerpt: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  sources: MessageSource[] | null;
  created_at: string;
}

export type LeadSource = "chat" | "form";
export type LeadStatus = "new" | "contacted" | "booked" | "closed";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  service_interest: string | null;
  preferred_date: string | null;
  source: LeadSource;
  conversation_id: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface RetrievedChunk {
  chunk_id: string;
  document_name: string;
  content: string;
  similarity: number;
}

export interface ChatRequestBody {
  message: string;
  conversationId?: string;
  sessionId: string;
}

export interface ChatResponseSignal {
  requiresLead: boolean;
}

export interface LeadRequestBody {
  name: string;
  phone: string;
  serviceInterest?: string;
  preferredDate?: string;
  conversationId?: string;
  source?: LeadSource;
  message?: string;
}

export interface KnowledgeUploadResponse {
  documentId: string;
  chunkCount: number;
}
