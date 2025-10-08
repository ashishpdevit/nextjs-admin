"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { logout } from "@/lib/auth"

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState<string>("")
  const [role, setRole] = useState<string>("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user")
      if (stored) {
        const parsed = JSON.parse(stored) as { email?: string; role?: string; roleId?: string }
        if (parsed.email) setEmail(parsed.email)
        if (parsed.role) setRole(parsed.role)
        else if (parsed.roleId) setRole(parsed.roleId)
      }
    } catch {
      // ignore parsing errors
    }
  }, [])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener("click", onClick)
    return () => window.removeEventListener("click", onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((state) => !state)}
        className="inline-flex h-8 items-center gap-2 rounded-md border px-2 text-sm"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
          {email ? email[0]?.toUpperCase() : "U"}
        </span>
        <span className="hidden text-left text-muted-foreground md:inline">
          <span className="block max-w-[160px] truncate">{email || "User"}</span>
          {role && <span className="block text-[11px] uppercase tracking-wide text-muted-foreground/80">{role}</span>}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background p-2 shadow-md">
          <div className="mb-1 rounded-sm bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
            Signed in as
            <div className="font-medium text-foreground">{email || "User"}</div>
            {role && <div className="text-[11px] text-muted-foreground">Role: {role}</div>}
          </div>
          <Link
            href="/admin/profile"
            className="block rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Edit Profile
          </Link>
          <button
            className="mt-1 block w-full rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-muted"
            onClick={async () => {
              setOpen(false)
              await logout()
              window.location.href = "/login"
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
