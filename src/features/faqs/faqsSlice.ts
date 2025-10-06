"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { createFaqApi, deleteFaqApi, fetchFaqsApi, updateFaqApi, type Faq, type FaqsResponse, type FaqsParams, type PaginationMeta, type PaginationLinks } from "./faqsApi"

export const fetchFaqs = createAsyncThunk("faqs/fetch", async (params?: FaqsParams) => fetchFaqsApi(params))
export const createFaq = createAsyncThunk("faqs/create", async (p: Omit<Faq, "id">) => createFaqApi(p))
export const updateFaq = createAsyncThunk("faqs/update", async (p: Faq) => updateFaqApi(p))
export const removeFaq = createAsyncThunk("faqs/remove", async (id: number) => deleteFaqApi(id))

type State = { 
  items: Faq[]
  loading: boolean
  error?: string
  pagination: PaginationMeta
  links: PaginationLinks
}
const initialState: State = { 
  items: [], 
  loading: false,
  pagination: {
    current_page: 1,
    from: 0,
    last_page: 1,
    links: [],
    path: "/api/admin/faqs",
    per_page: 10,
    to: 0,
    total: 0
  },
  links: {
    first: null,
    last: null,
    prev: null,
    next: null
  }
}

const slice = createSlice({
  name: "faqs",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchFaqs.pending, (s) => { s.loading = true; s.error = undefined })
      .addCase(fetchFaqs.fulfilled, (s, a: PayloadAction<FaqsResponse>) => { 
        s.loading = false
        s.items = a.payload?.data || []
        s.pagination = {
          current_page: a.payload?.meta?.current_page || 1,
          last_page: a.payload?.meta?.last_page || 1,
          per_page: a.payload?.meta?.per_page || 10,
          total: a.payload?.meta?.total || 0,
          from: a.payload?.meta?.from || 0,
          to: a.payload?.meta?.to || 0,
          links: a.payload?.meta?.links || [],
          path: a.payload?.meta?.path || "/api/admin/faqs"
        }
        s.links = a.payload?.links || {
          first: null,
          last: null,
          prev: null,
          next: null
        }
      })
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
export const selectFaqsPagination = (s: RootState) => s.faqs.pagination
export const selectFaqsLinks = (s: RootState) => s.faqs.links

