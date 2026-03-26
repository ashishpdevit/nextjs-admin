"use client"
import { useEffect, useMemo, useState, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { useSmartEffect } from "@/hooks/use-smart-effect"
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
import { selectAdminsPagination, selectAdminsLinks } from "@/features/admin/adminSlice"
import { useConfirm } from "@/components/ConfirmDialog"
import { Toaster, toast } from 'sonner';
import { TableLoadingState, TableEmptyState } from "@/components/ui/table-states"
import { useRouter } from "next/navigation"

export default function UsersPage() {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [role, setRole] = useState("all")
  const [sortKey, setSortKey] = useState<"id" | "name" | "email" | "role" | "status">("id")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<number[]>([])
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectAdmins)
  const loading = useAppSelector(selectAdminsLoading)
  const pagination = useAppSelector(selectAdminsPagination)
  const links = useAppSelector(selectAdminsLinks)
  const confirm = useConfirm()
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
    role: role !== 'all' ? role : undefined,
  }), [page, pageSize, sortKey, sortDir, debouncedQ, status, role])

  // Smart effect that prevents double calls but allows parameter changes
  useSmartEffect(() => {
    dispatch(fetchAdmins(searchParams))
  }, [dispatch, searchParams])

  // Data is already filtered, sorted, and paginated by the backend
  const total = pagination?.total || data?.length || 0
  const paged = data || []

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
            const rows = paged
            const cols = ["id", "name", "email", "role", "status"]
            exportCsv("admins.csv", rows, cols)
          }}>Export</Button>
          <Button onClick={() => router.push("/admin/users/new")}>New</Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">Admins</div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name or email"
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
          <FiltersBar id="users" values={{ status, role }} onLoadPreset={() => { }}>
            <span />
            <span />
            <Select data-below value={status} onChange={(e) => {
              setStatus(e.target.value)
              setPage(1) // Reset to first page when filtering
            }}>
              <option value="all">All status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
            {/* <Select data-below value={role} onChange={(e) => {
              setRole(e.target.value)
              setPage(1) // Reset to first page when filtering
            }}>
              <option value="all">All roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </Select> */}
          </FiltersBar>
        </div>

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
          {loading ? (
            <TableLoadingState message="Loading users..." />
          ) : paged.length === 0 ? (
            <TableEmptyState
              title="No users found"
              message="Try adjusting your search or filter criteria to find what you're looking for."
            />
          ) : (
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
                        onClick={async () => {
                          try {
                            await dispatch(toggleStatus(u.id)).unwrap()
                            toast.success("Status toggled")
                          } catch (err: any) {
                            toast.error(err.message || "Failed to toggle status")
                          }
                        }}
                      >
                        {u.status === "Active" ? "Active" : "Inactive"}
                      </button>
                    </TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="outline" size="sm" title="Edit" onClick={() => router.push(`/admin/users/${u.id}`)}>
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
                            try {
                              await dispatch(removeAdmin(u.id)).unwrap()
                              toast.success("Admin deleted successfully")
                            } catch (err: any) {
                              toast.error(err.message || "Failed to delete admin")
                            }
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
          )}
        </div>

        {!loading && paged.length > 0 && (
          <Pagination
            page={pagination?.current_page || 1}
            total={pagination?.total || 0}
            pageSize={pagination?.per_page || 10}
            onChange={(newPage) => { setPage(newPage) }}
            showPageSize
            onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
          />
        )}

      </div>
    </div>
  )
}
