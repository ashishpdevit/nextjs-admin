"use client"
import { useEffect, useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import type { Faq, Lang } from "./types"
import { Edit2, Trash } from "lucide-react"

export default function FaqsTable({
  rows,
  languages,
  onEdit,
  onDelete,
  pageSize: pageSizeProp,
  onPageSizeChange,
}: {
  rows: Faq[]
  languages: Lang[]
  onEdit: (faq: Faq) => void
  onDelete: (id: number) => void
  pageSize?: number
  onPageSizeChange?: (n: number) => void
}) {
  const [sortKey, setSortKey] = useState<"id" | "status">("id")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [internalPageSize, setInternalPageSize] = useState(10)
  const pageSize = pageSizeProp ?? internalPageSize
  const [selected, setSelected] = useState<number[]>([])

  const defaultLang = languages[0]?.code ?? "en"

  useEffect(() => {
    setPage(1)
  }, [pageSize, rows.length])

  const sorted = useMemo(() => {
    const list = [...rows]
    list.sort((a: any, b: any) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      const aq = a.question[defaultLang] ?? ""
      const bq = b.question[defaultLang] ?? ""
      return aq.localeCompare(bq)
    })
    return list
  }, [rows, sortKey, sortDir, defaultLang])

  const total = sorted.length
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

  const allVisibleSelected = paged.every((f) => selected.includes(f.id))

  return (
    <div className="space-y-2">
      {pageSizeProp === undefined && (
        <div className="flex justify-end">
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            value={String(pageSize)}
            onChange={(e) => {
              const n = Number(e.target.value)
              setInternalPageSize(n)
              setPage(1)
              onPageSizeChange?.(n)
            }}
          >
            <option value="10">Show 10</option>
            <option value="20">Show 20</option>
            <option value="50">Show 50</option>
          </select>
        </div>
      )}
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
            <TableHead onClick={() => { if (sortKey === "id") setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey("id"); setSortDir("desc") } }} className="cursor-pointer select-none">ID {sortKey === "id" ? (sortDir === "asc" ? "▲" : "▼") : ""}</TableHead>
            <TableHead>Type</TableHead>
            {languages.map((l) => (
              <TableHead key={l.code + "q"}>Question ({l.label})</TableHead>
            ))}
            {languages.map((l) => (
              <TableHead key={l.code + "a"}>Answer ({l.label})</TableHead>
            ))}
            <TableHead onClick={() => { if (sortKey === "status") setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey("status"); setSortDir("asc") } }} className="cursor-pointer select-none">Status {sortKey === "status" ? (sortDir === "asc" ? "▲" : "▼") : ""}</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((f) => (
            <TableRow key={f.id}>
              <TableCell>
                <Checkbox
                  checked={selected.includes(f.id)}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked
                    setSelected((prev) => (checked ? [...prev, f.id] : prev.filter((id) => id !== f.id)))
                  }}
                />
              </TableCell>
              <TableCell>{f.id}</TableCell>
              <TableCell><Badge variant="outline">{f.type}</Badge></TableCell>
              {languages.map((l) => (
                <TableCell key={f.id + "q" + l.code} className="max-w-[360px] whitespace-pre-wrap text-pretty">{f.question[l.code] ?? ""}</TableCell>
              ))}
              {languages.map((l) => (
                <TableCell key={f.id + "a" + l.code} className="max-w-[420px] whitespace-pre-wrap text-pretty">{f.answer[l.code] ?? ""}</TableCell>
              ))}
              <TableCell><Badge variant="secondary">{f.status}</Badge></TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(f)} title="Edit"><Edit2 size={14}/></Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(f.id)} title="Delete"><Trash size={14}/></Button>
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
        onPageSizeChange={(n) => {
          setInternalPageSize(n)
          setPage(1)
          onPageSizeChange?.(n)
        }}
      />
    </div>
  )
}
