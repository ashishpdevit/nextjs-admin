"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { fetchAppSettingsApi, updateAppSettingApi, type AppSetting } from "./appSettingsApi"

export const fetchAppSettings = createAsyncThunk("appSettings/fetch", async () => {
  return await fetchAppSettingsApi()
})

export const saveAppSetting = createAsyncThunk("appSettings/save", async (payload: AppSetting) => {
  return await updateAppSettingApi(payload)
})

type State = { items: AppSetting[]; loading: boolean; error?: string }
const initialState: State = { items: [], loading: false }

const slice = createSlice({
  name: "appSettings",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAppSettings.pending, (s) => { s.loading = true; s.error = undefined })
      .addCase(fetchAppSettings.fulfilled, (s, a: PayloadAction<AppSetting[]>) => { s.loading = false; s.items = a.payload })
      .addCase(fetchAppSettings.rejected, (s, a) => { s.loading = false; s.error = a.error.message })
      .addCase(saveAppSetting.fulfilled, (s, a: PayloadAction<AppSetting>) => {
        const idx = s.items.findIndex((i) => i.id === a.payload.id)
        if (idx !== -1) s.items[idx] = a.payload
      })
  }
})

export default slice.reducer
export const selectAppSettings = (s: RootState) => s.appSettings.items
export const selectAppSettingsLoading = (s: RootState) => s.appSettings.loading

