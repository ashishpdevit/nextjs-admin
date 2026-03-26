"use client"
import { useMemo, useState, useEffect } from "react"
import { TableCard } from "@/components/admin/table-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TableLoadingState, TableEmptyState } from "@/components/ui/table-states"
import { PermissionGate } from "@/components/rbac/PermissionGate"
import { useRouter } from "next/navigation"
import { useRBAC } from "@/hooks/use-rbac"
import { useConfirm } from "@/components/ConfirmDialog"
import type { Permission } from "@/features/rbac/rbacTypes"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"

export function PermissionManager() {
  const router = useRouter()
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

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const confirm = useConfirm()

  const handleDelete = async (permission: Permission) => {
    if (!canManage) return
    const confirmed = await confirm({
      title: "Delete Permission",
      description: `Are you sure you want to delete permission "${permission.name}" (${permission.id})?`,
      confirmText: "Delete",
      variant: "destructive"
    })
    if (!confirmed) return
    try {
      await removePermission(permission.id.toString())
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
              <Button onClick={() => router.push("/admin/rbac/permissions/new")}>New permission</Button>
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
                        onClick={() => router.push(`/admin/rbac/permissions/${permission.id}`)}
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
    </div>
  )
}
