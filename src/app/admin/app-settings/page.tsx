"use client"
import { useEffect, useMemo, useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { FiltersBar } from "@/components/admin/filters"
import { exportCsv } from "@/lib/utils"
import PageHeader from "@/components/admin/page-header"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchAppSettings, saveAppSetting, selectAppSettings, selectAppSettingsLoading } from "@/store/appSettings"
import { TableLoadingState, TableEmptyState } from "@/components/ui/table-states"

export default function AppSettingsPage() {
  const [q, setQ] = useState("")
  const [sortKey, setSortKey] = useState<"label" | "version" | "forceUpdates" | "maintenance" | "updatedAt">("updatedAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<number[]>([])
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectAppSettings)
  const loading = useAppSelector(selectAppSettingsLoading)
  const [editing, setEditing] = useState<any | null>(null)

  const hasFetched = useRef(false)

  const fetchData = useCallback(() => {
    if (!hasFetched.current && !loading && (!data || data.length === 0)) {
      hasFetched.current = true
      dispatch(fetchAppSettings())
    }
  }, [dispatch, loading, data])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    return data.filter((s) =>
      q ? s.label.toLowerCase().includes(q.toLowerCase()) : true
    )
  }, [q, data])

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

  const allVisibleSelected = paged.every((s) => selected.includes(s.id))


  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">App Settings</h2>
          <p className="mt-1 text-xs text-muted-foreground">{total} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const rows = sorted
            const cols = ["label", "version", "forceUpdates", "maintenance", "updatedAt"]
            exportCsv("app-settings.csv", rows, cols)
          }}>Export</Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">Settings</div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search settings" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 md:w-72" />
          </div>
        </div>

        {loading ? (
          <TableLoadingState message="Loading app settings..." />
        ) : paged.length === 0 ? (
          <TableEmptyState 
            title="No app settings found"
            message="Try adjusting your search criteria to find what you're looking for."
          />
        ) : (
          <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={allVisibleSelected}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked
                    if (checked) setSelected(Array.from(new Set([...selected, ...paged.map((s) => s.id)])))
                    else setSelected(selected.filter((id) => !paged.some((s) => s.id === id)))
                  }}
                />
              </TableHead>
              {[
                ["label", "App Label"],
                ["version", "App Version"],
                ["forceUpdates", "App Force Updates"],
                ["maintenance", "App Maintenance Mode"],
                ["updatedAt", "Last Modified"],
                ["action", "Action"],
              ].map(([key, label]) => (
                <TableHead
                  key={key}
                  onClick={() => {
                    if (key === "action") return
                    const k = key as typeof sortKey
                    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc")
                    else { setSortKey(k); setSortDir("asc") }
                  }}
                  className={key !== "action" ? "cursor-pointer select-none" : ""}
                >
                  {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(s.id)}
                    onChange={(e) => {
                      const checked = e.currentTarget.checked
                      setSelected((prev) => checked ? [...prev, s.id] : prev.filter((id) => id !== s.id))
                    }}
                  />
                </TableCell>
                <TableCell>{s.label}</TableCell>
                <TableCell>{s.version}</TableCell>
                <TableCell>{s.forceUpdates}</TableCell>
                <TableCell>{s.maintenance}</TableCell>
                <TableCell>{new Date(s.updatedAt).toLocaleString()}</TableCell>
                <TableCell className="space-x-1">
                  <Button variant="outline" size="sm" title="Edit" onClick={() => setEditing(s)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        )}

        {!loading && paged.length > 0 && (
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            onChange={setPage}
            showPageSize
            onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
          />
        )}

        {editing && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setEditing(null)}>
            <div className="w-full max-w-md rounded-lg border bg-background p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 text-sm font-semibold">Edit App Setting</div>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <label className="text-sm">App Label</label>
                  <Input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm">App Version</label>
                  <Input value={editing.version} onChange={(e) => setEditing({ ...editing, version: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-sm">Force Updates</label>
                    <Select value={String(editing.forceUpdates)} onChange={(e) => setEditing({ ...editing, forceUpdates: Number(e.target.value) })}>
                      <option value="0">0</option>
                      <option value="1">1</option>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm">Maintenance</label>
                    <Select value={String(editing.maintenance)} onChange={(e) => setEditing({ ...editing, maintenance: Number(e.target.value) })}>
                      <option value="0">0</option>
                      <option value="1">1</option>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={() => { dispatch(saveAppSetting(editing)); setEditing(null) }}>Save</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
