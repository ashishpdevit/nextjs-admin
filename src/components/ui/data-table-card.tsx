"use client"

import React from "react"
import { DataTable, DataTableProps, ColumnDef } from "./data-table"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"

export interface DataTableCardProps<T> extends DataTableProps<T> {
  title: string
  subtitle?: string
  headerActions?: React.ReactNode
  className?: string
  cardClassName?: string
}

export function DataTableCard<T extends Record<string, any>>({
  title,
  subtitle,
  headerActions,
  className,
  cardClassName,
  ...tableProps
}: DataTableCardProps<T>) {
  return (
    <Card className={cn("table-card", cardClassName)}>
      <CardHeader className="table-card-header">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="table-card-title">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <DataTable {...tableProps} className={className} />
        </div>
      </CardContent>
    </Card>
  )
}

// Re-export everything from data-table for convenience
export * from "./data-table"
export {
  createTextColumn,
  createNumberColumn,
  createBadgeColumn,
  createStatusColumn,
  createCustomColumn,
} from "./data-table"
