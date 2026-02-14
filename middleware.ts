import { NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "./lib/supabase/middleware"

// Routes that never require authentication
const publicPaths = [
  "/login",
  "/auth",
  "/api/health",
  "/forgot-password",
  "/reset-password",
]

function isPublicPath(pathname: string) {
  // Exact match or starts with (for nested routes)
  return publicPaths.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Create response with headers for session management
  const response = NextResponse.next({ request: { headers: req.headers } })
  const supabase = createSupabaseMiddlewareClient(req, response)

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (process.env.DEBUG_AUTH === "true") {
    console.log("[middleware]", pathname, "session:", Boolean(session), "error:", error?.message)
  }

  // No session -> authentication required
  if (!session) {
    // For API routes (except /api/health which is already excluded), return 401
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }
    
    // For pages, redirect to /login with original path as redirect target
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user trying to access /login -> redirect to home or redirect target
  if (pathname === "/login") {
    const redirectTarget = req.nextUrl.searchParams.get("redirect") || "/"
    return NextResponse.redirect(new URL(redirectTarget, req.url))
  }

  return response
}

export const config = {
  // Run middleware on all routes except static files and Next.js internals
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Static assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)",
  ],
}