"use client"
import React from "react"

export default function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-start justify-between">
      <div>
        <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

