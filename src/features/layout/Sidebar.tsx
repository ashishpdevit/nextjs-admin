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
  const { canAccessRoute, loading, roleId } = useRBAC()
  const nav = useMemo(() => filterNavItems(NAV_ITEMS, canAccessRoute, !loading && !!roleId), [canAccessRoute, loading, roleId])

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
      </div>
    </aside>
  )
}
