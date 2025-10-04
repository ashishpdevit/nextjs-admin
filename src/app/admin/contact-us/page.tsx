"use client"
import { useEffect, useMemo, useState } from "react"
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
import { fetchMessages, removeMessage, selectContact } from "@/store/contact"
import { useConfirm } from "@/components/ConfirmDialog"
import { Toaster, toast } from 'sonner';

export default function ContactUsPage() {
  const [q, setQ] = useState("")
  const [sortKey, setSortKey] = useState<"id" | "message" | "contact" | "createdAt">("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<number[]>([])
  const dispatch = useAppDispatch()
  const messages = useAppSelector(selectContact)
  const confirm = useConfirm()

  useEffect(() => { dispatch(fetchMessages()) }, [dispatch])

  const filtered = useMemo(() => {
    return messages?.filter((m:any) =>
      q ? (m.message + " " + m.contact).toLowerCase().includes(q.toLowerCase()) : true
    )
  }, [q, messages])

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

  const allVisibleSelected = paged.every((m) => selected.includes(m.id))

  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">Contact Us</h2>
          <p className="mt-1 text-xs text-muted-foreground">{total} messages</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const rows = sorted
            const cols = ["id", "message", "contact", "createdAt"]
            exportCsv("contact-us.csv", rows, cols)
          }}>Export</Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">Messages</div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search messages" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 md:w-72" />
          </div>
        </div>

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
                ["id", "ID"],
                ["message", "Message"],
                ["contact", "Email/Phone"],
                ["createdAt", "Created At"],
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
            {paged.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(m.id)}
                    onChange={(e) => {
                      const checked = e.currentTarget.checked
                      setSelected((prev) => checked ? [...prev, m.id] : prev.filter((id) => id !== m.id))
                    }}
                  />
                </TableCell>
                <TableCell>{m.id}</TableCell>
                <TableCell className="max-w-[520px] whitespace-pre-wrap text-pretty">{m.message}</TableCell>
                <TableCell>{m.contact}</TableCell>
                <TableCell>{new Date(m.createdAt).toLocaleString()}</TableCell>
                <TableCell className="space-x-1">
                  <Button variant="outline" size="sm" title="View" onClick={() => alert(m.message)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    title="Delete" 
                    onClick={async () => {
                      const ok = await confirm({ 
                        title: "Delete Message", 
                        description: "Are you sure you want to delete this contact message? This action cannot be undone.", 
                        confirmText: "Delete", 
                        variant: "destructive" 
                      })
                      if (ok) { 
                        dispatch(removeMessage(m.id))
                        toast.success("Message deleted successfully")
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
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
