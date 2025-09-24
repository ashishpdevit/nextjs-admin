import { Suspense } from "react"
import Sidebar from "@/features/layout/Sidebar"
import Topbar from "@/features/layout/Topbar"
import { LoadingSpinner } from "@/components/LazyLoading"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-3 md:p-4">
          <div className="mx-auto w-full max-w-screen-2xl">
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
