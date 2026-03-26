"use client"
import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addAdmin, fetchAdmins, selectAdmins, updateAdmin } from "@/store/admin"
import { toast } from "sonner"
import { useRBAC } from "@/hooks/use-rbac"

export default function AdminFormPage() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  
  const idStr = params?.id as string
  const isNew = idStr === "new"
  const adminId = !isNew ? Number(idStr) : null

  const data = useAppSelector(selectAdmins)
  const { rolesCatalog, assignRole } = useRBAC()
  const roles = useMemo(() =>
    [...rolesCatalog].sort((a, b) => a.name.localeCompare(b.name)),
    [rolesCatalog]
  )

  const [formData, setFormData] = useState<any>({ name: "", email: "", role: "", status: "Active", password: "" })
  const [init, setInit] = useState(false)

  useEffect(() => {
    if (!data || data.length === 0) {
      dispatch(fetchAdmins({}))
    }
  }, [dispatch, data])

  useEffect(() => {
    if (!isNew && adminId && data && data.length > 0 && !init) {
      const existing = data.find((u) => u.id === adminId)
      if (existing) {
        setFormData({ ...existing, password: "" })
      }
      setInit(true)
    } else if (isNew && !init && roles.length > 0) {
      setFormData((prev: any) => ({ ...prev, role: roles[0].key }))
      setInit(true)
    } else if (isNew && !init && rolesCatalog.length === 0) {
       // Wait for roles to load
    } else if (!init) {
      setInit(true)
    }
  }, [data, adminId, isNew, init, roles, rolesCatalog])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...formData }
      if (!payload.password) {
        delete payload.password
      }
      if (isNew) {
        const res = await dispatch(addAdmin(payload)).unwrap()
        
        // Sync with RBAC: Create assignment for this email
        const assignedRole = roles.find((r: any) => r.key === payload.role)
        if (assignedRole) {
          await assignRole({
            subjectId: payload.email.toLowerCase(),
            subjectType: "user",
            roleId: assignedRole.id,
            key: `user:${payload.email.toLowerCase()}:${assignedRole.key}`
          })
        }
        
        toast.success("Admin created successfully")
      } else {
        await dispatch(updateAdmin(payload)).unwrap()
        
        // Update RBAC assignment if role or email changed
        const assignedRole = roles.find((r: any) => r.key === payload.role)
        if (assignedRole) {
          await assignRole({
            subjectId: payload.email.toLowerCase(),
            subjectType: "user",
            roleId: assignedRole.id,
            key: `user:${payload.email.toLowerCase()}:${assignedRole.key}`
          })
        }

        toast.success("Admin updated successfully")
      }
      router.push("/admin/users")
    } catch (err: any) {
      toast.error(err.message || "Failed to save admin")
    }
  }

  if (!isNew && !init) return <div className="p-4 text-muted-foreground text-sm">Loading record...</div>

  return (
    <div className="space-y-4 max-w-2xl max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {isNew ? "Create Admin" : "Edit Admin"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Manage administrator details and permissions.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid gap-1.5 shrink-0">
              <label className="text-sm font-medium">Name</label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid gap-1.5 shrink-0">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            {isNew && (
              <div className="grid gap-1.5 shrink-0">
                <label className="text-sm font-medium">Password</label>
                <Input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Role</label>
                <Select required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.key}>{r.name}</option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Status</label>
                <Select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>Cancel</Button>
              <Button type="submit">
                {isNew ? "Create Admin" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
