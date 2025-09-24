"use client"
import { Suspense, lazy, ComponentType } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Loading component for suspense fallback
export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Generic lazy loading wrapper
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  fallbackMessage?: string
) {
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={<LoadingSpinner message={fallbackMessage} />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

// Lazy load heavy admin components
export const LazyFaqsTable = lazy(() => import("@/components/modules/faqs/FaqsTable"))
export const LazyCreateFaqDialog = lazy(() => import("@/components/modules/faqs/CreateFaqDialog"))
export const LazyEditFaqDialog = lazy(() => import("@/components/modules/faqs/EditFaqDialog"))
export const LazyTableCard = lazy(() => import("@/components/admin/table-card").then(module => ({ default: module.TableCard })))
export const LazyFiltersBar = lazy(() => import("@/components/admin/filters").then(module => ({ default: module.FiltersBar })))

// Lazy load admin pages
export const LazyFaqsPage = lazy(() => import("@/app/admin/faqs/page"))
export const LazyProductsPage = lazy(() => import("@/app/admin/products/page"))
export const LazyUsersPage = lazy(() => import("@/app/admin/users/page"))
export const LazyOrdersPage = lazy(() => import("@/app/admin/orders/page"))
export const LazyAppSettingsPage = lazy(() => import("@/app/admin/app-settings/page"))
export const LazyAppMenuLinksPage = lazy(() => import("@/app/admin/app-menu-links/page"))
export const LazyContactUsPage = lazy(() => import("@/app/admin/contact-us/page"))
export const LazyProfilePage = lazy(() => import("@/app/admin/profile/page"))
export const LazySettingsPage = lazy(() => import("@/app/admin/settings/page"))

