import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ──────────────────────────────────────────────────────────────────────────────
// In-memory rate limiter (token bucket per IP)
// Resets on server restart — suitable for Vercel serverless & single-instance.
// For multi-instance deployments, replace with Redis-backed limiter.
// ──────────────────────────────────────────────────────────────────────────────
interface RateBucket {
  tokens: number
  lastRefill: number
}

const rateBuckets = new Map<string, RateBucket>()
const RATE_LIMIT_MAX = 30 // max requests
const RATE_LIMIT_WINDOW_MS = 60_000 // per 60 seconds
const RATE_LIMIT_REFILL_RATE = RATE_LIMIT_MAX / RATE_LIMIT_WINDOW_MS

// Stricter limits for auth endpoints
const AUTH_RATE_LIMIT_MAX = 5
const AUTH_RATE_LIMIT_WINDOW_MS = 60_000
const AUTH_RATE_LIMIT_REFILL_RATE = AUTH_RATE_LIMIT_MAX / AUTH_RATE_LIMIT_WINDOW_MS

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

function checkRateLimit(
  key: string,
  maxTokens: number,
  refillRate: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  let bucket = rateBuckets.get(key)

  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now }
    rateBuckets.set(key, bucket)
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill
  bucket.tokens = Math.min(maxTokens, bucket.tokens + elapsed * refillRate)
  bucket.lastRefill = now

  if (bucket.tokens < 1) {
    return { allowed: false, remaining: 0 }
  }

  bucket.tokens -= 1
  return { allowed: true, remaining: Math.floor(bucket.tokens) }
}

// Periodically clean up stale rate limit entries (prevent memory leak)
setInterval(() => {
  const cutoff = Date.now() - 5 * 60_000
  for (const [key, bucket] of rateBuckets) {
    if (bucket.lastRefill < cutoff) {
      rateBuckets.delete(key)
    }
  }
}, 60_000)

// ──────────────────────────────────────────────────────────────────────────────
// CORS helpers
// ──────────────────────────────────────────────────────────────────────────────
function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>()

  // Always allow the app's own origin
  const appUrl = process.env.NEXTAUTH_URL
  if (appUrl) {
    try {
      origins.add(new URL(appUrl).origin)
    } catch {
      // invalid URL, skip
    }
  }

  // Allow additional origins from env
  const extra = process.env.ALLOWED_ORIGINS
  if (extra) {
    extra.split(",").forEach((o) => {
      const trimmed = o.trim()
      if (trimmed) origins.add(trimmed)
    })
  }

  // In development, allow localhost
  if (process.env.NODE_ENV === "development") {
    origins.add("http://localhost:3000")
    origins.add("http://127.0.0.1:3000")
  }

  return origins
}

// ──────────────────────────────────────────────────────────────────────────────
// Route-level role authorization
// ──────────────────────────────────────────────────────────────────────────────
const PROTECTED_ROUTE_ROLES: Record<string, string[]> = {
  "/admin": ["admin"],
  "/api/admin": ["admin"],
  "/api/audit-logs": ["admin"],
}

function getRequiredRoles(pathname: string): string[] | null {
  for (const [prefix, roles] of Object.entries(PROTECTED_ROUTE_ROLES)) {
    if (pathname.startsWith(prefix)) {
      return roles
    }
  }
  return null
}

// ──────────────────────────────────────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── API routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request)

    // Apply stricter rate limits to auth endpoints
    const isAuthEndpoint =
      pathname.startsWith("/api/auth/register") ||
      pathname.startsWith("/api/auth/callback")

    const { allowed, remaining } = isAuthEndpoint
      ? checkRateLimit(`auth:${ip}`, AUTH_RATE_LIMIT_MAX, AUTH_RATE_LIMIT_REFILL_RATE)
      : checkRateLimit(`api:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_REFILL_RATE)

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Remaining": "0",
          },
        },
      )
    }

    // CORS – restrict to allowed origins
    const origin = request.headers.get("origin") || ""
    const allowedOrigins = getAllowedOrigins()
    const isAllowedOrigin = allowedOrigins.has(origin)

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      const headers: Record<string, string> = {
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      }
      if (isAllowedOrigin) {
        headers["Access-Control-Allow-Origin"] = origin
      }
      return new Response(null, { status: 200, headers })
    }

    const response = NextResponse.next()

    // Set CORS headers for actual requests
    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin)
    }
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.set("X-RateLimit-Remaining", remaining.toString())

    return response
  }

  // ── All other routes — security headers ─────────────────────────────────
  const response = NextResponse.next()

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  )
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  )
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
