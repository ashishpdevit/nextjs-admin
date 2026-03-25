"use client"
import { Suspense, ComponentType } from "react"
import dynamic from "next/dynamic"
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
export const LazyFaqsTable = dynamic(() => import("@/components/modules/faqs/FaqsTable"), {
  loading: () => <LoadingSpinner message="Loading Table..." />
})
export const LazyCreateFaqDialog = dynamic(() => import("@/components/modules/faqs/CreateFaqDialog"), {
  loading: () => <LoadingSpinner />
})
export const LazyEditFaqDialog = dynamic(() => import("@/components/modules/faqs/EditFaqDialog"), {
  loading: () => <LoadingSpinner />
})
export const LazyTableCard = dynamic(() => import("@/components/admin/table-card").then(mod => mod.TableCard), {
  loading: () => <LoadingSpinner />
})
export const LazyFiltersBar = dynamic(() => import("@/components/admin/filters").then(mod => mod.FiltersBar), {
  loading: () => <LoadingSpinner />
})
