"use client"
import { useMemo, useState } from "react"
import ordersData from "@/mocks/orders.json"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { FiltersBar } from "@/components/admin/filters"
import { exportCsv } from "@/lib/utils"
import { Eye } from "lucide-react"
import PageHeader from "@/components/admin/page-header"
import { TableCard } from "@/components/admin/table-card"

export default function OrdersPage() {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [sortKey, setSortKey] = useState<"id" | "customer" | "total" | "date" | "status">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<string[]>([])

  const filtered = useMemo(() => {
    return ordersData.filter((o) => {
      const matchesQ = q
        ? o.id.toLowerCase().includes(q.toLowerCase()) ||
        o.customer.toLowerCase().includes(q.toLowerCase())
        : true
      const matchesStatus = status === "all" ? true : o.status === status
      return matchesQ && matchesStatus
    })
  }, [q, status])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a: any, b: any) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return list
  }, [filtered, sortKey, sortDir])

  const total = sorted.length
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

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
          <p className="mt-1 text-xs text-muted-foreground">{total} orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const rows = sorted
            const cols = ["id", "customer", "total", "date", "status"]
            exportCsv("orders.csv", rows, cols)
          }}>Export</Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">Orders</div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search orders" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 md:w-72" />
          </div>
        </div>
        <div className="px-2 py-2">
          <FiltersBar id="orders" values={{ status }} onLoadPreset={() => { }}>
            <span />
            <span />
            <Select data-below value={status} onChange={(e) => setStatus(e.target.value)}>
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
              <Button
                variant="outline"
                onClick={() => {
                  const rows = ordersData.filter((o) => selected.includes(o.id))
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
              <Button variant="outline" onClick={() => setSelected([])}>Clear</Button>
            </div>
          </div>
        )}

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
                    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc")
                    else {
                      setSortKey(k)
                      setSortDir("asc")
                    }
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

        <Pagination
          page={page}
          total={total}
          pageSize={pageSize}
          onChange={setPage}
          showPageSize
          onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
        />
      </div>
    </div>
  )
}
