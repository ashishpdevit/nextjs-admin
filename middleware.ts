import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { matchRoutePermission } from "@/lib/rbac"
import rbacDefaults from "@/mocks/rbac.json"

type StoredUser = {
  email: string
  roleId?: string
  role?: string
  permissions?: string[]
}

type RoleDefaults = {
  id: string
  permissions: string[]
}

const ROLE_PERMISSION_INDEX = new Map<string, string[]>(
  (rbacDefaults.roles as RoleDefaults[]).map((role) => [role.id, [...role.permissions]]),
)

function parseUserCookie(cookieValue?: string): StoredUser | null {
  if (!cookieValue) return null
  try {
    return JSON.parse(decodeURIComponent(cookieValue)) as StoredUser
  } catch {
    return null
  }
}

function resolvePermissions(user: StoredUser | null): string[] {
  if (!user) return []
  if (user.permissions?.includes("*")) return ["*"]
  if (user.permissions?.length) return [...user.permissions]
  if (user.roleId) {
    const preset = ROLE_PERMISSION_INDEX.get(user.roleId)
    if (preset) return [...preset]
  }
  return []
}

function hasPermission(permissions: string[], permission?: string): boolean {
  if (!permission) return permissions.includes("*") || permissions.length > 0
  if (permissions.includes("*")) return true
  return permissions.includes(permission)
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authed = req.cookies.get("auth")?.value === "1"
  const user = parseUserCookie(req.cookies.get("user")?.value)

  const permissions = resolvePermissions(user)
  const isAdminRoute = pathname.startsWith("/admin")
  const isGuestAuth = ["/login", "/signup", "/forgot"].includes(pathname)
  const requiredPermission = matchRoutePermission(pathname)

  if (isAdminRoute) {
    const authorized = authed && hasPermission(permissions, requiredPermission)
    if (!authorized) {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  if (isGuestAuth && authed && hasPermission(permissions, "dashboard:view")) {
    const url = req.nextUrl.clone()
    url.pathname = "/admin"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/signup", "/forgot"],
}
