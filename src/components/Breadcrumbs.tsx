"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

function toTitle(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
}

export default function Breadcrumbs({ className = "" }: { className?: string }) {
  const pathname = usePathname()
  const [brand, setBrand] = useState("Admin")

  useEffect(() => {
    try {
      const b = localStorage.getItem("brand:name")
      if (b) setBrand(b)
    } catch {}
  }, [])

  const crumbs = useMemo(() => {
    if (!pathname) return [] as { href: string; label: string }[]
    const parts = pathname.split("?")[0].split("/").filter(Boolean)
    const items: { href: string; label: string }[] = []

    // Special mappings and injected parents
    const labelMap: Record<string, string> = {
      admin: brand,
      "app-settings": "App Settings",
      "app-menu-links": "App Menu Links",
      "contact-us": "Contact Us",
      "faqs": "FAQs",
    }
    const parentMap: Record<string, { href: string; label: string }> = {
      "app-settings": { href: "/admin/settings", label: "Settings" },
      "app-menu-links": { href: "/admin/settings", label: "Settings" },
    }

    let path = ""
    parts.forEach((seg, idx) => {
      path += `/${seg}`
      if (idx === 0 && seg === "admin") {
        items.push({ href: "/admin", label: labelMap[seg] || toTitle(seg) })
        return
      }
      // Inject parent for specific leaf segments
      if (idx === parts.length - 1 && parentMap[seg]) {
        items.push(parentMap[seg])
      }
      items.push({ href: path, label: labelMap[seg] || toTitle(seg) })
    })

    // Guest root gets no breadcrumbs
    if (pathname === "/" || parts.length === 0) return []
    return items
  }, [pathname, brand])

  if (crumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            {i > 0 && <span className="text-border">&gt;</span>}
            {i < crumbs.length - 1 ? (
              <Link href={c.href} className="hover:underline">{c.label}</Link>
            ) : (
              <span className="font-medium text-foreground">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

