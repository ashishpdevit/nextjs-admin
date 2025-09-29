"use client"
import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import {
  deleteAssignmentApi,
  deleteModuleApi,
  deletePermissionApi,
  deleteRoleApi,
  fetchRbacSnapshotApi,
  resetRbacSnapshotApi,
  upsertAssignmentApi,
  upsertModuleApi,
  upsertPermissionApi,
  upsertRoleApi,
} from "./rbacApi"
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
import type { RootState } from "@/store/store"

export const fetchRbacSnapshot = createAsyncThunk("rbac/fetch", async () => fetchRbacSnapshotApi())
export const upsertModule = createAsyncThunk("rbac/upsertModule", async (payload: UpsertModulePayload) => upsertModuleApi(payload))
export const deleteModule = createAsyncThunk("rbac/deleteModule", async (moduleId: string) => {
  await deleteModuleApi(moduleId)
  return moduleId
})
export const upsertPermission = createAsyncThunk(
  "rbac/upsertPermission",
  async (payload: UpsertPermissionPayload) => upsertPermissionApi(payload),
)
export const deletePermission = createAsyncThunk("rbac/deletePermission", async (permissionId: string) => {
  await deletePermissionApi(permissionId)
  return permissionId
})
export const upsertRole = createAsyncThunk("rbac/upsertRole", async (payload: UpsertRolePayload) => upsertRoleApi(payload))
export const deleteRole = createAsyncThunk("rbac/deleteRole", async (roleId: string) => {
  await deleteRoleApi(roleId)
  return roleId
})
export const upsertAssignment = createAsyncThunk(
  "rbac/upsertAssignment",
  async (payload: UpsertAssignmentPayload) => upsertAssignmentApi(payload),
)
export const deleteAssignment = createAsyncThunk("rbac/deleteAssignment", async (assignmentId: string) => {
  await deleteAssignmentApi(assignmentId)
  return assignmentId
})
export const resetRbacSnapshot = createAsyncThunk("rbac/reset", async () => resetRbacSnapshotApi())

type RBACState = {
  modules: Module[]
  roles: Role[]
  permissions: Permission[]
  assignments: RoleAssignment[]
  loading: boolean
  error?: string
  lastFetchedAt?: string
}

const initialState: RBACState = {
  modules: [],
  roles: [],
  permissions: [],
  assignments: [],
  loading: false,
}

const slice = createSlice({
  name: "rbac",
  initialState,
  reducers: {
    hydrateSnapshot(state, action: PayloadAction<RBACSnapshot>) {
      state.modules = action.payload.modules.map((module) => ({ ...module, tags: module.tags ? [...module.tags] : [] }))
      state.roles = action.payload.roles.map((role) => ({ ...role, permissions: [...role.permissions] }))
      state.permissions = action.payload.permissions.map((permission) => ({ ...permission }))
      state.assignments = action.payload.assignments.map((assignment) => ({ ...assignment }))
      state.lastFetchedAt = new Date().toISOString()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRbacSnapshot.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchRbacSnapshot.fulfilled, (state, action) => {
        state.loading = false
        slice.caseReducers.hydrateSnapshot(state, { type: fetchRbacSnapshot.fulfilled.type, payload: action.payload })
      })
      .addCase(fetchRbacSnapshot.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "Failed to load RBAC configuration"
      })
      .addCase(upsertModule.pending, (state) => {
        state.error = undefined
      })
      .addCase(upsertModule.fulfilled, (state, action) => {
        const index = state.modules.findIndex((module) => module.id === action.payload.id)
        if (index >= 0) state.modules[index] = action.payload
        else state.modules.push(action.payload)
      })
      .addCase(upsertModule.rejected, (state, action) => {
        state.error = action.error.message ?? "Unable to save module"
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        const removedModule = state.modules.find((module) => module.id === action.payload)
        state.modules = state.modules.filter((module) => module.id !== action.payload)
        if (removedModule) {
          const resource = removedModule.resource
          const removedPermissionIds = state.permissions
            .filter((permission) => permission.resource === resource)
            .map((permission) => permission.id)
          state.permissions = state.permissions.filter((permission) => permission.resource !== resource)
          if (removedPermissionIds.length) {
            state.roles = state.roles.map((role) => ({
              ...role,
              permissions: role.permissions.filter((permissionId) => !removedPermissionIds.includes(permissionId)),
            }))
          }
        }
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.error = action.error.message ?? "Unable to delete module"
      })
      .addCase(upsertPermission.pending, (state) => {
        state.error = undefined
      })
      .addCase(upsertPermission.fulfilled, (state, action) => {
        const index = state.permissions.findIndex((permission) => permission.id === action.payload.id)
        if (index >= 0) state.permissions[index] = action.payload
        else state.permissions.push(action.payload)
      })
      .addCase(upsertPermission.rejected, (state, action) => {
        state.error = action.error.message ?? "Unable to save permission"
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.permissions = state.permissions.filter((permission) => permission.id !== action.payload)
        state.roles = state.roles.map((role) => ({
          ...role,
          permissions: role.permissions.filter((permissionId) => permissionId !== action.payload),
        }))
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.error = action.error.message ?? "Unable to delete permission"
      })
      .addCase(upsertRole.pending, (state) => {
        state.error = undefined
      })
      .addCase(upsertRole.fulfilled, (state, action) => {
        const index = state.roles.findIndex((role) => role.id === action.payload.id)
        if (index >= 0) state.roles[index] = action.payload
        else state.roles.push(action.payload)
      })
      .addCase(upsertRole.rejected, (state, action) => {
        state.error = action.error.message ?? "Unable to save role"
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((role) => role.id !== action.payload)
        state.assignments = state.assignments.filter((assignment) => assignment.roleId !== action.payload)
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.error = action.error.message ?? "Unable to delete role"
      })
      .addCase(upsertAssignment.pending, (state) => {
        state.error = undefined
      })
      .addCase(upsertAssignment.fulfilled, (state, action) => {
        const index = state.assignments.findIndex((assignment) => assignment.id === action.payload.id)
        if (index >= 0) state.assignments[index] = action.payload
        else state.assignments.push(action.payload)
      })
      .addCase(upsertAssignment.rejected, (state, action) => {
        state.error = action.error.message ?? "Unable to save role assignment"
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter((assignment) => assignment.id !== action.payload)
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.error = action.error.message ?? "Unable to delete role assignment"
      })
      .addCase(resetRbacSnapshot.fulfilled, (state, action) => {
        slice.caseReducers.hydrateSnapshot(state, { type: resetRbacSnapshot.fulfilled.type, payload: action.payload })
      })
  },
})

