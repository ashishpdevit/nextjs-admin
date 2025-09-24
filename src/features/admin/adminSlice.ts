"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { fetchAdminsApi, type Admin } from "./adminApi"

export const fetchAdmins = createAsyncThunk("admins/fetch", async () => {
  const data = await fetchAdminsApi()
  return data
})

type AdminsState = {
  items: Admin[]
  loading: boolean
  error?: string
}

const initialState: AdminsState = { items: [], loading: false }

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
        state.items = action.payload
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
