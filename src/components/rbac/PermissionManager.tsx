"use client"
import { useMemo, useState, useEffect } from "react"
import { TableCard } from "@/components/admin/table-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TableLoadingState, TableEmptyState } from "@/components/ui/table-states"
import { PermissionGate } from "@/components/rbac/PermissionGate"
import { useRBAC } from "@/hooks/use-rbac"
import type { Permission } from "@/features/rbac/rbacTypes"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"

type PermissionFormState = {
  id?: string
  name: string
  description: string
  resource: string
  action: string
}

export function PermissionManager() {
  const {
    modulesCatalog,
    permissionsCatalog,
    hasPermission,
    savePermission,
    removePermission,
    refresh,
    loading,
  } = useRBAC()

  const canManage = hasPermission("rbac:manage")
  const modules = useMemo(
    () => [...modulesCatalog].sort((a, b) => a.name.localeCompare(b.name)),
    [modulesCatalog],
  )

  const [form, setForm] = useState<PermissionFormState | null>(null)
  const [saving, setSaving] = useState(false)

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const openForm = (permission?: Permission) => {
    if (!canManage) return
    if (permission) {
      setForm({
        id: permission.id,
        name: permission.name,
        description: permission.description ?? "",
        resource: permission.resource,
        action: permission.action,
      })
      return
    }
    setForm({
      name: "",
      description: "",
      resource: modules[0]?.resource ?? "",
      action: "",
    })
  }

  const closeForm = () => setForm(null)

  const handleSubmit = async () => {
    if (!form) return
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
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        resource: form.resource.trim().toLowerCase(),
        action: form.action.trim().toLowerCase(),
      })
      toast.success(form.id ? "Permission updated" : "Permission created")
      closeForm()
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to save permission")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (permission: Permission) => {
    if (!canManage) return
    const confirmed = window.confirm(`Delete permission "${permission.name}" (${permission.id})?`)
    if (!confirmed) return
    try {
      await removePermission(permission.id)
      toast.success("Permission deleted")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to delete permission")
    }
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold leading-none tracking-tight">Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Create granular permissions that can be assigned to roles.
        </p>
      </header>

      <TableCard
        title="Permission catalog"
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refresh} disabled={isMounted ? loading : false}>
              Refresh
            </Button>
            <PermissionGate allow="rbac:manage">
              <Button onClick={() => openForm()}>New permission</Button>
            </PermissionGate>
          </div>
        }
      >
        {isMounted && loading ? (
          <TableLoadingState message="Loading permissions..." />
        ) : permissionsCatalog.length === 0 ? (
          <TableEmptyState title="No permissions found" message="Create your first permission to get started." />
        ) : (
          <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-36 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissionsCatalog.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{permission.resource}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{permission.action}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {permission.description || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <PermissionGate allow="rbac:manage">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openForm(permission)}
                        title="Edit permission"
                        aria-label={`Edit ${permission.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                    <PermissionGate allow="rbac:manage">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(permission)}
                        title="Delete permission"
                        aria-label={`Delete ${permission.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </TableCard>

      <Dialog open={!!form} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit permission" : "Create permission"}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((prev) => prev && { ...prev, name: event.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Module / resource</label>
                <Select
                  value={form.resource}
                  onChange={(event) => setForm((prev) => prev && { ...prev, resource: event.target.value })}
                >
                  <option value="" disabled>Select module</option>
                  {modules.map((module) => (
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
                  onChange={(event) => setForm((prev) => prev && { ...prev, action: event.target.value })}
                  placeholder="view"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={form.description}
                  onChange={(event) => setForm((prev) => prev && { ...prev, description: event.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
