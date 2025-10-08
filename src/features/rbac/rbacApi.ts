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
  modules: (defaults.modules as any[]).map((module) => ({ 
    ...module, 
    id: parseInt(module.id) || 1,
    key: module.key || slugify(module.name),
    tags: module.tags ? [...module.tags] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  roles: (defaults.roles as any[]).map((role) => ({ 
    ...role, 
    id: parseInt(role.id) || 1,
    key: role.key || slugify(role.name),
    permissions: role.permissions.map((p: any) => typeof p === 'string' && p === '*' ? p : parseInt(p) || 1),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  permissions: (defaults.permissions as any[]).map((permission) => ({ 
    ...permission,
    id: parseInt(permission.id) || 1,
    key: permission.key || `${permission.resource}:${permission.action}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  assignments: (defaults.assignments as any[]).map((assignment) => ({ 
    ...assignment,
    id: parseInt(assignment.id) || 1,
    key: assignment.key,
    roleId: parseInt(assignment.roleId) || 1,
    createdAt: new Date().toISOString(),
  })),
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

function sanitizePermissions(allPermissions: Permission[], requested: (string | number)[]): number[] {
  if (requested.includes("*" as any)) {
    return allPermissions.map(p => p.id) // Return all permission IDs for wildcard
  }
  const allowed = new Set(allPermissions.map((permission) => permission.id))
  const next = new Set<number>()
  requested.forEach((permissionId) => {
    const numericId = typeof permissionId === 'string' ? parseInt(permissionId) : permissionId
    if (!isNaN(numericId) && allowed.has(numericId)) {
      next.add(numericId)
    }
  })
  return Array.from(next).sort((a, b) => a - b)
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

function generateAssignmentId(subjectId: string, roleId: string | number) {
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
    // Prepare the API payload according to backend requirements
    const apiPayload = {
      key: payload.key || slugify(payload.name),
      name: payload.name,
      description: payload.description,
      resource: payload.resource,
      ...(payload.tags && { tags: payload.tags })
    }

    if (payload.id) {
      const response = await axios.put<{success: boolean, message: string, data: Module}>(`/api/rbac/modules/${payload.id}`, apiPayload)
      return response.data.data
    }
    const response = await axios.post<{success: boolean, message: string, data: Module}>("/api/rbac/modules", apiPayload)
    return response.data.data
  }

  const snapshot = ensureSnapshot()
  const id = payload.id ?? generateModuleId(payload.name, payload.resource)
  const existingIndex = snapshot.modules.findIndex((module) => module.id === id)
  const module: Module = {
    id: typeof id === 'string' ? parseInt(id) || 1 : id,
    key: payload.key || slugify(payload.name),
    name: payload.name,
    description: payload.description,
    resource: payload.resource,
    tags: payload.tags ? [...payload.tags] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    snapshot.modules[existingIndex] = module
  } else {
    snapshot.modules.push(module)
  }

  persistSnapshot(snapshot)
  return { ...module, tags: module.tags ? [...module.tags] : [] }
}

export async function deleteModuleApi(moduleId: string | number): Promise<void> {
  if (!USE_MOCK) {
    await axios.delete(`/api/rbac/modules/${moduleId}`)
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
    // Prepare the API payload according to backend requirements
    const apiPayload = {
      key: payload.key || `${payload.resource}:${payload.action}`,
      name: payload.name,
      description: payload.description,
      resource: payload.resource,
      action: payload.action,
      ...(payload.moduleId && { moduleId: payload.moduleId })
    }

    if (payload.id) {
      const response = await axios.put<{success: boolean, message: string, data: Permission}>(`/api/rbac/permissions/${payload.id}`, apiPayload)
      return response.data.data
    }
    const response = await axios.post<{success: boolean, message: string, data: Permission}>("/api/rbac/permissions", apiPayload)
    return response.data.data
  }

  const snapshot = ensureSnapshot()
  const id = payload.id ?? computePermissionId(payload.resource, payload.action)
  const permission: Permission = {
    id: typeof id === 'string' ? parseInt(id) || 1 : id,
    key: payload.key || `${payload.resource}:${payload.action}`,
    name: payload.name,
    description: payload.description,
    resource: payload.resource,
    action: payload.action,
    moduleId: payload.moduleId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const existingIndex = snapshot.permissions.findIndex((candidate) => candidate.id === (typeof id === 'string' ? parseInt(id) : id))
  if (existingIndex >= 0) {
    snapshot.permissions[existingIndex] = permission
  } else {
    snapshot.permissions.push(permission)
    snapshot.permissions.sort((a, b) => a.id - b.id)
  }

  persistSnapshot(snapshot)
  return { ...permission }
}

export async function deletePermissionApi(permissionId: string | number): Promise<void> {
  if (!USE_MOCK) {
    await axios.delete(`/api/rbac/permissions/${permissionId}`)
    return
  }

  const snapshot = ensureSnapshot()
  const exists = snapshot.permissions.some((permission) => permission.id === permissionId)
  if (!exists) {
    throw new Error("Permission not found")
  }

  const numericPermissionId = typeof permissionId === 'string' ? parseInt(permissionId) : permissionId
  snapshot.permissions = snapshot.permissions.filter((permission) => permission.id !== numericPermissionId)
  snapshot.roles.forEach((role) => {
    if (role.permissions.includes(numericPermissionId)) {
      role.permissions = role.permissions.filter((id) => id !== numericPermissionId)
    }
  })

  persistSnapshot(snapshot)
}

export async function upsertRoleApi(payload: UpsertRolePayload): Promise<Role> {
  if (!USE_MOCK) {
    // Prepare the API payload according to backend requirements
    const apiPayload = {
      key: payload.key || slugify(payload.name),
      name: payload.name,
      description: payload.description,
      isSystem: payload.isSystem || false,
      permissions: payload.permissions.map(p => typeof p === 'string' ? parseInt(p) : p)
    }

    if (payload.id) {
      const response = await axios.put<{success: boolean, message: string, data: Role}>(`/api/rbac/roles/${payload.id}`, apiPayload)
      return response.data.data
    }
    const response = await axios.post<{success: boolean, message: string, data: Role}>("/api/rbac/roles", apiPayload)
    return response.data.data
  }

  const snapshot = ensureSnapshot()
  const permissions = sanitizePermissions(snapshot.permissions, payload.permissions)
  const targetId = payload.id ?? generateRoleId(payload.name)
  const existingIndex = snapshot.roles.findIndex((role) => role.id === (typeof targetId === 'string' ? parseInt(targetId) : targetId))

  if (existingIndex >= 0) {
    const existing = snapshot.roles[existingIndex]
    const updated: Role = {
      ...existing,
      name: payload.name,
      description: payload.description,
      permissions,
      isSystem: existing.isSystem,
      updatedAt: new Date().toISOString(),
    }
    snapshot.roles[existingIndex] = updated
    persistSnapshot(snapshot)
    return { ...updated, permissions: [...updated.permissions] }
  }

  const created: Role = {
    id: typeof targetId === 'string' ? parseInt(targetId) || 1 : targetId,
    key: payload.key || slugify(payload.name),
    name: payload.name,
    description: payload.description,
    permissions,
    isSystem: payload.isSystem ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  snapshot.roles.push(created)
  persistSnapshot(snapshot)
  return { ...created, permissions: [...created.permissions] }
}

export async function deleteRoleApi(roleId: string | number): Promise<void> {
  if (!USE_MOCK) {
    await axios.delete(`/api/rbac/roles/${roleId}`)
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
    // Prepare the API payload according to backend requirements
    const apiPayload = {
      key: payload.key,
      subjectId: payload.subjectId,
      subjectType: payload.subjectType,
      roleId: typeof payload.roleId === 'string' ? parseInt(payload.roleId) : payload.roleId
    }

    if (payload.id) {
      const response = await axios.put<{success: boolean, message: string, data: RoleAssignment}>(`/api/rbac/assignments/${payload.id}`, apiPayload)
      return response.data.data
    }
    const response = await axios.post<{success: boolean, message: string, data: RoleAssignment}>("/api/rbac/assignments", apiPayload)
    return response.data.data
  }

  const snapshot = ensureSnapshot()
  const role = snapshot.roles.find((candidate) => candidate.id === payload.roleId)
  if (!role) {
    throw new Error("Role not found")
  }

  const nextAssignment: RoleAssignment = {
    id: typeof payload.id === 'string' ? parseInt(payload.id) || 1 : (payload.id ?? 1),
    key: payload.key,
    subjectId: payload.subjectId,
    subjectType: payload.subjectType,
    roleId: typeof payload.roleId === 'string' ? parseInt(payload.roleId) : payload.roleId,
    createdAt: new Date().toISOString(),
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

export async function deleteAssignmentApi(assignmentId: string | number): Promise<void> {
  if (!USE_MOCK) {
    await axios.delete(`/api/rbac/assignments/${assignmentId}`)
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
    const response = await axios.post<{success: boolean, message: string, data: RBACSnapshot}>("/api/rbac/reset", {})
    return response.data.data
  }

  const snapshot = cloneSnapshot(DEFAULT_SNAPSHOT)
  persistSnapshot(snapshot)
  return snapshot
}
