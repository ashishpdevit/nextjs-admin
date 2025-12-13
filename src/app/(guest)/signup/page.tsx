"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getAuthClient, loginWithAPI } from "@/lib/auth"
import AuthCard from "@/components/auth/auth-card"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getAuthClient()) router.replace("/admin")
  }, [router])

  const handleSignup = async () => {
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Use the same API login function as login page
      // In a real app, you'd have a separate signup API endpoint
      const result = await loginWithAPI(email, password)
      
      if (result.success) {
        // Use window.location for full page reload to ensure all state is refreshed
        window.location.href = "/admin"
      } else {
        setError(result.message || "Signup failed. Please try again.")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Enter your details to create a new account."
      footer={<>
        Already have an account? <Link className="hover:underline" href="/login">Log in</Link>
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
        <div className="grid gap-2">
          <Label htmlFor="confirm" className="text-sm font-medium">Confirm Password</Label>
          <Input 
            id="confirm" 
            type="password" 
            value={confirm} 
            onChange={(e) => setConfirm(e.target.value)} 
            className="h-11"
            placeholder="Confirm Password"
          />
        </div>
        <Button
          onClick={handleSignup}
          disabled={loading}
          className="h-11 text-base"
        >
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </div>
    </AuthCard>
  )
}
