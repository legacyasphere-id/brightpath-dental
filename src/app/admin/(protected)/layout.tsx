import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdminEmail(user.email)) {
    // A real, signed-in Supabase user — just not on the ADMIN_EMAILS
    // allowlist. Sign out server-side rather than only redirecting, so
    // the session cookie doesn't linger and let them straight back in
    // on the next request.
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return <div className="min-h-screen bg-clinic-bg">{children}</div>;
}
