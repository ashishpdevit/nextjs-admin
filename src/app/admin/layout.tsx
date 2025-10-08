"use client"
import { Suspense, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/features/layout/Sidebar"
import Topbar from "@/features/layout/Topbar"
import { LoadingSpinner } from "@/components/LazyLoading"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { getAuthClient, getCurrentUser } from "@/lib/auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const authed = getAuthClient()
      const user = getCurrentUser()
      
      if (!authed || !user) {
        // Not authenticated, redirect to login
        setIsAuthenticated(false)
        setIsChecking(false)
        router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        return false
      }
      
      setIsAuthenticated(true)
      setIsChecking(false)
      return true
    }

    // Initial check
    const isAuthed = checkAuth()
    if (!isAuthed) return

    // Check auth when tab becomes visible (handles back button and tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth()
      }
    }

    // Check auth when window gains focus
    const handleFocus = () => {
      checkAuth()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    // Also check periodically but less frequently
    const interval = setInterval(checkAuth, 5000)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [router, pathname])

  // Show loading while checking authentication
  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner message="Verifying authentication..." />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-3 md:p-4 bg-main-background">
          {/* <div className="mx-auto w-full max-w-screen-2xl"> */}
          <div className="mx-auto w-full p-2">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
                {children}
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
