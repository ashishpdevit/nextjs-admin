"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { fetchAdminsApi, createAdminApi, updateAdminApi, toggleAdminStatusApi, deleteAdminApi, type Admin, type AdminsParams, type AdminsResponse } from "./adminApi"

export const fetchAdmins = createAsyncThunk("admins/fetch", async (params?: AdminsParams) => {
  const response = await fetchAdminsApi(params)
  return response
})

export const addAdmin = createAsyncThunk("admins/add", async (data: Partial<Admin> & { password?: string }) => {
  const response = await createAdminApi(data)
  return response
})

export const updateAdmin = createAsyncThunk("admins/update", async (data: Partial<Admin> & { password?: string; id: number }) => {
  const response = await updateAdminApi(data)
  return response
})

export const toggleStatus = createAsyncThunk("admins/toggleStatus", async (id: number) => {
  const response = await toggleAdminStatusApi(id)
  return response
})

export const removeAdmin = createAsyncThunk("admins/remove", async (id: number) => {
  await deleteAdminApi(id)
  return id
})

type AdminsState = {
  items: Admin[]
  loading: boolean
  actionLoading: boolean
  error?: string
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

const initialState: AdminsState = { 
  items: [], 
  loading: false,
  actionLoading: false,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  },
  links: {
    first: null,
    last: null,
    prev: null,
    next: null
  }
}

const adminsSlice = createSlice({
  name: "admins",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload?.data || []
        state.pagination = {
          current_page: action.payload?.meta?.current_page || 1,
          last_page: action.payload?.meta?.last_page || 1,
          per_page: action.payload?.meta?.per_page || 10,
          total: action.payload?.meta?.total || 0,
          from: action.payload?.meta?.from || 0,
          to: action.payload?.meta?.to || 0
        }
        state.links = action.payload?.links || {
          first: null,
          last: null,
          prev: null,
          next: null
        }
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to load admins"
      })
      .addCase(addAdmin.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.items.unshift(action.payload.data)
        }
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        if (action.payload?.data) {
          const updated = action.payload.data
          const idx = state.items.findIndex(u => u.id === updated.id)
          if (idx !== -1) {
            state.items[idx] = updated
          }
        }
      })
      .addCase(toggleStatus.fulfilled, (state, action) => {
        if (action.payload?.data) {
          const updated = action.payload.data
          const idx = state.items.findIndex(u => u.id === updated.id)
          if (idx !== -1) {
            state.items[idx].status = updated.status
          }
        }
      })
      .addCase(removeAdmin.fulfilled, (state, action) => {
        state.items = state.items.filter(u => u.id !== action.payload)
      })
  },
})

export default adminsSlice.reducer

export const selectAdmins = (s: RootState) => s.admins.items
export const selectAdminsLoading = (s: RootState) => s.admins.loading
export const selectAdminsError = (s: RootState) => s.admins.error
export const selectAdminsPagination = (s: RootState) => s.admins.pagination
export const selectAdminsLinks = (s: RootState) => s.admins.links
