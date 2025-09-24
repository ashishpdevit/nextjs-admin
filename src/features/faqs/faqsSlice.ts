"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { createFaqApi, deleteFaqApi, fetchFaqsApi, updateFaqApi, type Faq } from "./faqsApi"

export const fetchFaqs = createAsyncThunk("faqs/fetch", async () => fetchFaqsApi())
export const createFaq = createAsyncThunk("faqs/create", async (p: Omit<Faq, "id">) => createFaqApi(p))
export const updateFaq = createAsyncThunk("faqs/update", async (p: Faq) => updateFaqApi(p))
export const removeFaq = createAsyncThunk("faqs/remove", async (id: number) => deleteFaqApi(id))

type State = { items: Faq[]; loading: boolean; error?: string }
const initialState: State = { items: [], loading: false }

const slice = createSlice({
  name: "faqs",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchFaqs.pending, (s) => { s.loading = true; s.error = undefined })
      .addCase(fetchFaqs.fulfilled, (s, a: PayloadAction<Faq[]>) => { s.loading = false; s.items = a.payload })
      .addCase(fetchFaqs.rejected, (s, a) => { s.loading = false; s.error = a.error.message })
      .addCase(createFaq.fulfilled, (s, a: PayloadAction<Faq>) => { s.items = [a.payload, ...s.items] })
      .addCase(updateFaq.fulfilled, (s, a: PayloadAction<Faq>) => {
        const idx = s.items.findIndex((i) => i.id === a.payload.id)
        if (idx !== -1) s.items[idx] = a.payload
      })
      .addCase(removeFaq.fulfilled, (s, a: PayloadAction<number>) => { s.items = s.items.filter((i) => i.id !== a.payload) })
  }
})

export default slice.reducer
export const selectFaqs = (s: RootState) => s.faqs.items
export const selectFaqsLoading = (s: RootState) => s.faqs.loading

