"use client"
import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { FiltersBar } from "@/components/admin/filters"
import { exportCsv } from "@/lib/utils"
import { Input as TextInput } from "@/components/ui/input"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Eye, Pencil, Trash } from "lucide-react"
import { addAdmin, fetchAdmins, selectAdmins, selectAdminsLoading, toggleStatus, updateAdmin, removeAdmin } from "@/store/admin"
import { useConfirm } from "@/components/ConfirmDialog"
import { Toaster, toast } from 'sonner';

export default function UsersPage() {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [sortKey, setSortKey] = useState<"id" | "name" | "email" | "role" | "status">("id")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<number[]>([])
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectAdmins)
  const loading = useAppSelector(selectAdminsLoading)
  const confirm = useConfirm()
  const [editing, setEditing] = useState<any | null>(null)
  const [creating, setCreating] = useState<any | null>(null)

  useEffect(() => {
    dispatch(fetchAdmins())
  }, [dispatch])

  const filtered = useMemo(() => {
    return data?.data?.filter((u:any) => {
      const matchesQ = q
        ? u.name.toLowerCase().includes(q.toLowerCase()) ||
          u.email.toLowerCase().includes(q.toLowerCase())
        : true
      const matchesStatus = status === "all" ? true : (u.status === status)
      return matchesQ && matchesStatus
    })
  }, [q, status, data])

  const sorted = useMemo(() => {
    const list = [...filtered || []]
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

  const allVisibleSelected = paged.every((u) => selected.includes(u.id))
  const toggleAllVisible = (checked: boolean) => {
    if (checked) {
      const ids = Array.from(new Set([...selected, ...paged.map((u) => u.id)]))
      setSelected(ids)
    } else {
      const ids = selected.filter((id) => !paged.some((u) => u.id === id))
      setSelected(ids)
    }
  }

  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">Admins</h2>
          <p className="mt-1 text-xs text-muted-foreground">{total} admins found</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const rows = sorted
            const cols = ["id", "name", "email", "role", "status"]
            exportCsv("admins.csv", rows, cols)
          }}>Export</Button>
          <Button onClick={() => setCreating({ name: "", email: "", role: "Admin", status: "Active" })}>New</Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">Admins</div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 md:w-72" />
          </div>
        </div>
        {/* <div className="px-2 py-2">
          <FiltersBar id="users" values={{ status }} onLoadPreset={() => {}}>
            <span />
            <span />
            <Select data-below value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </FiltersBar>
        </div> */}

      {selected.length > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm">
          <div>{selected.length} selected</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const rows = data?.filter((u) => selected.includes(u.id))
                const header = ["id", "name", "email", "role", "status"]
                const csv = [header.join(","), ...rows.map((r) => header.map((h) => (r as any)[h]).join(","))].join("\n")
                const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
                const a = document.createElement("a")
                a.href = url
                a.download = "users.csv"
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

      <div className="">
      <Table className="admin-table">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={allVisibleSelected}
                onChange={(e) => toggleAllVisible(e.currentTarget.checked)}
              />
            </TableHead>
            {[
              ["id", "ID"],
              ["name", "Name"],
              ["email", "Email"],
              ["role", "Role"],
              ["status", "Status"],
              ["action", "Action"],
            ].map(([key, label]) => (
              <TableHead
                key={key}
                onClick={() => {
                  if (key === "action") return
                  const k = key as typeof sortKey
                  if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc")
                  else {
                    setSortKey(k)
                    setSortDir("asc")
                  }
                }}
                className={key === "action" ? "" : "cursor-pointer select-none"}
              >
                {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <Checkbox
                  checked={selected.includes(u.id)}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked
                    setSelected((prev) =>
                      checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)
                    )
                  }}
                />
              </TableCell>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <button
                  className={"inline-flex items-center rounded-md border px-2 py-1 text-xs " + (u.status === "Active" ? "bg-secondary" : "")}
                  onClick={() => {
                    dispatch(toggleStatus(u.id))
                  }}
                >
                  {u.status === "Active" ? "Active" : "Inactive"}
                </button>
              </TableCell>
              <TableCell className="space-x-1">
                <Button variant="outline" size="sm" title="View" onClick={() => alert(JSON.stringify(u, null, 2))}>
                  <Eye size={14} />
                </Button>
                <Button variant="outline" size="sm" title="Edit" onClick={() => setEditing(u)}>
                  <Pencil size={14} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  title="Delete" 
                  onClick={async () => {
                    const ok = await confirm({ 
                      title: "Delete Admin", 
                      description: `Are you sure you want to delete ${u.name}? This action cannot be undone.`, 
                      confirmText: "Delete", 
                      variant: "destructive" 
                    })
                    if (ok) { 
                      dispatch(removeAdmin(u.id))
                      toast.success("Admin deleted successfully")
                    }
                  }}
                >
                  <Trash size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        onChange={setPage}
        showPageSize
        onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
      />

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-lg border bg-background p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-sm font-semibold">Edit Admin</div>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm">Name</label>
                <TextInput value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm">Email</label>
                <TextInput type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm">Role</label>
                <Select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={() => { dispatch(updateAdmin(editing)); setEditing(null) }}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setCreating(null)}>
          <div className="w-full max-w-md rounded-lg border bg-background p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-sm font-semibold">Create Admin</div>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm">Name</label>
                <TextInput value={creating.name} onChange={(e) => setCreating({ ...creating, name: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm">Email</label>
                <TextInput type="email" value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm">Role</label>
                <Select value={creating.role} onChange={(e) => setCreating({ ...creating, role: e.target.value })}>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreating(null)}>Cancel</Button>
              <Button onClick={() => { dispatch(addAdmin(creating)); setCreating(null) }}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
