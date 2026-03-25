﻿import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { matchRoutePermission } from "@/lib/rbac"
import rbacDefaults from "@/mocks/rbac.json"
import { jwtVerify } from "jose"

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

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-me-admin-jwt-secret-change-me"
)

const ROLE_PERMISSION_INDEX = new Map<string, string[]>(
  (rbacDefaults.roles as RoleDefaults[]).map((role) => [role.id, [...role.permissions]]),
)

async function parseUserToken(tokenValue?: string): Promise<StoredUser | null> {
  if (!tokenValue) return null
  try {
    const { payload } = await jwtVerify(tokenValue, JWT_SECRET)
    return payload as unknown as StoredUser
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authed = req.cookies.get("auth")?.value === "1"
  const user = await parseUserToken(req.cookies.get("user")?.value)

  const permissions = resolvePermissions(user)
  const isAdminRoute = pathname.startsWith("/admin")
  const isGuestAuth = ["/login", "/signup", "/forgot"].includes(pathname)
  const requiredPermission = matchRoutePermission(pathname)

  // Protect admin routes - redirect to login if not authenticated
  if (isAdminRoute) {
    if (!authed || !user) {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
    
    const authorized = hasPermission(permissions, requiredPermission)
    if (!authorized) {
      const url = req.nextUrl.clone()
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from guest pages
  if (isGuestAuth && authed && user) {
    const url = req.nextUrl.clone()
    url.pathname = "/admin"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/signup", "/forgot"],
}
