"use client"
import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PermissionGate } from "@/components/rbac/PermissionGate"
import { useRBAC } from "@/hooks/use-rbac"
import type { Permission, Role } from "@/features/rbac/rbacTypes"
import { toast } from "sonner"

type RoleFormState = {
  id?: string
  name: string
  description: string
  permissions: string[]
  grantAll: boolean
  isSystem?: boolean
}

export function RoleManager() {
  const {
    rolesCatalog,
    permissionsCatalog,
    hasPermission,
    saveRole,
    removeRole,
    refresh,
    loading,
  } = useRBAC()

  const canManage = hasPermission("rbac:manage")
  const roles = useMemo(() => [...rolesCatalog].sort((a, b) => a.name.localeCompare(b.name)), [rolesCatalog])
  const permissionsById = useMemo(
    () => new Map(permissionsCatalog.map((permission) => [permission.id, permission] as [string, Permission])),
    [permissionsCatalog],
  )

  const [form, setForm] = useState<RoleFormState | null>(null)
  const [saving, setSaving] = useState(false)

  const openForm = (role?: Role) => {
    if (!canManage) return
    if (role) {
      const grantAll = role.permissions.includes("*")
      setForm({
        id: role.id,
        name: role.name,
        description: role.description ?? "",
        permissions: grantAll ? permissionsCatalog.map((permission) => permission.id) : [...role.permissions],
        grantAll,
        isSystem: role.isSystem,
      })
      return
    }
    setForm({
      name: "",
      description: "",
      permissions: [],
      grantAll: false,
    })
  }

  const closeForm = () => setForm(null)

  const togglePermission = (permissionId: string) => {
    setForm((previous) => {
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
          ? previous.permissions.filter((id) => id !== permissionId)
          : [...previous.permissions, permissionId],
      }
    })
  }

  const handleGrantAllToggle = (checked: boolean) => {
    setForm((previous) => {
      if (!previous) return previous
      return {
        ...previous,
        grantAll: checked,
        permissions: checked ? permissionsCatalog.map((permission) => permission.id) : [],
      }
    })
  }

  const handleSubmit = async () => {
    if (!form) return
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
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        permissions: form.grantAll ? ["*"] : form.permissions,
        isSystem: form.isSystem,
      })
      toast.success(form.id ? "Role updated" : "Role created")
      closeForm()
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to save role")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (role: Role) => {
    if (!canManage || role.isSystem) return
    const confirmed = window.confirm(`Delete role "${role.name}"? This action cannot be undone.`)
    if (!confirmed) return
    try {
      await removeRole(role.id)
      toast.success("Role deleted")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to delete role")
    }
  }

  const renderPermissionBadge = (permissionId: string) => {
    if (permissionId === "*") {
      return (
        <Badge key="all" variant="secondary">
          All permissions
        </Badge>
      )
    }
    const permission = permissionsById.get(permissionId)
    if (!permission) {
      return <Badge key={permissionId}>{permissionId}</Badge>
    }
    return <Badge key={permissionId}>{permission.name}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold leading-none tracking-tight">Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bundle permissions into reusable roles for assignment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
          <PermissionGate allow="rbac:manage">
            <Button onClick={() => openForm()}>New role</Button>
          </PermissionGate>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role list</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-32">Type</TableHead>
                <TableHead className="w-36 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.includes("*")
                        ? renderPermissionBadge("*")
                        : role.permissions.map(renderPermissionBadge)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.isSystem ? "secondary" : "outline"}>
                      {role.isSystem ? "System" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <PermissionGate allow="rbac:manage">
                      <Button variant="outline" size="sm" onClick={() => openForm(role)}>
                        Edit
                      </Button>
                    </PermissionGate>
                    <PermissionGate allow="rbac:manage">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={role.isSystem}
                        onClick={() => handleDelete(role)}
                      >
                        Delete
                      </Button>
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              ))}
              {!roles.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No roles defined yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
              {form.id ? "Edit role" : "Create role"}
            </div>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm">Name</label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((prev) => prev && { ...prev, name: event.target.value })}
                  disabled={form.isSystem}
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm">Description</label>
                <Input
                  value={form.description}
                  onChange={(event) => setForm((prev) => prev && { ...prev, description: event.target.value })}
                />
              </div>
              <div className="rounded-md border p-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={form.grantAll}
                    onChange={(event) => handleGrantAllToggle(event.currentTarget.checked)}
                  />
                  Grant all permissions
                </label>
                {!form.grantAll && (
                  <div className="mt-3 grid max-h-60 gap-2 overflow-y-auto pr-2 text-sm">
                    {permissionsCatalog.map((permission) => {
                      const checked = form.permissions.includes(permission.id)
                      return (
                        <label key={permission.id} className="flex items-start gap-2">
                          <Checkbox
                            checked={checked}
                            onChange={() => togglePermission(permission.id)}
                          />
                          <span>
                            <span className="font-medium">{permission.name}</span>
                            {permission.description && (
                              <span className="block text-xs text-muted-foreground">{permission.description}</span>
                            )}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
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
