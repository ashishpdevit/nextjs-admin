import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authed = req.cookies.get("auth")?.value === "1"
  const userCookie = req.cookies.get("user")?.value

  const isAdmin = pathname.startsWith("/admin")
  const isGuestAuth = ["/login", "/signup", "/forgot"].includes(pathname)

  // Check if user has valid admin role
  let isAdminUser = false
  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie))
      isAdminUser = user.role === "admin"
    } catch {
      // Invalid user cookie
    }
  }

  if (isAdmin && (!authed || !isAdminUser)) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (isGuestAuth && authed && isAdminUser) {
    const url = req.nextUrl.clone()
    url.pathname = "/admin"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/signup", "/forgot"],
}

