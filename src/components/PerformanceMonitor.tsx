"use client"
import { useEffect, useState } from "react"

interface PerformanceMetrics {
  loadTime: number
  componentCount: number
  bundleSize: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart
      
      // Count dynamically loaded components
      const componentCount = document.querySelectorAll('[data-lazy-component]').length
      
      // Estimate bundle size (this is a simplified calculation)
      const bundleSize = performance.getEntriesByType("resource")
        .filter((entry: any) => entry.name.includes('.js'))
        .reduce((total: number, entry: any) => total + (entry.transferSize || 0), 0)

      setMetrics({
        loadTime,
        componentCount,
        bundleSize: Math.round(bundleSize / 1024) // Convert to KB
      })
    }

    // Measure after page load
    if (document.readyState === "complete") {
      measurePerformance()
    } else {
      window.addEventListener("load", measurePerformance)
    }

    return () => {
      window.removeEventListener("load", measurePerformance)
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== "development" || !metrics) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-background border p-3 text-xs text-muted-foreground shadow-lg">
      <div className="font-medium mb-1">Performance</div>
      <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
      <div>Components: {metrics.componentCount}</div>
      <div>Bundle: {metrics.bundleSize}KB</div>
    </div>
  )
}

