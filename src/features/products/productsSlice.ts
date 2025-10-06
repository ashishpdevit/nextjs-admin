"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { fetchProductsApi, createProductApi, updateProductApi, deleteProductApi, type Product, type ProductsParams, type ProductsResponse } from "./productsApi"

export const fetchProducts = createAsyncThunk("products/fetch", async (params?: ProductsParams) => {
  const response = await fetchProductsApi(params)
  return response
})

export const createProduct = createAsyncThunk("products/create", async (payload: Omit<Product, "id">) => {
  const data = await createProductApi(payload)
  return data
})

export const updateProduct = createAsyncThunk("products/update", async (payload: Product) => {
  const data = await updateProductApi(payload)
  return data
})

export const removeProduct = createAsyncThunk("products/remove", async (id: number) => {
  await deleteProductApi(id)
  return id
})

type ProductsState = {
  items: Product[]
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

const initialState: ProductsState = { 
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

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    toggleStatus(state, action: PayloadAction<number>) {
      const product = state.items.find((p) => p.id === action.payload)
      if (product) {
        product.status = product.status === "Active" ? "Hidden" : "Active"
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
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
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to load products"
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload)
      })
  },
})

export const { toggleStatus } = productsSlice.actions
export default productsSlice.reducer

export const selectProducts = (s: RootState) => s.products.items
export const selectProductsLoading = (s: RootState) => s.products.loading
export const selectProductsError = (s: RootState) => s.products.error
export const selectProductsPagination = (s: RootState) => s.products.pagination
export const selectProductsLinks = (s: RootState) => s.products.links
