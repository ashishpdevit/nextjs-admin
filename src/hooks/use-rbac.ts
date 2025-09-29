"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import { getCurrentUser } from "@/lib/auth"
import { isRouteAllowed, resolveEffectivePermissions } from "@/lib/rbac"
import {
  deleteAssignment,
  deleteModule,
  deletePermission,
  deleteRole,
  fetchRbacSnapshot,
  resetRbacSnapshot,
  selectRbacAssignments,
  selectRbacLoading,
  selectRbacModules,
  selectRbacPermissions,
  selectRbacRoles,
  upsertAssignment,
  upsertModule,
  upsertPermission,
  upsertRole,
} from "@/store/rbac"
import type {
  Module,
  Permission,
  Role,
  RoleAssignment,
  UpsertAssignmentPayload,
  UpsertModulePayload,
  UpsertPermissionPayload,
  UpsertRolePayload,
} from "@/features/rbac/rbacTypes"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

type UseRbacOptions = {
  subjectId?: string
  subjectType?: RoleAssignment["subjectType"]
}

type UseRbacResult = {
  loading: boolean
  role: Role | null
  permissions: string[]
  roleId: string | null
  modulesCatalog: Module[]
  rolesCatalog: Role[]
  permissionsCatalog: Permission[]
  assignmentsCatalog: RoleAssignment[]
  hasPermission: (permission: string) => boolean
  canAccessRoute: (pathname: string) => boolean
  refresh: () => void
  saveModule: (payload: UpsertModulePayload) => Promise<void>
  removeModule: (moduleId: string) => Promise<void>
  savePermission: (payload: UpsertPermissionPayload) => Promise<void>
  removePermission: (permissionId: string) => Promise<void>
  saveRole: (payload: UpsertRolePayload) => Promise<void>
  removeRole: (roleId: string) => Promise<void>
  assignRole: (payload: UpsertAssignmentPayload) => Promise<void>
  unassignRole: (assignmentId: string) => Promise<void>
  reset: () => Promise<void>
}

export function useRBAC(options: UseRbacOptions = {}): UseRbacResult {
  const dispatch = useAppDispatch()
  const modules = useAppSelector(selectRbacModules)
  const roles = useAppSelector(selectRbacRoles)
  const permissionsCatalog = useAppSelector(selectRbacPermissions)
  const assignments = useAppSelector(selectRbacAssignments)
  const loading = useAppSelector(selectRbacLoading)
  const [subjectId, setSubjectId] = useState<string | null>(options.subjectId ?? null)
  const subjectType = options.subjectType ?? "user"
  const [fallbackRoleId, setFallbackRoleId] = useState<string | null>(null)

  useEffect(() => {
    if (options.subjectId) setSubjectId(options.subjectId)
  }, [options.subjectId])

  useEffect(() => {
    if (!subjectId) {
      const current = getCurrentUser()
      if (current?.email) setSubjectId(current.email)
      if (current?.roleId) setFallbackRoleId(current.roleId)
      else if (current?.role) setFallbackRoleId(current.role)
    }
  }, [subjectId])

  useEffect(() => {
    if (!modules.length && !roles.length && !permissionsCatalog.length && !loading) {
      dispatch(fetchRbacSnapshot())
    }
  }, [dispatch, loading, modules.length, permissionsCatalog.length, roles.length])

  const assignment = useMemo(() => {
    if (!subjectId) return null
    return (
      assignments.find(
        (candidate) => candidate.subjectId === subjectId && candidate.subjectType === subjectType,
      ) ?? null
    )
  }, [assignments, subjectId, subjectType])

  const role = useMemo(() => {
    const roleId = assignment?.roleId ?? fallbackRoleId
    if (!roleId) return null
    return roles.find((candidate) => candidate.id === roleId) ?? null
  }, [assignment, fallbackRoleId, roles])

  const effectivePermissions = useMemo(
    () => resolveEffectivePermissions(role, permissionsCatalog),
    [role, permissionsCatalog],
  )

  const hasPermission = useCallback(
    (permission: string) => !!role && (role.permissions.includes("*") || effectivePermissions.includes(permission)),
    [role, effectivePermissions],
  )

  const canAccessRoute = useCallback(
    (pathname: string) => isRouteAllowed(pathname, role, permissionsCatalog),
    [role, permissionsCatalog],
  )

  const refresh = useCallback(() => {
    dispatch(fetchRbacSnapshot())
  }, [dispatch])

  const saveModule = useCallback(
    async (payload: UpsertModulePayload) => {
      await dispatch(upsertModule(payload)).unwrap()
    },
    [dispatch],
  )

  const removeModule = useCallback(
    async (moduleId: string) => {
      await dispatch(deleteModule(moduleId)).unwrap()
    },
    [dispatch],
  )

  const savePermission = useCallback(
    async (payload: UpsertPermissionPayload) => {
      await dispatch(upsertPermission(payload)).unwrap()
    },
    [dispatch],
  )

  const removePermission = useCallback(
    async (permissionId: string) => {
      await dispatch(deletePermission(permissionId)).unwrap()
    },
    [dispatch],
  )

  const saveRole = useCallback(
    async (payload: UpsertRolePayload) => {
      await dispatch(upsertRole(payload)).unwrap()
    },
    [dispatch],
  )

  const removeRole = useCallback(
    async (roleId: string) => {
      await dispatch(deleteRole(roleId)).unwrap()
    },
    [dispatch],
  )

  const assignRole = useCallback(
    async (payload: UpsertAssignmentPayload) => {
      await dispatch(upsertAssignment(payload)).unwrap()
    },
    [dispatch],
  )

  const unassignRole = useCallback(
    async (assignmentId: string) => {
      await dispatch(deleteAssignment(assignmentId)).unwrap()
    },
    [dispatch],
  )

  const reset = useCallback(async () => {
    await dispatch(resetRbacSnapshot()).unwrap()
  }, [dispatch])

  return {
    loading,
    role,
    permissions: effectivePermissions,
    roleId: role?.id ?? null,
    modulesCatalog: modules,
    rolesCatalog: roles,
    permissionsCatalog,
    assignmentsCatalog: assignments,
    hasPermission,
    canAccessRoute,
    refresh,
    saveModule,
    removeModule,
    savePermission,
    removePermission,
    saveRole,
    removeRole,
    assignRole,
    unassignRole,
    reset,
  }
}
