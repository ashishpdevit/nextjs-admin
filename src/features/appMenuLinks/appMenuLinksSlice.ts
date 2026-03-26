"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { fetchAppMenuLinksApi, updateAppMenuLinkApi, createAppMenuLinkApi, type AppMenuLink } from "./appMenuLinksApi"

export const fetchAppMenuLinks = createAsyncThunk("appMenuLinks/fetch", async () => fetchAppMenuLinksApi())
export const saveAppMenuLink = createAsyncThunk("appMenuLinks/save", async (payload: any) => {
  if (payload.id) {
    return updateAppMenuLinkApi(payload as AppMenuLink)
  }
  return createAppMenuLinkApi(payload)
})

type State = { items: AppMenuLink[]; loading: boolean; error?: string }
const initialState: State = { items: [], loading: false }

const slice = createSlice({
  name: "appMenuLinks",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAppMenuLinks.pending, (s) => { s.loading = true; s.error = undefined })
      .addCase(fetchAppMenuLinks.fulfilled, (s, a: PayloadAction<AppMenuLink[]>) => { s.loading = false; s.items = a.payload })
      .addCase(fetchAppMenuLinks.rejected, (s, a) => { s.loading = false; s.error = a.error.message })
      .addCase(saveAppMenuLink.fulfilled, (s, a: PayloadAction<AppMenuLink>) => {
        const idx = s.items.findIndex((i) => i.id === a.payload.id)
        if (idx !== -1) {
          s.items[idx] = a.payload
        } else {
          s.items.unshift(a.payload)
        }
      })
  }
})

export default slice.reducer
export const selectAppMenuLinks = (s: RootState) => s.appMenuLinks.items
export const selectAppMenuLinksLoading = (s: RootState) => s.appMenuLinks.loading

