// RFC 4122 UUID (any version, including the v4 crypto.randomUUID() the
// chat widget generates per browser session) — not validating the version
// nibble strictly, since nothing here depends on which version was used.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
