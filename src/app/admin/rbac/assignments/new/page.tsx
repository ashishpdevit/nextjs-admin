"use client"
import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRBAC } from "@/hooks/use-rbac"
import { toast } from "sonner"

export default function AssignmentFormPage() {
  const router = useRouter()
  
  const { rolesCatalog, assignRole, hasPermission, loading } = useRBAC()
  const canManage = hasPermission("rbac:manage")
  const roles = useMemo(() => [...rolesCatalog].sort((a, b) => a.name.localeCompare(b.name)), [rolesCatalog])

  const [form, setForm] = useState<any>({ email: "", roleId: "" })
  const [saving, setSaving] = useState(false)
  const [init, setInit] = useState(false)

  useEffect(() => {
    if (!loading && !init && roles.length > 0) {
      setForm((prev: any) => ({ ...prev, roleId: roles[0]?.id ?? "" }))
      setInit(true)
    } else if (!loading && !init) {
      setInit(true)
    }
  }, [loading, init, roles])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canManage) return
    if (!form.email.trim() || !form.roleId) {
      toast.error("Email and role are required")
      return
    }
    try {
      setSaving(true)
      const selectedRole = roles.find((r: any) => r.id === Number(form.roleId))
      await assignRole({
        id: undefined,
        subjectId: form.email.trim().toLowerCase(),
        subjectType: "user",
        roleId: form.roleId as any,
        key: `user:${form.email.trim().toLowerCase()}:${selectedRole?.key || form.roleId}`
      })
      toast.success("Role assigned successfully")
      router.push("/admin/rbac/assignments")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to assign role")
    } finally {
      setSaving(false)
    }
  }

  if (!init) return <div className="p-4 text-sm text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-4 max-w-2xl max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">Assign Role</h2>
          <p className="mt-1 text-xs text-muted-foreground">Link a user account to a role.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-1.5 shrink-0">
              <label className="text-sm font-medium">User email</label>
              <Input
                type="email"
                placeholder="jane.doe@example.com"
                value={form.email}
                onChange={(event) => setForm((prev: any) => ({ ...prev, email: event.target.value }))}
                disabled={!canManage}
              />
            </div>
            <div className="grid gap-1.5 shrink-0">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={form.roleId}
                onChange={(event) => setForm((prev: any) => ({ ...prev, roleId: event.target.value }))}
                disabled={!canManage || !roles.length}
              >
                <option value="" disabled>Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/rbac/assignments")}>Cancel</Button>
              <Button type="submit" disabled={!canManage || saving}>
                {saving ? "Assigning..." : "Assign Role"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
