import { axios } from "@/lib/axios"
import defaults from "@/mocks/rbac.json"
import type {
  Module,
  Permission,
  RBACSnapshot,
  Role,
  RoleAssignment,
  UpsertAssignmentPayload,
  UpsertModulePayload,
  UpsertPermissionPayload,
  UpsertRolePayload,
} from "./rbacTypes"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
const STORAGE_KEY = "rbac:snapshot:v1"

const DEFAULT_SNAPSHOT: RBACSnapshot = {
  modules: (defaults.modules as Module[]).map((module) => ({ ...module, tags: module.tags ? [...module.tags] : [] })),
  roles: (defaults.roles as Role[]).map((role) => ({ ...role, permissions: [...role.permissions] })),
  permissions: (defaults.permissions as Permission[]).map((permission) => ({ ...permission })),
  assignments: (defaults.assignments as RoleAssignment[]).map((assignment) => ({ ...assignment })),
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function cloneSnapshot(snapshot: RBACSnapshot): RBACSnapshot {
  return {
    modules: snapshot.modules.map((module) => ({ ...module, tags: module.tags ? [...module.tags] : [] })),
    roles: snapshot.roles.map((role) => ({ ...role, permissions: [...role.permissions] })),
    permissions: snapshot.permissions.map((permission) => ({ ...permission })),
    assignments: snapshot.assignments.map((assignment) => ({ ...assignment })),
  }
}

function persistSnapshot(snapshot: RBACSnapshot) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Ignore persistence errors in demo mode
  }
}

function ensureSnapshot(): RBACSnapshot {
  if (typeof window === "undefined") {
    return cloneSnapshot(DEFAULT_SNAPSHOT)
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    persistSnapshot(DEFAULT_SNAPSHOT)
    return cloneSnapshot(DEFAULT_SNAPSHOT)
  }

  try {
    const parsed = JSON.parse(raw) as Partial<RBACSnapshot>
    const snapshot: RBACSnapshot = {
      modules: Array.isArray(parsed.modules)
        ? parsed.modules.map((module) => ({ ...module, tags: module?.tags ? [...module.tags] : [] }))
        : [],
      roles: Array.isArray(parsed.roles)
        ? parsed.roles.map((role) => ({ ...role, permissions: [...(role.permissions ?? [])] }))
        : [],
      permissions: Array.isArray(parsed.permissions)
        ? parsed.permissions.map((permission) => ({ ...permission }))
        : [],
      assignments: Array.isArray(parsed.assignments)
        ? parsed.assignments.map((assignment) => ({ ...assignment }))
        : [],
    }

    if (!snapshot.roles.length || !snapshot.permissions.length || !snapshot.modules.length) {
      persistSnapshot(DEFAULT_SNAPSHOT)
      return cloneSnapshot(DEFAULT_SNAPSHOT)
    }

    return snapshot
  } catch {
    persistSnapshot(DEFAULT_SNAPSHOT)
    return cloneSnapshot(DEFAULT_SNAPSHOT)
  }
}

