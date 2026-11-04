// ADMIN_EMAILS is a comma-separated allowlist (e.g. "a@x.com, b@y.com").
// Comparison is case-insensitive since email addresses are, in practice,
// treated that way by every provider that matters here, including
// Supabase Auth's own sign-up flow.
function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
