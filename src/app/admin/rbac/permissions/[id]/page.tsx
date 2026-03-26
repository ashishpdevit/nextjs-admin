"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRBAC } from "@/hooks/use-rbac"
import { toast } from "sonner"

export default function PermissionFormPage() {
  const router = useRouter()
  const params = useParams()
  
  const idStr = params?.id as string
  const isNew = idStr === "new"
  
  const { modulesCatalog, permissionsCatalog, savePermission, hasPermission, loading } = useRBAC()
  const canManage = hasPermission("rbac:manage")
  
  const [form, setForm] = useState<any>({ name: "", description: "", resource: "", action: "" })
  const [saving, setSaving] = useState(false)
  const [init, setInit] = useState(false)

  // Wait for loading to finish and catalogs to hydrate
  useEffect(() => {
    if (!loading && !init && modulesCatalog.length > 0) {
      if (!isNew) {
        const existing = permissionsCatalog.find(p => p.id?.toString() === idStr)
        if (existing) {
          setForm({
            id: existing.id,
            name: existing.name,
            description: existing.description ?? "",
            resource: existing.resource,
            action: existing.action,
          })
        }
      } else {
        setForm((prev: any) => ({ ...prev, resource: modulesCatalog[0]?.resource ?? "" }))
      }
      setInit(true)
    }
  }, [loading, init, isNew, idStr, permissionsCatalog, modulesCatalog])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManage) return
    if (!form.name.trim()) {
      toast.error("Permission name is required")
      return
    }
    if (!form.resource.trim()) {
      toast.error("Select a module for this permission")
      return
    }
    if (!form.action.trim()) {
      toast.error("Permission action is required")
      return
    }
    try {
      setSaving(true)
      await savePermission({
        id: isNew ? undefined : form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        resource: form.resource.trim().toLowerCase(),
        action: form.action.trim().toLowerCase(),
        key: `${form.resource.trim().toLowerCase()}:${form.action.trim().toLowerCase()}`,
      } as any)
      toast.success(isNew ? "Permission created" : "Permission updated")
      router.push("/admin/rbac/permissions")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to save permission")
    } finally {
      setSaving(false)
    }
  }

  if (!init) return <div className="p-4 text-sm text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-4 max-w-2xl max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {isNew ? "Create Permission" : "Edit Permission"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Granular permissions that can be assigned to roles.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-1.5 shrink-0">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev: any) => ({ ...prev, name: event.target.value }))}
                disabled={!canManage}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Module / resource</label>
                <Select
                  value={form.resource}
                  onChange={(event) => setForm((prev: any) => ({ ...prev, resource: event.target.value }))}
                  disabled={!canManage}
                >
                  <option value="" disabled>Select module</option>
                  {modulesCatalog.map((module) => (
                    <option key={module.id} value={module.resource}>
                      {module.name} ({module.resource})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Action</label>
                <Input
                  value={form.action}
                  onChange={(event) => setForm((prev: any) => ({ ...prev, action: event.target.value }))}
                  placeholder="view"
                  disabled={!canManage}
                />
              </div>
            </div>
            
            <div className="grid gap-1.5 shrink-0">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(event) => setForm((prev: any) => ({ ...prev, description: event.target.value }))}
                disabled={!canManage}
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/rbac/permissions")}>Cancel</Button>
              <Button type="submit" disabled={!canManage || saving}>
                {saving ? "Saving..." : (isNew ? "Create Permission" : "Save Changes")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
