"use client"
import { Suspense, lazy } from "react"
import { LoadingSpinner } from "@/components/LazyLoading"

// Lazy load all admin pages
const LazyFaqsPage = lazy(() => import("@/app/admin/faqs/page"))
const LazyProductsPage = lazy(() => import("@/app/admin/products/page"))
const LazyUsersPage = lazy(() => import("@/app/admin/users/page"))
const LazyOrdersPage = lazy(() => import("@/app/admin/orders/page"))
const LazyAppSettingsPage = lazy(() => import("@/app/admin/app-settings/page"))
const LazyAppMenuLinksPage = lazy(() => import("@/app/admin/app-menu-links/page"))
const LazyContactUsPage = lazy(() => import("@/app/admin/contact-us/page"))
const LazyProfilePage = lazy(() => import("@/app/admin/profile/page"))
const LazySettingsPage = lazy(() => import("@/app/admin/settings/page"))

// Page mapping for dynamic loading
const pageComponents = {
  faqs: LazyFaqsPage,
  products: LazyProductsPage,
  users: LazyUsersPage,
  orders: LazyOrdersPage,
  "app-settings": LazyAppSettingsPage,
  "app-menu-links": LazyAppMenuLinksPage,
  "contact-us": LazyContactUsPage,
  profile: LazyProfilePage,
  settings: LazySettingsPage,
}

interface DynamicPageLoaderProps {
  pageName: keyof typeof pageComponents
}

export default function DynamicPageLoader({ pageName }: DynamicPageLoaderProps) {
  const PageComponent = pageComponents[pageName]

  if (!PageComponent) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground">The requested page could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<LoadingSpinner message={`Loading ${pageName.replace('-', ' ')}...`} />}>
      <PageComponent />
    </Suspense>
  )
}
