"use client"
import React from "react"
import Link from "next/link"

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 rounded bg-muted p-1" />
          <span className="text-lg font-semibold tracking-tight">Company</span>
        </div>
        <h1 className="text-3xl font-semibold mb-3">{title}</h1>
        {subtitle && <p className="text-base text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        {children}
      </div>
      {footer && (
        <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>
      )}
      {/* <div className="mt-10 text-center text-xs text-muted-foreground">
        <Link href="/legal/privacy" className="hover:underline">Privacy Policy</Link>
        <span className="mx-2 text-border">|</span>
        <Link href="/legal/terms" className="hover:underline">Terms & Conditions</Link>
      </div> */}
    </div>
  )}

