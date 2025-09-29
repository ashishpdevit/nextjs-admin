export type Permission = {
  id: string
  name: string
  description?: string
  resource: string
  action: string
}

export type Module = {
  id: string
  name: string
  description?: string
  resource: string
  tags?: string[]
}

export type Role = {
  id: string
  name: string
  description?: string
  permissions: string[]
  isSystem?: boolean
}

export type RoleAssignment = {
  id: string
  subjectId: string
  subjectType: "user" | "service" | "api-key"
  roleId: string
}

export type RBACSnapshot = {
  roles: Role[]
  permissions: Permission[]
  assignments: RoleAssignment[]
  modules: Module[]
}

export type UpsertRolePayload = Omit<Role, "id"> & { id?: string }

export type UpsertAssignmentPayload = Omit<RoleAssignment, "id"> & { id?: string }

export type UpsertModulePayload = Omit<Module, "id"> & { id?: string }

export type UpsertPermissionPayload = Omit<Permission, "id"> & { id?: string }
