"use client"

import React, { useState, useMemo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { Checkbox } from "./checkbox"
import { Button } from "./button"
import { Pagination } from "./pagination"
import { Badge } from "./badge"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type SortDirection = "asc" | "desc"

export interface ColumnDef<T> {
  id: string
  header: string | React.ReactNode
  accessorKey?: keyof T
  accessorFn?: (row: T) => any
  cell?: (info: { row: T; value: any; index: number }) => React.ReactNode
  sortable?: boolean
  width?: string
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  keyField?: keyof T
  sortable?: boolean
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  onSortChange?: (sortKey: string, direction: SortDirection) => void
  onSelectionChange?: (selectedIds: (string | number)[]) => void
  onRowClick?: (row: T) => void
  className?: string
  emptyMessage?: string
  loading?: boolean
  actions?: {
    label?: string
    items: Array<{
      label: string
      icon?: React.ReactNode
      onClick: (row: T) => void
      variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
      disabled?: (row: T) => boolean
      hidden?: (row: T) => boolean
    }>
  }
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField = "id",
  sortable = true,
  selectable = false,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  onPageSizeChange,
  onSortChange,
  onSelectionChange,
  onRowClick,
  className,
  emptyMessage = "No data available",
  loading = false,
  actions,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([])

  // Handle sorting
  const handleSort = useCallback((columnId: string) => {
    const column = columns.find(col => col.id === columnId)
    if (!column || !column.sortable) return

    const newDirection = sortKey === columnId && sortDirection === "asc" ? "desc" : "asc"
    setSortKey(columnId)
    setSortDirection(newDirection)
    onSortChange?.(columnId, newDirection)
  }, [sortKey, sortDirection, columns, onSortChange])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return data

    const column = columns.find(col => col.id === sortKey)
    if (!column) return data

    return [...data].sort((a, b) => {
      const aValue = column.accessorFn ? column.accessorFn(a) : (column.accessorKey ? a[column.accessorKey] : "")
      const bValue = column.accessorFn ? column.accessorFn(b) : (column.accessorKey ? b[column.accessorKey] : "")
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortDirection, columns])

  // Handle pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData
    const start = (page - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, page, pageSize, pagination])

  // Handle selection
  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelection = checked 
      ? [...new Set([...selectedIds, ...paginatedData.map(row => row[keyField])])]
      : selectedIds.filter(id => !paginatedData.some(row => row[keyField] === id))
    
    setSelectedIds(newSelection)
    onSelectionChange?.(newSelection)
  }, [selectedIds, paginatedData, keyField, onSelectionChange])

  const handleSelectRow = useCallback((rowId: string | number, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedIds, rowId]
      : selectedIds.filter(id => id !== rowId)
    
    setSelectedIds(newSelection)
    onSelectionChange?.(newSelection)
  }, [selectedIds, onSelectionChange])

  const allVisibleSelected = paginatedData.length > 0 && paginatedData.every(row => selectedIds.includes(row[keyField]))

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1)
    onPageSizeChange?.(newPageSize)
  }, [onPageSizeChange])

  // Get cell value
  const getCellValue = useCallback((row: T, column: ColumnDef<T>) => {
    if (column.cell) {
      const value = column.accessorFn ? column.accessorFn(row) : (column.accessorKey ? row[column.accessorKey] : "")
      return column.cell({ row, value, index: paginatedData.indexOf(row) })
    }
    
    if (column.accessorFn) return column.accessorFn(row)
    if (column.accessorKey) return row[column.accessorKey]
    return ""
  }, [paginatedData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Page Size Selector */}
      {pagination && onPageSizeChange && (
        <div className="flex justify-end">
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>Show {size}</option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table className={cn("admin-table", className)}>
          <TableHeader>
            <TableRow>
              {/* Selection column */}
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allVisibleSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
              )}
              
              {/* Data columns */}
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.sortable && "cursor-pointer select-none hover:bg-muted/50",
                    column.headerClassName
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortKey === column.id && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              
              {/* Actions column */}
              {actions && (
                <TableHead className="w-36 text-right">
                  {actions.label || "Actions"}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow
                  key={row[keyField]}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    selectedIds.includes(row[keyField]) && "bg-muted/30"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {/* Selection cell */}
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(row[keyField])}
                        onChange={(e) => handleSelectRow(row[keyField], e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  
                  {/* Data cells */}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={column.className}
                      onClick={(e) => column.sortable && e.stopPropagation()}
                    >
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                  
                  {/* Actions cell */}
                  {actions && (
                    <TableCell className="text-right space-x-1">
                      {actions.items
                        .filter(action => !action.hidden?.(row))
                        .map((action, index) => (
                          <Button
                            key={index}
                            variant={action.variant || "outline"}
                            size="sm"
                            disabled={action.disabled?.(row)}
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(row)
                            }}
                            title={action.label}
                          >
                            {action.icon}
                          </Button>
                        ))
                      }
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && sortedData.length > 0 && (
        <Pagination
          page={page}
          total={sortedData.length}
          pageSize={pageSize}
          onChange={setPage}
          showPageSize={false}
        />
      )}
    </div>
  )
}

// Helper functions to create common column types
export function createTextColumn<T>(id: string, header: string, accessorKey: keyof T, options?: Partial<ColumnDef<T>>): ColumnDef<T> {
  return {
    id,
    header,
    accessorKey,
    sortable: true,
    ...options,
  }
}

export function createNumberColumn<T>(id: string, header: string, accessorKey: keyof T, options?: Partial<ColumnDef<T>>): ColumnDef<T> {
  return {
    id,
    header,
    accessorKey,
    sortable: true,
    ...options,
  }
}

export function createBadgeColumn<T>(id: string, header: string, accessorKey: keyof T, options?: Partial<ColumnDef<T>>): ColumnDef<T> {
  return {
    id,
    header,
    accessorKey,
    sortable: true,
    cell: ({ value }) => (
      <Badge variant="secondary">{value}</Badge>
    ),
    ...options,
  }
}

export function createStatusColumn<T>(id: string, header: string, accessorKey: keyof T, options?: Partial<ColumnDef<T>>): ColumnDef<T> {
  return {
    id,
    header,
    accessorKey,
    sortable: true,
    cell: ({ value }) => (
      <Badge variant={value === "active" || value === "published" ? "default" : "secondary"}>
        {value}
      </Badge>
    ),
    ...options,
  }
}

export function createCustomColumn<T>(id: string, header: string, cell: (info: { row: T; value: any; index: number }) => React.ReactNode, options?: Partial<ColumnDef<T>>): ColumnDef<T> {
  return {
    id,
    header,
    cell,
    sortable: false,
    ...options,
  }
}
