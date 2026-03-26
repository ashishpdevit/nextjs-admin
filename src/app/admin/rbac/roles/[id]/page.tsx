"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useRBAC } from "@/hooks/use-rbac"
import { toast } from "sonner"

export default function RoleFormPage() {
  const router = useRouter()
  const params = useParams()
  
  const idStr = params?.id as string
  const isNew = idStr === "new"
  
  const { rolesCatalog, permissionsCatalog, saveRole, hasPermission, loading } = useRBAC()
  const canManage = hasPermission("rbac:manage")
  
  const [form, setForm] = useState<any>({ name: "", description: "", permissions: [], grantAll: false, isSystem: false })
  const [saving, setSaving] = useState(false)
  const [init, setInit] = useState(false)

  useEffect(() => {
    if (!loading && !init) {
      if (!isNew) {
        const existing = rolesCatalog.find(r => r.id?.toString() === idStr)
        if (existing) {
          const grantAll = existing.permissions.includes("*")
          setForm({
            id: existing.id,
            name: existing.name,
            description: existing.description ?? "",
            permissions: grantAll ? permissionsCatalog.map((p) => p.id) : [...existing.permissions],
            grantAll,
            isSystem: existing.isSystem,
          })
        }
      }
      setInit(true)
    }
  }, [loading, init, isNew, idStr, rolesCatalog, permissionsCatalog])

  const togglePermission = (permissionId: string) => {
    setForm((previous: any) => {
      if (!previous) return previous
      const exists = previous.permissions.includes(permissionId)
      if (previous.grantAll) {
        const without = permissionsCatalog
          .map((permission) => permission.id)
          .filter((id) => id !== permissionId)
        return {
          ...previous,
          permissions: exists ? without : [...without, permissionId],
          grantAll: false,
        }
      }
      return {
        ...previous,
        permissions: exists
          ? previous.permissions.filter((id: string) => id !== permissionId)
          : [...previous.permissions, permissionId],
      }
    })
  }

  const handleGrantAllToggle = (checked: boolean) => {
    setForm((previous: any) => {
      if (!previous) return previous
      return {
        ...previous,
        grantAll: checked,
        permissions: checked ? permissionsCatalog.map((permission) => permission.id) : [],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManage) return
    if (!form.name.trim()) {
      toast.error("Role name is required")
      return
    }
    if (!form.grantAll && form.permissions.length === 0) {
      toast.error("Select at least one permission or grant all")
      return
    }
    try {
      setSaving(true)
      await saveRole({
        id: isNew ? undefined : form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        permissions: form.grantAll ? ["*"] : form.permissions,
        isSystem: form.isSystem,
      } as any)
      toast.success(isNew ? "Role created" : "Role updated")
      router.push("/admin/rbac/roles")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to save role")
    } finally {
      setSaving(false)
    }
  }

  if (!init) return <div className="p-4 text-sm text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-4 max-w-3xl max-w-full h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {isNew ? "Create Role" : "Edit Role"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Group permissions into reusable access bundles.</p>
        </div>
      </div>
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="pt-6 flex-1 flex flex-col overflow-hidden">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="grid gap-1.5 shrink-0 mb-4">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev: any) => ({ ...prev, name: event.target.value }))}
                disabled={form.isSystem || !canManage}
              />
            </div>
            
            <div className="grid gap-1.5 shrink-0 mb-4">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(event) => setForm((prev: any) => ({ ...prev, description: event.target.value }))}
                disabled={!canManage}
              />
            </div>
            
            <div className="rounded-md border p-4 flex flex-col min-h-0 flex-1 mb-4">
              <label className="flex items-center gap-2 text-sm font-medium shrink-0 pb-2 border-b">
                <Checkbox
                  checked={form.grantAll}
                  disabled={!canManage}
                  onCheckedChange={(checked) => handleGrantAllToggle(checked as boolean)}
                />
                Grant all permissions
              </label>
              {!form.grantAll && (
                <div className="mt-4 grid gap-3 overflow-y-auto pr-2 text-sm flex-1">
                  {permissionsCatalog.map((permission) => {
                    const checked = form.permissions.includes(permission.id)
                    return (
                      <label key={permission.id} className="flex items-start gap-2">
                        <Checkbox
                          checked={checked}
                          disabled={!canManage}
                          onCheckedChange={() => togglePermission(permission.id as string)}
                        />
                        <span>
                          <span className="font-medium">{permission.name}</span>
                          {permission.description && (
                            <span className="block text-xs text-muted-foreground mt-0.5">{permission.description}</span>
                          )}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/rbac/roles")}>Cancel</Button>
              <Button type="submit" disabled={!canManage || saving}>
                {saving ? "Saving..." : (isNew ? "Create Role" : "Save Changes")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
