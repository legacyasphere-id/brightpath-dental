import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Standard Supabase SSR middleware: a Server Component can read cookies
// but can't write them, so a near-expiry session can never refresh
// itself on a Server Component-only request path. Middleware runs
// before every matched request and can write cookies, so it's the one
// place that keeps the session cookie current — without this, an admin
// session silently goes stale and getUser() in the admin layout / API
// routes starts failing even though the user never explicitly signed
// out.
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror the refreshed cookies onto both the incoming request
          // (so this same middleware invocation's downstream rendering
          // sees them) and a freshly rebuilt response (so the browser
          // gets them) — the response has to be rebuilt after mutating
          // the request, not reused, or it silently carries stale
          // request headers.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // The call itself is what triggers a refresh when the access token is
  // near/past expiry — the returned user isn't used here. Each matched
  // route still does its own auth check (admin layout, /api/knowledge).
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  // Scoped to the routes that actually have a session to refresh — the
  // admin pages and /api/knowledge, which the admin dashboard calls.
  // Deliberately excludes /api/chat, /api/leads, and /api/health: those
  // are public and anonymous, so this would add a Supabase Auth round
  // trip to every chat message and lead submission for a session that
  // never exists on that path.
  matcher: ["/admin/:path*", "/api/knowledge/:path*"],
};
