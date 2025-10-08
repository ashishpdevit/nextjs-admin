"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import {
  LayoutDashboard,
  Users as UsersIcon,
  Package,
  ShoppingCart,
  Settings as SettingsIcon,
  Link2,
  Boxes,
  Key,
  ShieldPlus,
  UserPlus,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  UserCheck,
  ShieldCheck,
} from "lucide-react"
import { useRBAC } from "@/hooks/use-rbac"

type NavItem = {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Admins", icon: UsersIcon },
  { href: "/admin/customers", label: "Customers", icon: UserCheck },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: SettingsIcon,
    children: [
      { href: "/admin/app-settings", label: "App Settings", icon: SettingsIcon },
      { href: "/admin/app-menu-links", label: "App Menu Links", icon: Link2 },
    ],
  },
  { href: "/admin/contact-us", label: "Contact Us", icon: MessageCircle },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/rbac", label: "Role Manager", icon: ShieldCheck },
]

function filterNavItems(items: NavItem[], canAccess: (href: string) => boolean, ready: boolean): NavItem[] {
  if (!ready) return items
  return items
    .map((item) => {
      if (!item.href) return item
      if (item.children?.length) {
        console.log("=====>item",item)
        const visibleChildren = item.children.filter((child) => !child.href || canAccess(child.href))
        if (!visibleChildren.length && !canAccess(item.href)) {
          return null
        }
        return { ...item, children: visibleChildren }
      }
      return canAccess(item.href) ? item : null
    })
    .filter((item): item is NavItem => item !== null)
}

