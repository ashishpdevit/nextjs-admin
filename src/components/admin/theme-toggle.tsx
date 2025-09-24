"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("theme")
    const isDark = stored ? stored === "dark" : false
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  if (!mounted) return null

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => {
        const next = !dark
        setDark(next)
        localStorage.setItem("theme", next ? "dark" : "light")
        document.documentElement.classList.toggle("dark", next)
      }}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  )
}

