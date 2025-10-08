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
  
  // Handle super-admin with empty permissions array (full access)
  if (role.permissions.length === 0 && (role.key === "super-admin" || role.name === "Super Admin")) {
    return allPermissions.map((permission) => permission.key)
  }
  
  // Handle wildcard permission (legacy support)
  if (role.permissions.includes("*" as any)) {
    return allPermissions.map((permission) => permission.key)
  }
  
  // Map numeric permission IDs to permission keys
  return role.permissions
    .map(permissionId => allPermissions.find(p => p.id === permissionId))
    .filter(Boolean)
    .map(permission => permission!.key)
}

export function hasPermission(role: MaybeRole, permission: string, allPermissions: Permission[] = []): boolean {
  if (!role) return false
  
  // Handle super-admin with empty permissions array (full access)
  if (role.permissions.length === 0 && (role.key === "super-admin" || role.name === "Super Admin")) {
    return true
  }
  
  if (role.permissions.includes("*" as any)) return true
  
  // Check if permission exists in the role's permission IDs
  const permissionObj = allPermissions.find(p => p.key === permission)
  if (permissionObj) {
    return role.permissions.includes(permissionObj.id)
  }
  
  return false
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
  return hasPermission(role, permission, allPermissions) || resolveEffectivePermissions(role, allPermissions).includes(permission)
}
