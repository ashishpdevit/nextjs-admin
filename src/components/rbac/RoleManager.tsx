"use client"
import { useMemo, useState, useEffect } from "react"
import { TableCard } from "@/components/admin/table-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PermissionGate } from "@/components/rbac/PermissionGate"
import { useRouter } from "next/navigation"
import { useRBAC } from "@/hooks/use-rbac"
import type { Permission, Role } from "@/features/rbac/rbacTypes"
import { useConfirm } from "@/components/ConfirmDialog"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { TableLoadingState, TableEmptyState } from "@/components/ui/table-states"

export function RoleManager() {
  const router = useRouter()
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
    () => new Map(permissionsCatalog.map((permission) => [permission.id?.toString() ?? "", permission] as [string, Permission])),
    [permissionsCatalog],
  )

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const confirm = useConfirm()

  const handleDelete = async (role: Role) => {
    if (!canManage) return
    if (role.isSystem) return
    const confirmed = await confirm({
      title: "Delete Role",
      description: `Are you sure you want to delete the role "${role.name}"? All related user assignments will be invalidated.`,
      confirmText: "Delete",
      variant: "destructive"
    })
    if (!confirmed) return
    try {
      await removeRole(role.id.toString())
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
      return (
        <Badge key={permissionId} variant="outline">
          {permissionId}
        </Badge>
      )
    }
    return (
      <Badge key={permission.id} variant="outline">
        {permission.name}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold leading-none tracking-tight">Roles</h1>
        <p className="text-sm text-muted-foreground">
          Group permissions into reusable access bundles.
        </p>
      </header>

      <TableCard
        title="Role catalog"
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refresh} disabled={isMounted ? loading : false}>
              Refresh
            </Button>
            <PermissionGate allow="rbac:manage">
              <Button onClick={() => router.push("/admin/rbac/roles/new")}>New role</Button>
            </PermissionGate>
          </div>
        }
      >
        {isMounted && loading ? (
          <TableLoadingState message="Loading roles..." />
        ) : roles.length === 0 ? (
          <TableEmptyState 
            title="No roles found"
            message="Create your first role to get started."
          />
        ) : (
          <Table className="admin-table">
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
                <TableCell>{role.description || "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.includes("*")
                      ? renderPermissionBadge("*")
                      : role.permissions.map((p: any) => renderPermissionBadge(p.toString()))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={role.isSystem ? "secondary" : "outline"}>
                    {role.isSystem ? "System" : "Custom"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <PermissionGate allow="rbac:manage">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/rbac/roles/${role.id}`)}
                        title="Edit role"
                        aria-label={`Edit ${role.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                    <PermissionGate allow="rbac:manage">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={role.isSystem}
                        onClick={() => handleDelete(role)}
                        title={role.isSystem ? "System roles cannot be deleted" : "Delete role"}
                        aria-label={role.isSystem ? `${role.name} is system role` : `Delete ${role.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                  </div>
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
        )}
      </TableCard>
    </div>
  )
}
