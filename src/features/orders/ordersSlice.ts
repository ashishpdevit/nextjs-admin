"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { fetchOrdersApi, createOrderApi, updateOrderApi, deleteOrderApi, type Order, type OrdersParams, type OrdersResponse } from "./ordersApi"

export const fetchOrders = createAsyncThunk("orders/fetch", async (params?: OrdersParams) => {
  const response = await fetchOrdersApi(params)
  return response
})

export const createOrder = createAsyncThunk("orders/create", async (payload: Omit<Order, "id">) => {
  const data = await createOrderApi(payload)
  return data
})

export const updateOrder = createAsyncThunk("orders/update", async (payload: Order) => {
  const data = await updateOrderApi(payload)
  return data
})

export const removeOrder = createAsyncThunk("orders/remove", async (id: string) => {
  await deleteOrderApi(id)
  return id
})

type OrdersState = {
  items: Order[]
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

const initialState: OrdersState = { 
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

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    toggleStatus(state, action: PayloadAction<string>) {
      const order = state.items.find((o) => o.id === action.payload)
      if (order) {
        const statusMap: { [key: string]: string } = {
          "Pending": "Paid",
          "Paid": "Shipped",
          "Shipped": "Refunded",
          "Refunded": "Pending"
        }
        order.status = statusMap[order.status] || "Pending"
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
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
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to load orders"
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(removeOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((o) => o.id !== action.payload)
      })
  },
})

export const { toggleStatus } = ordersSlice.actions
export default ordersSlice.reducer

export const selectOrders = (s: RootState) => s.orders.items
export const selectOrdersLoading = (s: RootState) => s.orders.loading
export const selectOrdersError = (s: RootState) => s.orders.error
export const selectOrdersPagination = (s: RootState) => s.orders.pagination
export const selectOrdersLinks = (s: RootState) => s.orders.links
