import React, { useMemo, useState, useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { FiltersBar } from '@/components/admin/filters'
import { DataTable, DataTableColumn, DataTableRenderers } from '@/components/ui/data-table'
import { useDebounce } from '@/hooks/use-debounce'
import { Loader2 } from 'lucide-react'

interface TablePageProps {
  // Data
  data: any[]
  loading: boolean
  pagination: {
    current_page: number
    total: number
    per_page: number
    last_page: number
  }
  
  // API
  fetchAction: (params: any) => any
  
  // Table configuration
  columns: DataTableColumn[]
  title: string
  searchPlaceholder?: string
  
  // Filters
  filters?: {
    key: string
    label: string
    options: { value: string; label: string }[]
  }[]
  
  // Actions
  onCreate?: () => void
  onExport?: (selected: number[]) => void
  onBulkAction?: (selected: number[], action: string) => void
  
  // Custom renderers
  customRenderers?: Record<string, (value: any, row: any) => React.ReactNode>
}

export function TablePage({
  data,
  loading,
  pagination,
  fetchAction,
  columns,
  title,
  searchPlaceholder = "Search...",
  filters = [],
  onCreate,
  onExport,
  onBulkAction,
  customRenderers = {}
}: TablePageProps) {
  const dispatch = useAppDispatch()
  
  // State
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState("id")
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<number[]>([])
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  
  // Debounced search
  const debouncedSearch = useDebounce(search, 500)
  
  // Search parameters
  const searchParams = useMemo(() => ({
    page,
    limit: pageSize,
    sortBy: sortKey,
    sortOrder: sortDir,
    search: debouncedSearch || undefined,
    ...filterValues
  }), [page, pageSize, sortKey, sortDir, debouncedSearch, filterValues])
  
  // Fetch data when parameters change
  React.useEffect(() => {
    dispatch(fetchAction(searchParams))
  }, [dispatch, fetchAction, searchParams])
  
  // Handlers
  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }, [sortKey, sortDir])
  
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelected(data.map(row => row.id))
    } else {
      setSelected([])
    }
  }, [data])
  
  const handleSelectRow = useCallback((id: number, checked: boolean) => {
    setSelected(prev => 
      checked 
        ? [...prev, id] 
        : prev.filter(selectedId => selectedId !== id)
    )
  }, [])
  
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value === 'all' ? '' : value
    }))
    setPage(1)
  }, [])
  
  // Enhanced columns with custom renderers
  const enhancedColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      render: customRenderers[col.key] || col.render
    }))
  }, [columns, customRenderers])
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {loading ? "Loading..." : `${pagination.total} items found`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onExport && selected.length > 0 && (
            <Button variant="outline" onClick={() => onExport(selected)}>
              Export CSV
            </Button>
          )}
          {onCreate && (
            <Button onClick={onCreate}>
              New
            </Button>
          )}
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="h-9 w-56 md:w-72"
          />
        </div>
        
        {filters.length > 0 && (
          <FiltersBar id={title.toLowerCase()} values={filterValues} onLoadPreset={() => {}}>
            <span />
            <span />
            {filters.map(filter => (
              <Select
                key={filter.key}
                data-below
                value={filterValues[filter.key] || 'all'}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              >
                <option value="all">All {filter.label.toLowerCase()}</option>
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ))}
          </FiltersBar>
        )}
      </div>
      
      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm">
          <div>{selected.length} selected</div>
          <div className="flex items-center gap-2">
            {onBulkAction && (
              <Button
                variant="outline"
                onClick={() => onBulkAction(selected, 'delete')}
              >
                Delete Selected
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        </div>
      )}
      
      {/* Table */}
      <DataTable
        columns={enhancedColumns}
        data={data}
        loading={loading}
        total={pagination.total}
        selected={selected}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        emptyMessage={`No ${title.toLowerCase()} found`}
        loadingMessage={`Loading ${title.toLowerCase()}...`}
      />
      
      {/* Pagination */}
      {!loading && data.length > 0 && (
        <Pagination
          page={pagination.current_page}
          total={pagination.total}
          pageSize={pagination.per_page}
          onChange={setPage}
          showPageSize
          onPageSizeChange={(n) => {
            setPageSize(n)
            setPage(1)
          }}
        />
      )}
    </div>
  )
}

// Export common renderers
export { DataTableRenderers }
