"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const [brand, setBrand] = useState("")
  const [primary, setPrimary] = useState("#4f46e5")
  const [radius, setRadius] = useState(8)

  useEffect(() => {
    const b = localStorage.getItem("brand:name")
    if (b) setBrand(b)
    const p = localStorage.getItem("theme:primary")
    if (p) setPrimary(p)
    const r = localStorage.getItem("theme:radius")
    if (r) setRadius(Number(r))
  }, [])

  const applyTheme = () => {
    localStorage.setItem("brand:name", brand || "Admin Panel")
    localStorage.setItem("theme:primary", primary)
    localStorage.setItem("theme:radius", String(radius))

    const root = document.documentElement
    root.style.setProperty("--primary", primary)
    // best-effort foreground
    root.style.setProperty("--primary-foreground", "white")
    root.style.setProperty("--radius", `${radius / 16}rem`)
  }

  return (
    <div className="grid gap-3 md:max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Brand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-1.5">
            <Label htmlFor="brand">Project name</Label>
            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Admin Panel" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="primary">Primary color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="primary"
                  type="color"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-md border bg-background p-1"
                />
                <Input value={primary} onChange={(e) => setPrimary(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="radius">Radius</Label>
              <input
                id="radius"
                type="range"
                min={0}
                max={16}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={applyTheme}>Save & Apply</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

