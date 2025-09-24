"use client"
import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { selectAdminsLoading } from "@/store/admin"
import { selectAppSettingsLoading } from "@/store/appSettings"
import { selectAppMenuLinksLoading } from "@/store/appMenuLinks"
import { selectContactLoading } from "@/store/contact"
import { selectFaqsLoading } from "@/store/faqs"

export default function GlobalLoader() {
  const admins = useAppSelector(selectAdminsLoading)
  const appSettings = useAppSelector(selectAppSettingsLoading)
  const appMenu = useAppSelector(selectAppMenuLinksLoading)
  const contact = useAppSelector(selectContactLoading)
  const faqs = useAppSelector(selectFaqsLoading)

  // Simple route-change indicator
  const pathname = usePathname()
  const [routeLoading, setRouteLoading] = useState(false)
  useEffect(() => {
    setRouteLoading(true)
    const t = setTimeout(() => setRouteLoading(false), 400)
    return () => clearTimeout(t)
  }, [pathname])

  const active = useMemo(() => admins || appSettings || appMenu || contact || faqs || routeLoading, [admins, appSettings, appMenu, contact, faqs, routeLoading])

  if (!active) return null

  return (
    <>
      {/* Progress bar aligned with admin header and content area */}
      <div className="fixed z-50 h-0.5 bg-primary/80 animate-pulse top-14 left-0 right-0 md:left-60 lg:left-64" />
    </>
  )
}

