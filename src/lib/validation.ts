import { z } from "zod";

// RFC 4122 UUID (any version, including the v4 crypto.randomUUID() the
// chat widget generates per browser session) — not validating the version
// nibble strictly, since nothing here depends on which version was used.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

// Deliberately loose — digits plus the separators real phone numbers
// (and the +62 country code / dashed placeholders already used
// elsewhere in this codebase, e.g. "+62-xxx-xxxx-xxxx") actually use.
// This is spam/garbage filtering, not phone-number parsing: it isn't
// trying to validate that a number is dialable.
const PHONE_PATTERN = /^[0-9+\-\s()]{8,20}$/;

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(100, "name must be 100 characters or fewer"),
  phone: z
    .string()
    .trim()
    .regex(PHONE_PATTERN, "phone must be a valid phone number"),
  serviceInterest: z
    .string()
    .trim()
    .max(200, "serviceInterest must be 200 characters or fewer")
    .optional(),
  preferredDate: z
    .string()
    .trim()
    .max(20, "preferredDate must be 20 characters or fewer")
    .optional(),
  conversationId: z
    .string()
    .refine(isValidUuid, "conversationId must be a valid UUID")
    .optional(),
  source: z.enum(["chat", "form"]).optional(),
  message: z
    .string()
    .trim()
    .max(2000, "message must be 2000 characters or fewer")
    .optional(),
  // Honeypot — see LeadForm.tsx / LeadCapture.tsx. Real visitors never
  // see or fill this field; any non-empty value is a near-certain bot.
  // No length cap: a bot filling garbage into it doesn't need to be
  // accepted, only detected.
  website: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