function sanitizePermissions(allPermissions: Permission[], requested: string[]): string[] {
  if (requested.includes("*")) {
    return ["*"]
  }
  const allowed = new Set(allPermissions.map((permission) => permission.id))
  const next = new Set<string>()
  requested.forEach((permissionId) => {
    if (allowed.has(permissionId)) next.add(permissionId)
  })
  return Array.from(next).sort()
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function generateModuleId(name: string, resource?: string) {
  const base = resource || name
  const slug = slugify(base)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${slug || "module"}-${suffix}`
}

function generateRoleId(name: string) {
  const slug = slugify(name)
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${slug || "role"}-${suffix}`
}

function generateAssignmentId(subjectId: string, roleId: string) {
  const normalizedSubject = subjectId.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
  return `assign-${normalizedSubject}-${roleId}`
}

function computePermissionId(resource: string, action: string) {
  return `${resource}:${action}`.toLowerCase()
}

export async function fetchRbacSnapshotApi(): Promise<RBACSnapshot> {
  if (!USE_MOCK) {
    const response = await axios.get<{success: boolean, message: string, data: RBACSnapshot}>("/api/rbac")
    return response.data.data
  }

  await delay(120)
  return ensureSnapshot()
}

export async function upsertModuleApi(payload: UpsertModulePayload): Promise<Module> {
  if (!USE_MOCK) {
    if (payload.id) {
      const response = await axios.put<{success: boolean, message: string, data: Module}>(`/rbac/modules/${payload.id}`, payload)
      return response.data.data
    }
    const response = await axios.post<{success: boolean, message: string, data: Module}>("/rbac/modules", payload)
    return response.data.data
  }

  const snapshot = ensureSnapshot()
  const id = payload.id ?? generateModuleId(payload.name, payload.resource)
  const existingIndex = snapshot.modules.findIndex((module) => module.id === id)
  const module: Module = {
    id,
    name: payload.name,
    description: payload.description,
    resource: payload.resource,
    tags: payload.tags ? [...payload.tags] : [],
  }

  if (existingIndex >= 0) {
    snapshot.modules[existingIndex] = module
  } else {
    snapshot.modules.push(module)
  }

  persistSnapshot(snapshot)
  return { ...module, tags: module.tags ? [...module.tags] : [] }
}

export async function deleteModuleApi(moduleId: string): Promise<void> {
  if (!USE_MOCK) {
    await axios.delete(`/rbac/modules/${moduleId}`)
    return
  }

  const snapshot = ensureSnapshot()
  const module = snapshot.modules.find((candidate) => candidate.id === moduleId)
  if (!module) {
    throw new Error("Module not found")
  }

  snapshot.modules = snapshot.modules.filter((candidate) => candidate.id !== moduleId)

  // remove permissions belonging to module resource
  const relatedPermissionIds = snapshot.permissions
    .filter((permission) => permission.resource === module.resource)
    .map((permission) => permission.id)

  if (relatedPermissionIds.length) {
    snapshot.permissions = snapshot.permissions.filter((permission) => permission.resource !== module.resource)
    snapshot.roles.forEach((role) => {
      role.permissions = role.permissions.filter((permissionId) => !relatedPermissionIds.includes(permissionId))
    })
  }

  persistSnapshot(snapshot)
}

export async function upsertPermissionApi(payload: UpsertPermissionPayload): Promise<Permission> {
  if (!USE_MOCK) {
    if (payload.id) {
      const response = await axios.put<{success: boolean, message: string, data: Permission}>(`/rbac/permissions/${payload.id}`, payload)
      return response.data.data
    }
    const response = await axios.post<{success: boolean, message: string, data: Permission}>("/rbac/permissions", payload)
    return response.data.data
  }

  const snapshot = ensureSnapshot()
  const id = payload.id ?? computePermissionId(payload.resource, payload.action)
  const permission: Permission = {
    id,
    name: payload.name,
    description: payload.description,
    resource: payload.resource,
    action: payload.action,
  }

  const existingIndex = snapshot.permissions.findIndex((candidate) => candidate.id === id)
  if (existingIndex >= 0) {
    snapshot.permissions[existingIndex] = permission
  } else {
    snapshot.permissions.push(permission)
    snapshot.permissions.sort((a, b) => a.id.localeCompare(b.id))
  }

  persistSnapshot(snapshot)
  return { ...permission }
}

export async function deletePermissionApi(permissionId: string): Promise<void> {
  if (!USE_MOCK) {
    await axios.delete(`/rbac/permissions/${permissionId}`)
    return
  }

  const snapshot = ensureSnapshot()
  const exists = snapshot.permissions.some((permission) => permission.id === permissionId)
  if (!exists) {
    throw new Error("Permission not found")
  }

  snapshot.permissions = snapshot.permissions.filter((permission) => permission.id !== permissionId)
  snapshot.roles.forEach((role) => {
    if (role.permissions.includes(permissionId)) {
      role.permissions = role.permissions.filter((id) => id !== permissionId)
    }
  })

  persistSnapshot(snapshot)
}

export async function upsertRoleApi(payload: UpsertRolePayload): Promise<Role> {
  if (!USE_MOCK) {
    if (payload.id) {
      const response = await axios.put<{success: boolean, message: string, data: Role}>(`/rbac/roles/${payload.id}`, payload)
      return response.data.data
    }
    const response = await axios.post<{success: boolean, message: string, data: Role}>("/rbac/roles", payload)
    return response.data.data
  }

  const snapshot = ensureSnapshot()
  const permissions = sanitizePermissions(snapshot.permissions, payload.permissions)
  const targetId = payload.id ?? generateRoleId(payload.name)
  const existingIndex = snapshot.roles.findIndex((role) => role.id === targetId)

  if (existingIndex >= 0) {
    const existing = snapshot.roles[existingIndex]
    const updated: Role = {
      ...existing,
      name: payload.name,
      description: payload.description,
      permissions,
      isSystem: existing.isSystem,
    }
    snapshot.roles[existingIndex] = updated
    persistSnapshot(snapshot)
    return { ...updated, permissions: [...updated.permissions] }
  }

  const created: Role = {
    id: targetId,
    name: payload.name,
    description: payload.description,
    permissions,
    isSystem: payload.isSystem ?? false,
  }
  snapshot.roles.push(created)
  persistSnapshot(snapshot)
  return { ...created, permissions: [...created.permissions] }
}

export async function deleteRoleApi(roleId: string): Promise<void> {
  if (!USE_MOCK) {
    await axios.delete(`/rbac/roles/${roleId}`)
    return
  }

  const snapshot = ensureSnapshot()
  const target = snapshot.roles.find((role) => role.id === roleId)
  if (!target) {
    throw new Error("Role not found")
  }
  if (target.isSystem) {
    throw new Error("System roles cannot be deleted")
  }

  snapshot.roles = snapshot.roles.filter((role) => role.id !== roleId)
  snapshot.assignments = snapshot.assignments.filter((assignment) => assignment.roleId !== roleId)
  persistSnapshot(snapshot)
}

export async function upsertAssignmentApi(payload: UpsertAssignmentPayload): Promise<RoleAssignment> {
  if (!USE_MOCK) {
    if (payload.id) {
      const response = await axios.put<{success: boolean, message: string, data: RoleAssignment}>(`/rbac/assignments/${payload.id}`, payload)
      return response.data.data
    }
    const response = await axios.post<{success: boolean, message: string, data: RoleAssignment}>("/rbac/assignments", payload)
    return response.data.data
  }

  const snapshot = ensureSnapshot()
  const role = snapshot.roles.find((candidate) => candidate.id === payload.roleId)
  if (!role) {
    throw new Error("Role not found")
  }

  const nextAssignment: RoleAssignment = {
    id: payload.id ?? generateAssignmentId(payload.subjectId, payload.roleId),
    subjectId: payload.subjectId,
    subjectType: payload.subjectType,
    roleId: payload.roleId,
  }

  if (!payload.id) {
    const existingBySubject = snapshot.assignments.find(
      (assignment) =>
        assignment.subjectId === payload.subjectId && assignment.subjectType === payload.subjectType,
    )
    if (existingBySubject) {
      existingBySubject.roleId = payload.roleId
      persistSnapshot(snapshot)
      return { ...existingBySubject }
    }
  }

  const targetIndex = snapshot.assignments.findIndex((assignment) => assignment.id === nextAssignment.id)
  if (targetIndex >= 0) {
    snapshot.assignments[targetIndex] = nextAssignment
  } else {
    snapshot.assignments.push(nextAssignment)
  }

  persistSnapshot(snapshot)
  return { ...nextAssignment }
}

export async function deleteAssignmentApi(assignmentId: string): Promise<void> {
  if (!USE_MOCK) {
    await axios.delete(`/rbac/assignments/${assignmentId}`)
    return
  }

  const snapshot = ensureSnapshot()
  const countBefore = snapshot.assignments.length
  snapshot.assignments = snapshot.assignments.filter((assignment) => assignment.id !== assignmentId)
  if (snapshot.assignments.length === countBefore) {
    throw new Error("Assignment not found")
  }
  persistSnapshot(snapshot)
}

export async function resetRbacSnapshotApi(): Promise<RBACSnapshot> {
  if (!USE_MOCK) {
    const response = await axios.post<{success: boolean, message: string, data: RBACSnapshot}>("/rbac/reset", {})
    return response.data.data
  }

  const snapshot = cloneSnapshot(DEFAULT_SNAPSHOT)
  persistSnapshot(snapshot)
  return snapshot
}
