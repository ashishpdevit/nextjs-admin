"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getAuthClient, login, loginWithAPI } from "@/lib/auth"
import AuthCard from "@/components/auth/auth-card"

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("admin@yopmail.com")
  const [password, setPassword] = useState("AdminPass123!")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getAuthClient()) router.replace("/admin")
  }, [router])

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setLoading(true)
    setError("")

    try {
      // For development, use local validation
      // In production, switch to loginWithAPI(email, password)
      // const result = login(email, password)
      const result = await loginWithAPI(email, password)
      
      if (result.success) {
        const next = params.get("next") || "/admin"
        //set auth token in local storage
        console.log(result)
        localStorage.setItem("auth_token", result.data.token || "")
        // router.replace(next)
      } else {
        setError(result.message || "Login failed")
      }
      if (result.success) {
        const next = params.get("next") || "/admin"
        router.replace(next)
      } else {
        setError(result.message || "Login failed")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Log in"
      subtitle="Enter any email / password for demo access."
      footer={<>
        Don't have an account? <Link className="hover:underline" href="/signup">Sign up</Link>
      </>}
    >
      <div className="grid gap-6">
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="h-11"
            placeholder="Email"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="h-11"
            placeholder="Password"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <Link className="text-muted-foreground hover:underline" href="/forgot">Forgot password?</Link>
        </div>
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="h-11 text-base"
        >
          {loading ? "Signing in..." : "Continue"}
        </Button>
      </div>
    </AuthCard>
  )
}

