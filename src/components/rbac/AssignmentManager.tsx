"use client"
import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableCard } from "@/components/admin/table-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PermissionGate } from "@/components/rbac/PermissionGate"
import { useRBAC } from "@/hooks/use-rbac"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

type AssignmentFormState = {
  email: string
  roleId: string
}

export function AssignmentManager() {
  const {
    rolesCatalog,
    assignmentsCatalog,
    hasPermission,
    assignRole,
    unassignRole,
    refresh,
    loading,
  } = useRBAC()

  const canManage = hasPermission("rbac:manage")
  const roles = useMemo(() => [...rolesCatalog].sort((a, b) => a.name.localeCompare(b.name)), [rolesCatalog])

  const [form, setForm] = useState<AssignmentFormState>({ email: "", roleId: roles[0]?.id ?? "" })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canManage) return
    if (!form.email.trim() || !form.roleId) {
      toast.error("Email and role are required")
      return
    }
    try {
      setSaving(true)
      await assignRole({
        id: undefined,
        subjectId: form.email.trim().toLowerCase(),
        subjectType: "user",
        roleId: form.roleId,
      })
      toast.success("Role assigned")
      setForm({ email: "", roleId: form.roleId })
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to assign role")
    } finally {
      setSaving(false)
    }
  }

  const handleUnassign = async (assignmentId: string) => {
    if (!canManage) return
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

      <Card>
        <CardHeader>
          <CardTitle>Assign role to user</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[2fr,2fr,auto] md:items-end" onSubmit={handleSubmit}>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">User email</label>
              <Input
                type="email"
                placeholder="jane.doe@example.com"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                disabled={!canManage}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={form.roleId}
                onChange={(event) => setForm((prev) => ({ ...prev, roleId: event.target.value }))}
                disabled={!canManage || !roles.length}
              >
                <option value="" disabled>
                  Select role
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </div>
            <PermissionGate allow="rbac:manage">
              <Button type="submit" disabled={saving}>
                {saving ? "Assigning..." : "Assign"}
              </Button>
            </PermissionGate>
          </form>
        </CardContent>
      </Card>

      <TableCard
        title="Active assignments"
        right={
          <Button variant="outline" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        }
      >
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
                          onClick={() => handleUnassign(assignment.id)}
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
            {!assignmentsCatalog.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  No assignments yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableCard>
    </div>
  )
}
