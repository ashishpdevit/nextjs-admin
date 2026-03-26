"use client"
import { useMemo, useState, useEffect } from "react"
import { TableCard } from "@/components/admin/table-card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TableLoadingState, TableEmptyState } from "@/components/ui/table-states"
import { PermissionGate } from "@/components/rbac/PermissionGate"
import { useRBAC } from "@/hooks/use-rbac"
import { useRouter } from "next/navigation"
import { useConfirm } from "@/components/ConfirmDialog"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

export function AssignmentManager() {
  const router = useRouter()
  const {
    rolesCatalog,
    assignmentsCatalog,
    hasPermission,
    unassignRole,
    refresh,
    loading,
  } = useRBAC()

  const canManage = hasPermission("rbac:manage")
  const roles = useMemo(() => [...rolesCatalog].sort((a, b) => a.name.localeCompare(b.name)), [rolesCatalog])

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const confirm = useConfirm()

  const handleUnassign = async (assignmentId: string) => {
    if (!canManage) return
    const confirmed = await confirm({
      title: "Revoke Assignment",
      description: "Are you sure you want to revoke this user's role assignment?",
      confirmText: "Revoke",
      variant: "destructive"
    })
    if (!confirmed) return
    try {
      await unassignRole(assignmentId)
      toast.success("Assignment removed")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to remove assignment")
    }
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold leading-none tracking-tight">User assignments</h1>
        <p className="text-sm text-muted-foreground">
          Link user accounts to roles to grant permissions.
        </p>
      </header>

      <TableCard
        title="Active assignments"
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refresh} disabled={isMounted ? loading : false}>
              Refresh
            </Button>
            <PermissionGate allow="rbac:manage">
              <Button onClick={() => router.push("/admin/rbac/assignments/new")}>New assignment</Button>
            </PermissionGate>
          </div>
        }
      >
        {isMounted && loading ? (
          <TableLoadingState message="Loading assignments..." />
        ) : assignmentsCatalog.length === 0 ? (
          <TableEmptyState title="No assignments found" message="Assign a role to a user to get started." />
        ) : (
          <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-32">Type</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignmentsCatalog.map((assignment) => {
              const role = roles.find((candidate) => candidate.id === assignment.roleId)
              return (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.subjectId}</TableCell>
                  <TableCell>{role?.name ?? assignment.roleId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{assignment.subjectType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <PermissionGate allow="rbac:manage">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassign(assignment.id.toString())}
                          title="Remove assignment"
                          aria-label={`Remove ${assignment.subjectId}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
      </TableCard>
    </div>
  )
}
