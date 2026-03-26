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
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { useRouter } from "next/navigation"
import { fetchAppMenuLinks, selectAppMenuLinks, selectAppMenuLinksLoading } from "@/store/appMenuLinks"
import { TableLoadingState, TableEmptyState } from "@/components/ui/table-states"
import { toast } from "sonner"

export default function AppMenuLinksPage() {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [type, setType] = useState("all")
  const [target, setTarget] = useState("all")
  const [sortKey, setSortKey] = useState<"name" | "type" | "audience" | "updatedAt">("updatedAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<number[]>([])
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectAppMenuLinks)
  const loading = useAppSelector(selectAppMenuLinksLoading)
  const hasFetched = useRef(false)

  const fetchData = useCallback(() => {
    if (!hasFetched.current && !loading && (!data || data.length === 0)) {
      hasFetched.current = true
      dispatch(fetchAppMenuLinks())
    }
  }, [dispatch, loading, data])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    return data?.filter((l: any) => {
      const mq = q ? l.name.toLowerCase().includes(q.toLowerCase()) : true
      const mt = type === "all" ? true : l.type === type
      const mf = target === "all" ? true : l.audience === target
      return mq && mt && mf
    })
  }, [q, type, target, data])

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

  const allVisibleSelected = paged.every((l) => selected.includes(l.id))

  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">App Menu Links</h2>
          <p className="mt-1 text-xs text-muted-foreground">{total} links</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/admin/app-menu-links/new")}>Create Link</Button>
          {selected.length > 0 && (
            <Button variant="destructive" onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${selected.length} items?`)) {
                toast.success(`Deleted ${selected.length} items`)
                setSelected([])
              }
            }}>
              Delete Selected ({selected.length})
            </Button>
          )}
          <Button variant="outline" onClick={() => {
            const rows = sorted
            const cols = ["name", "type", "audience", "updatedAt", "link", "content"]
            exportCsv("app-menu-links.csv", rows, cols)
          }}>Export</Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">Links</div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search links" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 md:w-72" />
          </div>
        </div>
        <div className="px-2 py-2">
          <FiltersBar id="app-menu-links" values={{ target }} onLoadPreset={() => { }}>
            <span />
            <span />
            <Select data-below value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="all">All targets</option>
              <option value="User">User</option>
              <option value="Website">Website</option>
            </Select>
          </FiltersBar>
        </div>

        {loading ? (
          <TableLoadingState message="Loading menu links..." />
        ) : paged.length === 0 ? (
          <TableEmptyState
            title="No menu links found"
            message="Try adjusting your search or filter criteria to find what you're looking for."
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
                  ["name", "Name"],
                  ["type", "Type"],
                  ["audience", "For"],
                  ["updatedAt", "Last Updated"],
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
                    className={key === "action" ? "" : "cursor-pointer select-none"}
                  >
                    {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(l.id)}
                      onChange={(e) => {
                        const checked = e.currentTarget.checked
                        setSelected((prev) => checked ? [...prev, l.id] : prev.filter((id) => id !== l.id))
                      }}
                    />
                  </TableCell>
                  <TableCell>{l?.name}</TableCell>
                  <TableCell>{l?.type}</TableCell>
                  <TableCell>{l?.audience}</TableCell>
                  <TableCell>{new Date(l.updatedAt).toLocaleString()}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button variant="outline" size="sm" title="Edit" onClick={() => router.push(`/admin/app-menu-links/${l.id}`)}>
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
      </div>
    </div>
  )
}
