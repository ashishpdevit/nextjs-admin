"use client"
import { useMemo, useState, useEffect } from "react"
import { TableCard } from "@/components/admin/table-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TableLoadingState, TableEmptyState } from "@/components/ui/table-states"
import { useRouter } from "next/navigation"
import { PermissionGate } from "@/components/rbac/PermissionGate"
import { useRBAC } from "@/hooks/use-rbac"
import { useConfirm } from "@/components/ConfirmDialog"
import type { Module } from "@/features/rbac/rbacTypes"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"

export function ModuleManager() {
  const router = useRouter()
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

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const confirm = useConfirm()

  const handleDelete = async (module: Module) => {
    if (!canManage) return
    const confirmed = await confirm({
      title: "Delete Module",
      description: `Are you sure you want to delete module "${module.name}"? Related permissions will also be removed.`,
      confirmText: "Delete",
      variant: "destructive"
    })
    if (!confirmed) return
    try {
      await removeModule(module.id?.toString() ?? "")
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
            <Button variant="outline" onClick={refresh} disabled={isMounted ? loading : false}>
              Refresh
            </Button>
            <PermissionGate allow="rbac:manage">
              <Button onClick={() => router.push("/admin/rbac/modules/new")}>New module</Button>
            </PermissionGate>
          </div>
        }
      >
        {isMounted && loading ? (
          <TableLoadingState message="Loading modules..." />
        ) : modules.length === 0 ? (
          <TableEmptyState title="No modules found" message="Create your first module to get started." />
        ) : (
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
                        onClick={() => router.push(`/admin/rbac/modules/${module.id}`)}
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
          </TableBody>
        </Table>
        )}
      </TableCard>
    </div>
  )
}
