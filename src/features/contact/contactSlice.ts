"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { deleteContactMessageApi, fetchContactMessagesApi, type ContactMessage } from "./contactApi"

export const fetchMessages = createAsyncThunk("contact/fetch", async () => fetchContactMessagesApi())
export const removeMessage = createAsyncThunk("contact/remove", async (id: number) => deleteContactMessageApi(id))

type State = { items: ContactMessage[]; loading: boolean; error?: string }
const initialState: State = { items: [], loading: false }

const slice = createSlice({
  name: "contact",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMessages.pending, (s) => { s.loading = true; s.error = undefined })
      .addCase(fetchMessages.fulfilled, (s, a: PayloadAction<ContactMessage[]>) => { s.loading = false; s.items = a.payload })
      .addCase(fetchMessages.rejected, (s, a) => { s.loading = false; s.error = a.error.message })
      .addCase(removeMessage.fulfilled, (s, a: PayloadAction<number>) => {
        s.items = s.items.filter((m) => m.id !== a.payload)
      })
  }
})

export default slice.reducer
export const selectContact = (s: RootState) => s.contact.items
export const selectContactLoading = (s: RootState) => s.contact.loading

