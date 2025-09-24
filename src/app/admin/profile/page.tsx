"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    try {
      const u = localStorage.getItem("user")
      if (u) {
        const parsed = JSON.parse(u)
        setEmail(parsed.email ?? "")
        setName(parsed.name ?? "")
      }
    } catch {}
  }, [])

  return (
    <div className="grid gap-3 md:max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                try {
                  localStorage.setItem("user", JSON.stringify({ email, name }))
                  alert("Profile saved")
                } catch {}
              }}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

