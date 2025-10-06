import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Search, AlertCircle } from 'lucide-react'

interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: DataTableColumn[]
  data: any[]
  loading: boolean
  total: number
  selected: number[]
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: number, checked: boolean) => void
  onSort: (key: string) => void
  sortKey: string
  sortDir: 'asc' | 'desc'
  emptyMessage?: string
  loadingMessage?: string
  className?: string
}

export function DataTable({
  columns,
  data,
  loading,
  total,
  selected,
  onSelectAll,
  onSelectRow,
  onSort,
  sortKey,
  sortDir,
  emptyMessage = "No data found",
  loadingMessage = "Loading...",
  className = ""
}: DataTableProps) {
  const allVisibleSelected = data.every((row) => selected.includes(row.id))

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">{loadingMessage}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No data found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {emptyMessage}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Table className="admin-table">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox 
                checked={allVisibleSelected} 
                onChange={(e) => onSelectAll(e.currentTarget.checked)} 
              />
            </TableHead>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                onClick={() => column.sortable !== false && onSort(column.key)}
                className={`cursor-pointer select-none ${
                  column.sortable === false ? 'cursor-default' : ''
                } ${
                  column.align === 'right' ? 'text-right' : 
                  column.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable !== false && sortKey === column.key && (
                    <span className="text-xs">
                      {sortDir === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Checkbox
                  checked={selected.includes(row.id)}
                  onChange={(e) => onSelectRow(row.id, e.currentTarget.checked)}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={
                    column.align === 'right' ? 'text-right' : 
                    column.align === 'center' ? 'text-center' : 'text-left'
                  }
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Common column renderers
export const DataTableRenderers = {
  status: (value: string) => (
    <Badge variant={value === 'Active' ? 'default' : 'secondary'}>
      {value}
    </Badge>
  ),
  price: (value: number) => `$${value.toFixed(2)}`,
  date: (value: string) => new Date(value).toLocaleDateString(),
  actions: (value: any, row: any) => (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        View
      </Button>
      <Button variant="outline" size="sm">
        Edit
      </Button>
      <Button variant="outline" size="sm">
        Delete
      </Button>
    </div>
  )
}