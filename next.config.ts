import type { NextConfig } from "next";

// CSP allows 'unsafe-inline' for scripts/styles because Next.js App
// Router injects its own hydration/RSC-payload scripts inline without a
// nonce unless middleware generates one — doing that is a bigger change
// than this header belongs in. This still blocks loading any script,
// style, image, or connection from a third-party origin, which is the
// main thing a CSP buys a site that (checked before writing this) never
// uses dangerouslySetInnerHTML anywhere, so there's no obvious sink for
// an attacker-controlled string to become markup in the first place.
// next dev's Fast Refresh/HMR runs through webpack's eval-based dev
// source maps, which needs 'unsafe-eval' in script-src or the app fails
// to hydrate at all in development — confirmed by running it and seeing
// exactly that CSP violation, not assumed. Production builds don't eval
// anything, so this stays out of what actually ships.
const IS_STANDALONE_PROD =
  process.env.NODE_ENV === "production" && !process.env.APP_URL;

const SCRIPT_SRC =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const CSP_DIRECTIVES = [
  "default-src 'self'",
  SCRIPT_SRC,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co",
  "font-src 'self' data:",
  // The browser Supabase client (admin login) talks to the project's
  // REST/Auth endpoints directly from the browser; everything else
  // (OpenRouter, the service-role Supabase client) is server-side only
  // and isn't a browser connect-src concern.
  "connect-src 'self' https://*.supabase.co",
  IS_STANDALONE_PROD ? "frame-ancestors 'none'" : "frame-ancestors *",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    const securityHeaders = [
      { key: "Content-Security-Policy", value: CSP_DIRECTIVES },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ];

    if (IS_STANDALONE_PROD) {
      securityHeaders.push({ key: "X-Frame-Options", value: "DENY" });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
