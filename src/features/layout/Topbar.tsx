"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import ThemeToggle from "@/components/admin/theme-toggle"
import { Menu } from "lucide-react"
import ProfileMenu from "@/features/layout/ProfileMenu"
import Breadcrumbs from "@/components/Breadcrumbs"

function toTitle(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
}

export default function Topbar() {
  const pathname = usePathname()

  return (
    <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-3 bg-background">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border"
          aria-label="Open menu"
          onClick={() => {}}
        >
          <Menu size={18} />
        </button>
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-2">
        <Input placeholder="Search..." className="h-8 w-44 md:w-72" />
        <Link href="/" className="text-sm text-muted-foreground hover:underline">View site</Link>
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </div>
  )
}
