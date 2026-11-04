import type { DocumentFileType } from "@/types";

// Keeps only a conservative, URL-path-safe character set. Strips any
// directory component first — nothing in the browser's File API should
// ever put a slash in `.name`, but nothing stops a crafted multipart
// request from doing it anyway, and this value becomes part of a
// Supabase Storage key (effectively a URL path segment).
export function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() || "file";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "");
  const safe = cleaned || "file";
  // Keep the tail, not the head, so a very long name still keeps its
  // extension rather than getting truncated mid-name and losing it.
  return safe.slice(-150);
}

// Magic bytes for the two binary formats this app accepts. TXT has no
// reliable signature — any byte sequence can be valid plain text — so
// it's intentionally absent and treated as "nothing to check."
const FILE_SIGNATURES: Partial<Record<DocumentFileType, readonly number[]>> = {
  pdf: [0x25, 0x50, 0x44, 0x46, 0x2d], // "%PDF-"
  // DOCX is a ZIP container (Office Open XML) — this is the standard
  // ZIP local-file-header signature, not a DOCX-specific one, but DOCX
  // files always start with it in practice.
  docx: [0x50, 0x4b, 0x03, 0x04], // "PK\x03\x04"
};

// Confirms the file's actual bytes match what its extension claims,
// rather than trusting the extension alone — a renamed .exe or .html
// would otherwise sail through the extension check untouched.
export function matchesFileSignature(buffer: Buffer, fileType: DocumentFileType): boolean {
  const signature = FILE_SIGNATURES[fileType];
  if (!signature) return true;
  if (buffer.length < signature.length) return false;
  return signature.every((byte, i) => buffer[i] === byte);
}
