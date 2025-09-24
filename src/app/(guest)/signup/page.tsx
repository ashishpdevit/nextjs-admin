"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getAuthClient, login } from "@/lib/auth"
import AuthCard from "@/components/auth/auth-card"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  useEffect(() => {
    if (getAuthClient()) router.replace("/admin")
  }, [router])

  return (
    <AuthCard
      title="Create account"
      subtitle="This is a demo sign up. Any email works."
      footer={<>
        Already have an account? <Link className="hover:underline" href="/login">Log in</Link>
      </>}
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm" className="text-sm font-medium">Confirm Password</Label>
          <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11" />
        </div>
        <Button
          onClick={async () => {
            if (!email || !password || password !== confirm) {
              alert("Please enter a valid email and matching passwords.")
              return
            }
            
            try {
              // For demo purposes, only allow admin credentials
              if (email === "admin@yopmail.com" && password === "Admin@123") {
                const result = login(email, password)
                if (result.success) {
                  router.replace("/admin")
                } else {
                  alert(result.message || "Signup failed")
                }
              } else {
                alert("For demo purposes, please use admin@yopmail.com / Admin@123")
              }
            } catch (error) {
              alert("An unexpected error occurred. Please try again.")
            }
          }}
          className="h-11 text-base"
        >
          Sign up
        </Button>
      </div>
    </AuthCard>
  )
}
