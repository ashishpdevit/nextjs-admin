"use client"
import { useMemo } from "react"
import { useRBAC } from "@/hooks/use-rbac"

type PermissionGateProps = {
  allow: string | string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  loadingFallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({ allow, requireAll = false, fallback = null, loadingFallback = null, children }: PermissionGateProps) {
  const { loading, hasPermission } = useRBAC()

  const allowed = useMemo(() => {
    if (Array.isArray(allow)) {
      if (!allow.length) return true
      return requireAll ? allow.every((permission) => hasPermission(permission)) : allow.some((permission) => hasPermission(permission))
    }
    return hasPermission(allow)
  }, [allow, hasPermission, requireAll])

  if (loading && loadingFallback !== null) {
    return <>{loadingFallback}</>
  }

  if (!allowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
