import { NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

// Routes that never require authentication
const publicRoutes = ["/login", "/auth", "/api/auth", "/_next"]

function isPublic(pathname: string) {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}`))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Early allow for public routes
  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  const response = NextResponse.next({ request: { headers: req.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          response.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: CookieOptions) => {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 })
        },
      },
    },
  )

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (process.env.DEBUG_AUTH === "true") {
    console.log("[middleware] session", Boolean(session), error?.message)
  }

  // No session -> redirect to login with redirect target
  if (!session) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("redirect", pathname || "/")
    return NextResponse.redirect(loginUrl)
  }

  // Already logged-in and trying to access login page -> forward to redirect target/home (defensive)
  if (pathname.startsWith("/login")) {
    const redirectTarget = req.nextUrl.searchParams.get("redirect") || "/"
    return NextResponse.redirect(new URL(redirectTarget, req.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