export default function Sidebar() {
  const pathname = usePathname()
  const [brand, setBrand] = useState("Company")
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [isReady, setIsReady] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const { canAccessRoute, loading, roleId, permissions, rolesCatalog } = useRBAC()
  
  // Load user and fetch permissions based on roleId
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const stored = localStorage.getItem("user")
        console.log("Sidebar: Loading user from localStorage:", stored)
        
        if (!stored) {
          console.warn("Sidebar: No user data found in localStorage")
          return
        }

        const user = JSON.parse(stored) as { permissions?: string[]; roleId?: string | number; role?: string; email?: string }
        console.log("Sidebar: Parsed user data:", user)
        console.log("=====>rolesCatalog",rolesCatalog)
        // If user has explicit permissions, use them
        // if (user.permissions && user.permissions.length > 0) {
        //   console.log("Sidebar: Setting permissions from user data:", user.permissions)
        //   setUserPermissions(user.permissions)
        //   setIsReady(true)
        //   return
        // }
        
        // Check if user is admin/super-admin directly from role
        if (user.role === "Admin" || user.role === "super-admin") {
          console.log("Sidebar: Admin role detected directly, granting full access")
          setUserPermissions(["*"])
          setIsReady(true)
          return
        }
        
        // Check if user has super-admin roleId (numeric ID 2 from backend)
        if (Number(user.roleId) === 2 || user.roleId === "2" || user.role === "Super Admin") {
          console.log("Sidebar: Super admin roleId detected, granting full access")
          setUserPermissions(["*"])
          setIsReady(true)
          return
        }
        
        // Otherwise, fetch permissions based on roleId
        const userRoleId = user.role || user.roleId 
        if (userRoleId) {
          console.log("Sidebar: Loading permissions for roleId:", userRoleId)
          
          // Try to load from RBAC mock data
          try {
            const rbacData = await import("@/mocks/rbac.json")
            const role = rbacData.roles.find((r: any) => r.id == userRoleId)
            console.log("=====>rbacData",rbacData.roles)
            console.log("=====>role",role)

            if (role) {
              console.log("Sidebar: Found role:", role)
              
              // Handle super-admin role specifically
              if (userRoleId === "super-admin" || userRoleId === "Admin" || Number(userRoleId) === 2 || userRoleId === "2") {
                console.log("Sidebar: Super admin detected, granting full access")
                setUserPermissions(["*"])
                setIsReady(true)
              } else if (role.permissions && role.permissions.length > 0) {
                console.log("Sidebar: Found role permissions:", role.permissions)
                setUserPermissions(role.permissions)
                setIsReady(true)
              } else {
                console.warn("Sidebar: Role found but no permissions, using default access")
                setUserPermissions(["dashboard:view"])
                setIsReady(true)
              }
            } else {
              console.warn("Sidebar: Role not found in RBAC data, using default access")
              setUserPermissions(["dashboard:view"])
              setIsReady(true)
            }
          } catch (error) {
            console.error("Sidebar: Failed to load RBAC data:", error)
            // Fallback: give basic dashboard access
            setUserPermissions(["dashboard:view"])
            setIsReady(true)
          }
        } else {
          console.warn("Sidebar: No roleId or role found in user data")
        }
      } catch (error) {
        console.error("Sidebar: Failed to load user permissions:", error)
      }
    }

    loadPermissions()
  }, [])
  
  // Update when RBAC loads from Redux (for dynamic permission updates)
  useEffect(() => {
    if (!loading && permissions.length > 0) {
      console.log("Sidebar: Updating permissions from RBAC hook:", permissions)
      setUserPermissions(permissions)
      setIsReady(true)
    } else if (!loading && roleId && rolesCatalog.length > 0) {
      // Try to get permissions from rolesCatalog
      console.log("=====>rolesCatalog",rolesCatalog, roleId)
      const role = rolesCatalog.find(r => r.id === Number(roleId))
      console.log("145-role",role)
      
      if (role) {
        // Handle super-admin role specifically
        if (roleId === "super-admin" || roleId === "Admin" || roleId === "2" || Number(roleId) === 2) {
          console.log("Sidebar: Super admin detected from rolesCatalog, granting full access")
          setUserPermissions(["*"])
          setIsReady(true)
        } else if (role.permissions && role.permissions.length > 0) {
          console.log("Sidebar: Updating permissions from rolesCatalog:", role.permissions)
          // Convert numeric permission IDs to permission keys (this would need permission catalog)
          // For now, just grant full access since we don't have the mapping here
          setUserPermissions(["*"])
          setIsReady(true)
        } else {
          console.warn("Sidebar: Role found in rolesCatalog but no permissions, using default")
          setUserPermissions(["dashboard:view"])
          setIsReady(true)
        }
      }
    }
  }, [loading, permissions, roleId, rolesCatalog])
  
  // Show all menu items if user has super admin permissions (*), otherwise filter
  const nav = useMemo(() => {
    console.log("Sidebar: Computing nav items. isReady:", isReady, "userPermissions:", userPermissions, "loading:", loading, "roleId:", roleId)
    
    if (!isReady) {
      console.log("Sidebar: Not ready yet, returning empty nav")
      return []
    }
    
    if (userPermissions.includes("*")) {
      console.log("Sidebar: User has wildcard permission, showing all", NAV_ITEMS.length, "menu items")
      return NAV_ITEMS
    }
    
    console.log("Sidebar: Filtering nav items based on permissions")
    const filtered = filterNavItems(NAV_ITEMS, canAccessRoute, !loading && !!roleId)
    console.log("Sidebar: Filtered nav items:", filtered.length, "items")
    return filtered
  }, [canAccessRoute, loading, roleId, userPermissions, isReady])

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem("brand:name")
      if (stored) setBrand(stored)
    }
    load()
    window.addEventListener("storage", load)
    return () => window.removeEventListener("storage", load)
  }, [])

  useEffect(() => {
    const next: Record<string, boolean> = {}
    nav.forEach((item) => {
      if (item.children?.some((child) => child.href && pathname.startsWith(child.href))) {
        next[item.label] = true
      }
    })
    setOpen((prev) => ({ ...prev, ...next }))
  }, [pathname, nav])

  return (
    <aside className="hidden sticky top-0 h-screen border-r bg-sidebar md:block md:w-60 lg:w-64">
      <div className="flex h-14 items-center justify-start gap-2 border-b px-3">
        <img src="/logo.svg" alt="Logo" className="h-6 w-6 rounded bg-muted p-1" />
        <span className="text-base font-semibold tracking-tight">{brand}</span>
      </div>
      <div className="p-3">
        {!isReady ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-full animate-pulse rounded-md bg-muted/50" />
            ))}
          </div>
        ) : (
          <nav className="space-y-0.5">
            {nav.map((item) => {
            const Icon = item.icon
            const hasChildren = !!item.children?.length
            if (!hasChildren) {
              const active = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "hover:bg-muted text-sidebar-foreground",
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              )
            }

            const opened = !!open[item.label]
            const activeParent = pathname.startsWith(item.href || "")
            return (
              <div key={item.label}>
                <button
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                    activeParent && "text-sidebar-foreground",
                  )}
                  onClick={() => setOpen((prev) => ({ ...prev, [item.label]: !prev[item.label] }))}
                >
                  <span className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.href ? (
                      <Link href={item.href} className="hover:underline">
                        {item.label}
                      </Link>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", opened ? "rotate-180" : "rotate-0")} />
                </button>
                {opened && item.children && (
                  <div className="mt-0.5 space-y-0.5 pl-7">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon
                      const activeChild = pathname === child.href
                      return (
                        <Link
                          key={child.href || child.label}
                          href={child.href || "#"}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
                            activeChild
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                              : "hover:bg-muted text-sidebar-foreground",
                          )}
                        >
                          {ChildIcon && <ChildIcon className="h-4 w-4" />}
                          <span>{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          </nav>
        )}
      </div>
    </aside>
  )
}
