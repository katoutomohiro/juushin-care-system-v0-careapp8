import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Public routes that don't require authentication
const publicRoutes = ['/login', '/auth/callback', '/reset-password']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get token from Authorization header or cookies
  let token = null
  
  // Try to get token from Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  }

  // If no token in header, try cookies (for browser requests)
  if (!token) {
    const cookieValue = req.cookies.get('sb-access-token')?.value
    token = cookieValue
  }

  if (!token) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Create Supabase client to verify token
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Verify token validity
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    // Invalid token - redirect to login
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
