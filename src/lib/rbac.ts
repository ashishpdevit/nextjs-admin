import type { Permission, Role } from "@/features/rbac/rbacTypes"

type MaybeRole = Role | null | undefined

type RouteGuard = {
  path: string
  permission: string
  exact?: boolean
}

export const DEFAULT_ROUTE_GUARDS: RouteGuard[] = [
  { path: "/admin", permission: "dashboard:view", exact: true },
  { path: "/admin/users", permission: "users:view" },
  { path: "/admin/customers", permission: "customers:view" },
  { path: "/admin/orders", permission: "orders:view" },
  { path: "/admin/products", permission: "products:view" },
  { path: "/admin/app-settings", permission: "settings:view", exact: true },
  { path: "/admin/settings", permission: "settings:view" },
  { path: "/admin/app-menu-links", permission: "settings:view", exact: true },
  { path: "/admin/contact-us", permission: "customers:view", exact: true },
  { path: "/admin/faqs", permission: "faqs:view" },
  { path: "/admin/rbac/modules", permission: "rbac:view", exact: true },
  { path: "/admin/rbac/permissions", permission: "rbac:view", exact: true },
  { path: "/admin/rbac/roles", permission: "rbac:view", exact: true },
  { path: "/admin/rbac/assignments", permission: "rbac:view", exact: true },
  { path: "/admin/rbac", permission: "rbac:view" },
]

export function resolveEffectivePermissions(role: MaybeRole, allPermissions: Permission[]): string[] {
  if (!role) return []
  if (role.permissions.includes("*")) {
    return allPermissions.map((permission) => permission.id)
  }
  return role.permissions
}

export function hasPermission(role: MaybeRole, permission: string): boolean {
  if (!role) return false
  if (role.permissions.includes("*")) return true
  return role.permissions.includes(permission)
}

export function matchRoutePermission(pathname: string, guards: RouteGuard[] = DEFAULT_ROUTE_GUARDS): string | undefined {
  for (const guard of guards) {
    if (guard.exact) {
      if (pathname === guard.path) return guard.permission
      continue
    }
    if (pathname === guard.path || pathname.startsWith(`${guard.path}/`)) {
      return guard.permission
    }
  }
  return undefined
}

export function isRouteAllowed(
  pathname: string,
  role: MaybeRole,
  allPermissions: Permission[],
  guards: RouteGuard[] = DEFAULT_ROUTE_GUARDS,
): boolean {
  const permission = matchRoutePermission(pathname, guards)
  if (!permission) return true
  return hasPermission(role, permission) || resolveEffectivePermissions(role, allPermissions).includes(permission)
}
