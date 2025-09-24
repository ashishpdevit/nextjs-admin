import React from "react"

export function TableCard({
  title,
  right,
  children,
}: {
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="table-card">
      <div className="table-card-header">
        <div className="table-card-title">{title}</div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

