"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRBAC } from "@/hooks/use-rbac"
import { toast } from "sonner"

export default function ModuleFormPage() {
  const router = useRouter()
  const params = useParams()
  
  const idStr = params?.id as string
  const isNew = idStr === "new"
  
  const { modulesCatalog, saveModule, hasPermission, loading } = useRBAC()
  const canManage = hasPermission("rbac:manage")
  
  const [form, setForm] = useState<any>({ name: "", description: "", resource: "", tags: "" })
  const [saving, setSaving] = useState(false)
  const [init, setInit] = useState(false)

  useEffect(() => {
    if (!loading && !init) {
      if (!isNew) {
        const existing = modulesCatalog.find(m => m.id?.toString() === idStr)
        if (existing) {
          setForm({
            id: existing.id,
            name: existing.name,
            description: existing.description ?? "",
            resource: existing.resource,
            tags: existing.tags?.join(", ") ?? ""
          })
        }
      }
      setInit(true)
    }
  }, [loading, init, isNew, idStr, modulesCatalog])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManage) return
    if (!form.name.trim()) {
      toast.error("Module name is required")
      return
    }
    if (!form.resource.trim()) {
      toast.error("Module resource key is required")
      return
    }
    try {
      setSaving(true)
      await saveModule({
        id: isNew ? undefined : form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        resource: form.resource.trim().toLowerCase(),
        tags: form.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean),
        key: form.resource.trim().toLowerCase(),
      })
      toast.success(isNew ? "Module created" : "Module updated")
      router.push("/admin/rbac/modules")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to save module")
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
            {isNew ? "Create Module" : "Edit Module"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Define top-level application areas.</p>
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
            <div className="grid gap-1.5 shrink-0">
              <label className="text-sm font-medium">Resource key</label>
              <Input
                value={form.resource}
                onChange={(event) => setForm((prev: any) => ({ ...prev, resource: event.target.value }))}
                placeholder="orders"
                disabled={!canManage}
              />
            </div>
            <div className="grid gap-1.5 shrink-0">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(event) => setForm((prev: any) => ({ ...prev, description: event.target.value }))}
                disabled={!canManage}
              />
            </div>
            <div className="grid gap-1.5 shrink-0">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input
                value={form.tags}
                onChange={(event) => setForm((prev: any) => ({ ...prev, tags: event.target.value }))}
                placeholder="core, beta"
                disabled={!canManage}
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/rbac/modules")}>Cancel</Button>
              <Button type="submit" disabled={!canManage || saving}>
                {saving ? "Saving..." : (isNew ? "Create Module" : "Save Changes")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
