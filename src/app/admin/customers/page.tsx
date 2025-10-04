"use client"
import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { FiltersBar } from "@/components/admin/filters"
import { Eye, Pencil, Trash, Plus } from "lucide-react"
import { exportCsv } from "@/lib/utils"
import PageHeader from "@/components/admin/page-header"
import { useRouter } from "next/navigation"
import { useConfirm } from "@/components/ConfirmDialog"
import { Toaster, toast } from 'sonner';
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchCustomers, selectCustomers, selectCustomersLoading, toggleStatus, removeCustomer } from "@/store/customers"  

export default function CustomersPage() {
  const router = useRouter()
  const confirm = useConfirm()
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [sortKey, setSortKey] = useState<"id" | "name" | "email" | "status">("id")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<number[]>([])
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectCustomers)
  const loading = useAppSelector(selectCustomersLoading)
  const [editing, setEditing] = useState<any | null>(null)
  const [creating, setCreating] = useState<any | null>(null)

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [dispatch])

  const filtered = useMemo(() => {
    return data?.filter((c:any) => {
      const matchesQ = q ? c.name.toLowerCase().includes(q.toLowerCase()) || 
                              c.email.toLowerCase().includes(q.toLowerCase()) : true
      const matchesStatus = status === "all" ? true : c.status === status
      return matchesQ && matchesStatus
    })
  }, [data, q, status])

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

  const allVisibleSelected = paged.every((c) => selected.includes(c.id))
  const toggleAllVisible = (checked: boolean) => {
    if (checked) setSelected(Array.from(new Set([...selected, ...paged.map((c) => c.id)])))
    else setSelected(selected.filter((id) => !paged.some((c) => c.id === id)))
  }

  const handleCreateCustomer = () => {
    router.push("/admin/customers/create")
  }

  const handleEditCustomer = (customer: any) => {
    router.push(`/admin/customers/edit/${customer.id}`)
  }

  const handleViewCustomer = (customer: any) => {
    router.push(`/admin/customers/${customer.id}`)
  }

  const handleDeleteCustomer = async (id: number) => {
    const customer = data?.find(c => c.id === id)
    const ok = await confirm({ 
      title: "Delete Customer", 
      description: `Are you sure you want to delete ${customer?.name}? This action cannot be undone.`, 
      confirmText: "Delete", 
      variant: "destructive" 
    })
    if (ok) { 
      dispatch(removeCustomer(id))
      toast.success("Customer deleted successfully")
    }
  }

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      "USA": "🇺🇸",
      "UK": "🇬🇧",
      "Germany": "🇩🇪",
      "France": "🇫🇷",
      "Japan": "🇯🇵",
      "Canada": "🇨🇦",
      "Australia": "🇦🇺",
      "Spain": "🇪🇸",
      "Italy": "🇮🇹",
      "Netherlands": "🇳🇱"
    }
    return flags[country] || "🌍"
  }

  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">Customers</h2>
          <p className="mt-1 text-xs text-muted-foreground">{total} customers found</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const rows = sorted
            const cols = ["id", "name", "email", "status"]
            exportCsv("customers.csv", rows, cols)
          }}>Export</Button>
          <Button onClick={handleCreateCustomer}>
            <Plus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">Customers</div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 md:w-72" />
          </div>
        </div>
        <div className="px-2 py-2">
          <FiltersBar id="customers" values={{ status }} onLoadPreset={() => { }}>
            <span />
            <span />
            <Select data-below value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </FiltersBar>
        </div>

        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox checked={allVisibleSelected} onChange={(e) => toggleAllVisible(e.currentTarget.checked)} />
              </TableHead>
              {[
                ["id", "ID"],
                ["name", "Customer"],
                ["email", "Email"],
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
                  className={"cursor-pointer select-none" + (key === "id" ? " text-right" : "")}
                >
                  {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(c.id)}
                    onChange={(e) => {
                      const checked = e.currentTarget.checked
                      setSelected((prev) => checked ? [...prev, c.id] : prev.filter((id) => id !== c.id))
                    }}
                  />
                </TableCell>
                <TableCell className="text-right">{c.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">{c.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-muted-foreground">{c.phone}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "Active" ? "default" : "secondary"}>{c.status}</Badge>
                </TableCell>
                <TableCell className="space-x-1">
                  <Button variant="outline" size="sm" title="View" onClick={() => handleViewCustomer(c)}>
                    <Eye size={14} />
                  </Button>
                  <Button variant="outline" size="sm" title="Edit" onClick={() => handleEditCustomer(c)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="outline" size="sm" title="Delete" onClick={() => handleDeleteCustomer(c.id)}>
                    <Trash size={14} />
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
