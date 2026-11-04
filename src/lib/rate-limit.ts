import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Window = `${number} ${"ms" | "s" | "m" | "h" | "d"}`;

// One limiter per named caller (e.g. "chat", "leads"), built once and
// reused across requests on this server instance rather than reconnecting
// to Redis every call. `null` means "no Upstash env vars configured" — the
// warning for that case is logged exactly once, the first time a route
// asks for a limiter, not on every request.
const limiters = new Map<string, Ratelimit | null>();
let warnedMissingEnv = false;

function buildLimiter(name: string, limit: number, window: Window): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!warnedMissingEnv) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN are not set — " +
          "requests are NOT rate limited. Set both to enable per-IP limiting.",
      );
      warnedMissingEnv = true;
    }
    return null;
  }

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `brightpath:${name}`,
    analytics: false,
  });
}

function getLimiter(name: string, limit: number, window: Window): Ratelimit | null {
  if (!limiters.has(name)) {
    limiters.set(name, buildLimiter(name, limit, window));
  }
  return limiters.get(name) ?? null;
}

// x-forwarded-for carries the real client IP behind Vercel's proxy
// (and most others) as the first, left-most entry; x-real-ip is a
// single-IP fallback some proxies set instead. Neither is guaranteed,
// so an identifier of "unknown" is possible — callers fail open rather
// than block a request over a missing header.
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitResult {
  limited: boolean;
}

// Fails open: with no Upstash env vars configured, or if the Upstash
// request itself throws (network blip, Redis down), requests are let
// through rather than the route going down because a rate limiter did.
// The missing-env case is logged once at startup-ish time above; a
// runtime failure is logged per occurrence since it's unexpected.
export async function checkRateLimit(
  name: string,
  limit: number,
  window: Window,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getLimiter(name, limit, window);
  if (!limiter) {
    return { limited: false };
  }

  try {
    const { success } = await limiter.limit(identifier);
    return { limited: !success };
  } catch (error) {
    console.error(`[rate-limit] ${name} check failed, allowing request:`, error);
    return { limited: false };
  }
}