export const { hydrateSnapshot } = slice.actions
export default slice.reducer

const selectSelf = (state: RootState) => state.rbac

export const selectRbacModules = (state: RootState) => selectSelf(state).modules
export const selectRbacRoles = (state: RootState) => selectSelf(state).roles
export const selectRbacPermissions = (state: RootState) => selectSelf(state).permissions
export const selectRbacAssignments = (state: RootState) => selectSelf(state).assignments
export const selectRbacLoading = (state: RootState) => selectSelf(state).loading
export const selectRbacError = (state: RootState) => selectSelf(state).error

export const makeSelectRoleById = () =>
  createSelector(
    [selectRbacRoles, (_: RootState, roleId: string) => roleId],
    (roles, roleId) => roles.find((role) => role.id === roleId) ?? null,
  )

export const makeSelectPermissionsForRole = () =>
  createSelector(
    [selectRbacPermissions, selectRbacRoles, (_: RootState, roleId: string) => roleId],
    (permissions, roles, roleId) => {
      const role = roles.find((candidate) => candidate.id === roleId)
      if (!role) return [] as string[]
      if (role.permissions.includes("*")) {
        return permissions.map((permission) => permission.id)
      }
      return [...role.permissions]
    },
  )

export const makeSelectAssignmentsForSubject = () =>
  createSelector(
    [selectRbacAssignments, (_: RootState, subjectId: string, subjectType: RoleAssignment["subjectType"]) => ({ subjectId, subjectType })],
    (assignments, args) =>
      assignments.find(
        (assignment) => assignment.subjectId === args.subjectId && assignment.subjectType === args.subjectType,
      ) ?? null,
  )

export const makeSelectPermissionsForSubject = () =>
  createSelector(
    [selectRbacPermissions, selectRbacRoles, selectRbacAssignments, (_: RootState, subjectId: string, subjectType: RoleAssignment["subjectType"]) => ({ subjectId, subjectType })],
    (permissions, roles, assignments, args) => {
      const assignment = assignments.find(
        (candidate) => candidate.subjectId === args.subjectId && candidate.subjectType === args.subjectType,
      )
      if (!assignment) return [] as string[]
      const role = roles.find((candidate) => candidate.id === assignment.roleId)
      if (!role) return [] as string[]
      if (role.permissions.includes("*")) {
        return permissions.map((permission) => permission.id)
      }
      return [...role.permissions]
    },
  )
