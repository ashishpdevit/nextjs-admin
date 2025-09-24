"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { logout } from "@/lib/auth"

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState<string>("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const u = localStorage.getItem("user")
      if (u) setEmail(JSON.parse(u).email ?? "")
    } catch {}
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("click", onClick)
    return () => window.removeEventListener("click", onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-8 items-center gap-2 rounded-md border px-2 text-sm"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
          {email ? email[0]?.toUpperCase() : "U"}
        </span>
        <span className="hidden md:inline text-muted-foreground max-w-[160px] truncate">{email || "User"}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-md border bg-background p-1 shadow-md">
          <Link href="/admin/profile" className="block rounded-sm px-2 py-1.5 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
            Edit Profile
          </Link>
          <button
            className="block w-full rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-muted"
            onClick={() => {
              setOpen(false)
              logout()
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

