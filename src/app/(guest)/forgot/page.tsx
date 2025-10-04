"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getAuthClient } from "@/lib/auth"
import Link from "next/link"
import AuthCard from "@/components/auth/auth-card"
import { axios } from "@/lib/axios"

export default function ForgotPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (getAuthClient()) router.replace("/admin")
  }, [router])

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await axios.post('/admin/auth/forgot-password', { email })
      
      if (response.data.success) {
        setMessage(response.data.message)
      } else {
        setError(response.data.message || "Failed to send reset email")
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email. We'll send you a reset link (demo)."
      footer={<>
        Remembered? <Link href="/login" className="hover:underline">Back to login</Link>
      </>}
    >
      <div className="grid gap-6">
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-700 dark:text-green-400">
            {message}
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
            placeholder="Enter your email address"
          />
        </div>
        <Button 
          onClick={handleForgotPassword}
          disabled={loading}
          className="h-11 text-base"
        >
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </div>
    </AuthCard>
  )
}

