"use client"
import { useMemo, useState } from "react"
import { TableCard } from "@/components/admin/table-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PermissionGate } from "@/components/rbac/PermissionGate"
import { useRBAC } from "@/hooks/use-rbac"
import type { Module } from "@/features/rbac/rbacTypes"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"

type ModuleFormState = {
  id?: string
  name: string
  description: string
  resource: string
  tags: string
}

export function ModuleManager() {
  const {
    modulesCatalog,
    hasPermission,
    saveModule,
    removeModule,
    refresh,
    loading,
  } = useRBAC()

  const canManage = hasPermission("rbac:manage")
  const modules = useMemo(
    () => [...modulesCatalog].sort((a, b) => a.name.localeCompare(b.name)),
    [modulesCatalog],
  )

  const [form, setForm] = useState<ModuleFormState | null>(null)
  const [saving, setSaving] = useState(false)

  const openForm = (module?: Module) => {
    if (!canManage) return
    if (module) {
      setForm({
        id: module.id,
        name: module.name,
        description: module.description ?? "",
        resource: module.resource,
        tags: module.tags?.join(", ") ?? "",
      })
      return
    }
    setForm({
      name: "",
      description: "",
      resource: "",
      tags: "",
    })
  }

  const closeForm = () => setForm(null)

  const handleSubmit = async () => {
    if (!form) return
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
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        resource: form.resource.trim().toLowerCase(),
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      toast.success(form.id ? "Module updated" : "Module created")
      closeForm()
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to save module")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (module: Module) => {
    if (!canManage) return
    const confirmed = window.confirm(
      `Delete module "${module.name}"? Related permissions will also be removed.`,
    )
    if (!confirmed) return
    try {
      await removeModule(module.id)
      toast.success("Module deleted")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to delete module")
    }
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold leading-none tracking-tight">Modules</h1>
        <p className="text-sm text-muted-foreground">
          Define the top-level application areas that own permissions.
        </p>
      </header>

      <TableCard
        title="Module overview"
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refresh} disabled={loading}>
              Refresh
            </Button>
            <PermissionGate allow="rbac:manage">
              <Button onClick={() => openForm()}>New module</Button>
            </PermissionGate>
          </div>
        }
      >
        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-36 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map((module) => (
              <TableRow key={module.id}>
                <TableCell className="font-medium">{module.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{module.resource}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {module.description || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {module.tags?.length
                      ? module.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      : "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <PermissionGate allow="rbac:manage">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openForm(module)}
                        title="Edit module"
                        aria-label={`Edit ${module.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                    <PermissionGate allow="rbac:manage">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(module)}
                        title="Delete module"
                        aria-label={`Delete ${module.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!modules.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  No modules defined yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableCard>

      {form && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-lg rounded-lg border bg-background p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 text-sm font-semibold">
              {form.id ? "Edit module" : "Create module"}
            </div>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm">Name</label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((prev) => prev && { ...prev, name: event.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm">Resource key</label>
                <Input
                  value={form.resource}
                  onChange={(event) => setForm((prev) => prev && { ...prev, resource: event.target.value })}
                  placeholder="orders"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm">Description</label>
                <Input
                  value={form.description}
                  onChange={(event) => setForm((prev) => prev && { ...prev, description: event.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm">Tags (comma separated)</label>
                <Input
                  value={form.tags}
                  onChange={(event) => setForm((prev) => prev && { ...prev, tags: event.target.value })}
                  placeholder="core, beta"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
