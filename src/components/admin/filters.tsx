"use client"
import React from "react"

// Filters layout guidance:
// - First child renders on the left (e.g., "Show 10").
// - Second child renders on the right end (e.g., Search input).
// - Any additional children render on a new row below them.
export function FiltersBar<T extends Record<string, any>>({
  className,
  children,
}: {
  id?: string
  values?: T
  onLoadPreset?: (values: T) => void
  className?: string
  children: React.ReactNode
}) {
  const all = React.Children.toArray(children)
  const right: React.ReactNode[] = []
  const extras: React.ReactNode[] = []
  let left: React.ReactNode | null = null

  all.forEach((child, idx) => {
    if (!React.isValidElement(child)) {
      if (left === null) left = child
      else extras.push(child)
      return
    }
    const isRight = (child.props as any)["data-right"]
    const isBelow = (child.props as any)["data-below"]
    if (isRight) { right.push(child); return }
    if (isBelow) { extras.push(child); return }
    if (left === null) left = child
    else extras.push(child)
  })

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <div className="shrink-0">{left}</div>
        <div className="ml-auto flex items-center gap-2">{right}</div>
      </div>
      {extras.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">{extras}</div>
      )}
    </div>
  )
}
