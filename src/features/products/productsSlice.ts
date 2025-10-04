"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { fetchProductsApi, createProductApi, updateProductApi, deleteProductApi, type Product } from "./productsApi"

export const fetchProducts = createAsyncThunk("products/fetch", async () => {
  const data = await fetchProductsApi()
  return data
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
}

const initialState: ProductsState = { items: [], loading: false }

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
        state.items = action.payload
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
