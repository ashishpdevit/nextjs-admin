"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/admin/rbac/modules", label: "Modules" },
  { href: "/admin/rbac/permissions", label: "Permissions" },
  { href: "/admin/rbac/roles", label: "Roles" },
  { href: "/admin/rbac/assignments", label: "User assignments" },
]

export function RbacNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="RBAC sub-navigation">
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border-transparent bg-muted hover:bg-muted/80 text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
