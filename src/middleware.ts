import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

type StoredUser = {
  email: string
  roleId?: string | number
  role?: string
  permissions?: string[]
}

/**
 * Parse the user cookie — stored as URL-encoded JSON by setAuth() in lib/auth.ts
 */
function parseUserCookie(cookieValue?: string): StoredUser | null {
  if (!cookieValue) return null
  try {
    const decoded = decodeURIComponent(cookieValue)
    const parsed = JSON.parse(decoded)
    if (parsed && typeof parsed === "object" && parsed.email) {
      return parsed as StoredUser
    }
    return null
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/")
  const isGuestRoute = ["/login", "/signup", "/forgot"].includes(pathname)

  // Only act on admin or guest routes
  if (!isAdminRoute && !isGuestRoute) {
    return NextResponse.next()
  }

  const authCookie = req.cookies.get("auth")?.value
  const userCookie = req.cookies.get("user")?.value

  const isAuthed = authCookie === "1"
  const user = parseUserCookie(userCookie)
  const isLoggedIn = isAuthed && user !== null

  // Protect all admin routes — redirect unauthenticated users to /login
  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect already-logged-in users away from login/signup/forgot
  if (isGuestRoute && isLoggedIn) {
    const adminUrl = req.nextUrl.clone()
    adminUrl.pathname = "/admin"
    adminUrl.searchParams.delete("next")
    return NextResponse.redirect(adminUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/login", "/signup", "/forgot"],
}
