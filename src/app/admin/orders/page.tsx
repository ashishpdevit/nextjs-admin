"use client"
import { useEffect, useMemo, useState, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { useSmartEffect } from "@/hooks/use-smart-effect"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { FiltersBar } from "@/components/admin/filters"
import { PermissionGate } from "@/components/rbac/PermissionGate"
import { exportCsv } from "@/lib/utils"
import { Eye } from "lucide-react"
import PageHeader from "@/components/admin/page-header"
import { TableCard } from "@/components/admin/table-card"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchOrders, selectOrders, selectOrdersLoading, createOrder, updateOrder, removeOrder } from "@/store/orders"
import { selectOrdersPagination, selectOrdersLinks } from "@/features/orders/ordersSlice"
import { TableLoadingState, TableEmptyState } from "@/components/ui/table-states"

export default function OrdersPage() {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [sortKey, setSortKey] = useState<"id" | "customer" | "total" | "date" | "status">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<string[]>([])
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectOrders)
  const loading = useAppSelector(selectOrdersLoading)
  const pagination = useAppSelector(selectOrdersPagination)
  const links = useAppSelector(selectOrdersLinks)

  // Debounce search query to prevent excessive API calls
  const debouncedQ = useDebounce(q, 500)

  // Create a stable reference for the search parameters
  const searchParams = useMemo(() => ({
    page,
    limit: pageSize,
    sortBy: sortKey,
    sortOrder: sortDir,
    search: debouncedQ || undefined,
    status: status !== 'all' ? status : undefined,
  }), [page, pageSize, sortKey, sortDir, debouncedQ, status])

  // Smart effect that prevents double calls but allows parameter changes
  useSmartEffect(() => {
    dispatch(fetchOrders(searchParams))
  }, [dispatch, searchParams])

  // Data is already filtered, sorted, and paginated by the backend
  const total = pagination?.total || data?.length || 0
  const paged = data || []

  const allVisibleSelected = paged.every((o) => selected.includes(o.id))
  const toggleAllVisible = (checked: boolean) => {
    if (checked) setSelected(Array.from(new Set([...selected, ...paged.map((o) => o.id)])))
    else setSelected(selected.filter((id) => !paged.some((o) => o.id === id)))
  }

  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">Orders</h2>
          <p className="mt-1 text-xs text-muted-foreground">{total} orders found</p>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGate allow="orders:export">
            <Button variant="outline" onClick={() => {
              const rows = paged
              const cols = ["id", "customer", "total", "date", "status"]
              exportCsv("orders.csv", rows, cols)
            }}>Export</Button>
          </PermissionGate>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">Orders</div>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search orders" 
              value={q} 
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1) // Reset to first page when searching
              }} 
              className="h-9 w-56 md:w-72" 
            />
          </div>
        </div>
        <div className="px-2 py-2">
          <FiltersBar id="orders" values={{ status }} onLoadPreset={() => { }}>
            <span />
            <span />
            <Select data-below value={status} onChange={(e) => {
              setStatus(e.target.value)
              setPage(1) // Reset to first page when filtering
            }}>
              <option value="all">All status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Refunded">Refunded</option>
            </Select>
          </FiltersBar>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm">
            <div>{selected.length} selected</div>
            <div className="flex items-center gap-2">
              <PermissionGate allow="orders:export">
                <Button
                  variant="outline"
                  onClick={() => {
                    const rows = data?.filter((o) => selected.includes(o.id)) || []
                    const header = ["id", "customer", "total", "date", "status"]
                    const csv = [header.join(","), ...rows.map((r) => header.map((h) => (r as any)[h]).join(","))].join("\n")
                    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "orders.csv"
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  Export CSV
                </Button>
              </PermissionGate>
              <Button variant="outline" onClick={() => setSelected([])}>Clear</Button>
            </div>
          </div>
        )}

        {loading ? (
          <TableLoadingState message="Loading orders..." />
        ) : paged.length === 0 ? (
          <TableEmptyState 
            title="No orders found"
            message="Try adjusting your search or filter criteria to find what you're looking for."
          />
        ) : (
          <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox checked={allVisibleSelected} onChange={(e) => toggleAllVisible(e.currentTarget.checked)} />
              </TableHead>
              {[
                ["id", "Order"],
                ["customer", "Customer"],
                ["total", "Total"],
                ["date", "Date"],
                ["status", "Status"],
                ["action", "Action"],
              ].map(([key, label]) => (
                <TableHead
                  key={key}
                  onClick={() => {
                    const k = key as typeof sortKey
                    if (sortKey === k) {
                      setSortDir(sortDir === "asc" ? "desc" : "asc")
                    } else {
                      setSortKey(k)
                      setSortDir("asc")
                    }
                    setPage(1) // Reset to first page when sorting changes
                  }}
                  className={"cursor-pointer select-none" + (key === "total" ? " text-right" : "")}
                >
                  {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(o.id)}
                    onChange={(e) => {
                      const checked = e.currentTarget.checked
                      setSelected((prev) => checked ? [...prev, o.id] : prev.filter((id) => id !== o.id))
                    }}
                  />
                </TableCell>
                <TableCell>{o.id}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell className="text-right">${o.total.toFixed(2)}</TableCell>
                <TableCell>{o.date}</TableCell>
                <TableCell>
                  <Badge variant={o.status === "Paid" || o.status === "Shipped" ? "default" : o.status === "Refunded" ? "destructive" : "secondary"}>
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-1">
                  <Button variant="outline" size="sm" title="View" onClick={() => alert(o.id)}>
                    <Eye size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        )}

        {/* {!loading && paged.length > 0 && (
          <Pagination
            page={pagination?.current_page || 1}
            total={pagination?.total || 0}
            pageSize={pagination?.per_page || 10}
            onChange={(newPage) => { setPage(newPage) }}
            showPageSize
            onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
          />
        )} */}
      </div>
    </div>
  )
}

