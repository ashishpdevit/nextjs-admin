"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { User, Mail, Shield, Key, Camera, Loader2, Check } from "lucide-react"

export default function ProfilePage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    try {
      const u = localStorage.getItem("user")
      if (u) {
        const parsed = JSON.parse(u)
        setEmail(parsed.email ?? "")
        setName(parsed.name ?? "")
      }
    } catch {}
    setIsMounted(true)
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 600))
    
    try {
      localStorage.setItem("user", JSON.stringify({ email, name }))
      toast.success("Profile saved successfully")
    } catch (error) {
      toast.error("Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isMounted) return null

  // Get initials for avatar
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD'

  return (
    <div className="max-w-3xl max-w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative mb-4 group cursor-pointer">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-background shadow-sm overflow-hidden">
                  <span className="text-2xl font-semibold text-primary">{initials}</span>
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="h-6 w-6" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">{name || "Admin User"}</h3>
              <p className="text-sm text-muted-foreground break-all">{email || "admin@example.com"}</p>
              
              <div className="w-full mt-6 pt-6 border-t flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Shield className="h-4 w-4" /> Role</span>
                  <span className="font-medium bg-secondary px-2 py-0.5 rounded-full text-xs">Super Admin</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profile-form" onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      className="pl-9 h-10" 
                      placeholder="Jane Doe" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      className="pl-9 h-10" 
                      placeholder="jane@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Changes will be saved locally.</p>
              <Button type="submit" form="profile-form" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Security Preferences</CardTitle>
              <CardDescription>Manage your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <Key className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Change Password</p>
                    <p className="text-xs text-muted-foreground">You can reset your password anytime.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" type="button" onClick={() => toast.info("Password reset link sent to your email!")}>
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
