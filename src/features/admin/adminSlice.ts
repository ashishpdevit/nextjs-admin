"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { fetchAdminsApi, type Admin, type AdminsParams, type AdminsResponse } from "./adminApi"

export const fetchAdmins = createAsyncThunk("admins/fetch", async (params?: AdminsParams) => {
  const response = await fetchAdminsApi(params)
  return response
})

type AdminsState = {
  items: Admin[]
  loading: boolean
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
  reducers: {
    addAdmin(state, action: PayloadAction<Omit<Admin, "id">>) {
      const nextId = (state.items.reduce((m, u) => Math.max(m, u.id), 0) || 0) + 1
      state.items.unshift({ id: nextId, ...action.payload })
    },
    updateAdmin(state, action: PayloadAction<Admin>) {
      const idx = state.items.findIndex((u) => u.id === action.payload.id)
      if (idx !== -1) state.items[idx] = action.payload
    },
    toggleStatus(state, action: PayloadAction<number>) {
      const admin = state.items.find((u) => u.id === action.payload)
      if (admin) admin.status = admin.status === "Active" ? "Inactive" : "Active"
    },
    removeAdmin(state, action: PayloadAction<number>) {
      state.items = state.items.filter((u) => u.id !== action.payload)
    },
  },
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
  },
})

export const { addAdmin, updateAdmin, toggleStatus, removeAdmin } = adminsSlice.actions
export default adminsSlice.reducer

export const selectAdmins = (s: RootState) => s.admins.items
export const selectAdminsLoading = (s: RootState) => s.admins.loading
export const selectAdminsError = (s: RootState) => s.admins.error
export const selectAdminsPagination = (s: RootState) => s.admins.pagination
export const selectAdminsLinks = (s: RootState) => s.admins.links
