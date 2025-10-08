export type Permission = {
  id: number
  key: string
  name: string
  description?: string
  resource: string
  action: string
  moduleId?: number
  createdAt?: string
  updatedAt?: string
}

export type Module = {
  id: number
  key: string
  name: string
  description?: string
  resource: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export type Role = {
  id: number
  key: string
  name: string
  description?: string
  permissions: number[]  // Array of permission IDs
  isSystem?: boolean
  createdAt?: string
  updatedAt?: string
}

export type RoleAssignment = {
  id: number
  key?: string
  subjectId: string
  subjectType: "user" | "service" | "api-key"
  roleId: number  // Numeric role ID
  createdAt?: string
}

export type RBACSnapshot = {
  roles: Role[]
  permissions: Permission[]
  assignments: RoleAssignment[]
  modules: Module[]
}

export type UpsertRolePayload = Omit<Role, "id" | "createdAt" | "updatedAt"> & { 
  id?: string | number
  key?: string
  permissions: (string | number)[]
}

export type UpsertAssignmentPayload = Omit<RoleAssignment, "id" | "createdAt"> & { 
  id?: string | number
  key?: string
  roleId: string | number
}

export type UpsertModulePayload = Omit<Module, "id" | "createdAt" | "updatedAt"> & { 
  id?: string | number
  key?: string
}

export type UpsertPermissionPayload = Omit<Permission, "id" | "createdAt" | "updatedAt"> & { 
  id?: string | number
  key?: string
  moduleId?: number
}
